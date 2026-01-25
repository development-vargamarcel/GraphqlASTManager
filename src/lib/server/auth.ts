import type { RequestEvent } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase, encodeBase32LowerCase } from '@oslojs/encoding';
import { hash, verify } from '@node-rs/argon2';
import { db } from '$lib/server/db/index.js';
import * as table from '$lib/server/db/schema.js';
import { Logger } from '$lib/server/logger.js';

const logger = new Logger('auth');

export const DAY_IN_MS = 1000 * 60 * 60 * 24;
export const SESSION_EXPIRATION_DAYS = 30;
export const SESSION_RENEWAL_THRESHOLD_DAYS = 15;

export const SESSION_COOKIE_NAME = 'auth-session';

export const SESSION_COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax',
	secure: !dev
} as const;

/**
 * Generates a random session token.
 * Uses 18 bytes of randomness encoded in Base64url.
 *
 * @returns A string representing the session token.
 */
export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

/**
 * Generates a random user ID with 120 bits of entropy.
 * Uses 15 bytes of randomness encoded in Base32 (lowercase).
 *
 * @returns A string representing the user ID.
 */
export function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

/**
 * Creates a new session in the database.
 * The token is hashed before storage.
 *
 * @param token - The raw session token.
 * @param userId - The user ID to associate with the session.
 * @param ipAddress - The IP address of the user (optional).
 * @param userAgent - The User Agent string of the user (optional).
 * @returns The created session object.
 * @throws Will throw an error if the session creation fails.
 */
export async function createSession(
	token: string,
	userId: string,
	ipAddress: string | null = null,
	userAgent: string | null = null
) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: table.Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * SESSION_EXPIRATION_DAYS),
		ipAddress,
		userAgent
	};
	try {
		await db.insert(table.session).values(session);
		logger.info('Session created', { userId, sessionId });
		return session;
	} catch (error) {
		logger.error('Failed to create session', error, { userId });
		throw error;
	}
}

/**
 * Invalidates all sessions for a user except the current one.
 *
 * @param userId - The ID of the user.
 * @param currentSessionId - The ID of the current session to keep.
 * @throws Will throw an error if invalidation fails.
 */
export async function invalidateOtherSessions(userId: string, currentSessionId: string) {
	try {
		const sessions = await getUserSessions(userId);
		for (const session of sessions) {
			if (session.id !== currentSessionId) {
				await db.delete(table.session).where(eq(table.session.id, session.id));
			}
		}
		logger.info('Other sessions invalidated', { userId, currentSessionId });
	} catch (error) {
		logger.error('Failed to invalidate other sessions', error, { userId });
		throw error;
	}
}

/**
 * Retrieves all active sessions for a specific user.
 *
 * @param userId - The unique identifier of the user.
 * @returns A list of session objects.
 */
export async function getUserSessions(userId: string): Promise<table.Session[]> {
	try {
		const sessions = await db.select().from(table.session).where(eq(table.session.userId, userId));
		return sessions;
	} catch (error) {
		logger.error('Failed to get user sessions', error, { userId });
		throw error;
	}
}

/**
 * Validates a session token.
 * Checks against the database and handles session expiration.
 * Implements a sliding window mechanism to renew sessions that are halfway through their expiration.
 *
 * @param token - The raw session token to validate.
 * @returns An object containing the session and user if valid, or nulls if invalid/expired.
 */
export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	try {
		const [result] = await db
			.select({
				user: { id: table.user.id, username: table.user.username },
				session: table.session
			})
			.from(table.session)
			.innerJoin(table.user, eq(table.session.userId, table.user.id))
			.where(eq(table.session.id, sessionId));

		if (!result) {
			return { session: null, user: null };
		}

		const { session, user } = result;
		const now = Date.now();

		if (now >= session.expiresAt.getTime()) {
			await db.delete(table.session).where(eq(table.session.id, session.id));
			return { session: null, user: null };
		}

		// Sliding window: renew if halfway through expiration
		if (now >= session.expiresAt.getTime() - DAY_IN_MS * SESSION_RENEWAL_THRESHOLD_DAYS) {
			session.expiresAt = new Date(now + DAY_IN_MS * SESSION_EXPIRATION_DAYS);
			await db
				.update(table.session)
				.set({ expiresAt: session.expiresAt })
				.where(eq(table.session.id, session.id));
		}

		logger.debug('Session validated', { sessionId: session.id, userId: user.id });
		return { session, user };
	} catch (error) {
		logger.error('Failed to validate session token', error);
		// In case of error (e.g. db connection), we return nulls to fail safe
		return { session: null, user: null };
	}
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

/**
 * Invalidates a session by deleting it from the database.
 *
 * @param sessionId - The ID of the session to invalidate.
 * @throws Will throw an error if invalidation fails.
 */
export async function invalidateSession(sessionId: string) {
	try {
		await db.delete(table.session).where(eq(table.session.id, sessionId));
		logger.info('Session invalidated', { sessionId });
	} catch (error) {
		logger.error('Failed to invalidate session', error, { sessionId });
		throw error;
	}
}

/**
 * Sets the session token as a cookie on the response.
 *
 * @param event - The RequestEvent object.
 * @param token - The session token.
 * @param expiresAt - The expiration date for the cookie.
 */
export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(SESSION_COOKIE_NAME, token, {
		...SESSION_COOKIE_OPTIONS,
		expires: expiresAt
	});
}

/**
 * Hashes a password using Argon2.
 *
 * @param password - The plain text password.
 * @returns The hashed password string.
 */
export async function hashPassword(password: string): Promise<string> {
	return await hash(password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
}

/**
 * Verifies a password against a hash using Argon2.
 *
 * @param hash - The hashed password.
 * @param password - The plain text password to verify.
 * @returns True if the password matches the hash, false otherwise.
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
	return await verify(hash, password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
}

/**
 * Deletes the session token cookie from the response.
 *
 * @param event - The RequestEvent object.
 */
export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS);
}
