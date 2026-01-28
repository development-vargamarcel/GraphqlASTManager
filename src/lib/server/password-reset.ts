import { db } from '$lib/server/db/index.js';
import * as schema from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';

const EXPIRES_IN_MS = 1000 * 60 * 15; // 15 minutes

/**
 * Creates a password reset token for the specified user.
 * Generates a random 32-byte hex token, hashes it, and stores it in the database.
 * Invalidates any existing reset tokens for the user.
 *
 * @param userId - The ID of the user.
 * @returns The raw token string (to be sent to the user).
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
	// Delete existing tokens for user
	await db.delete(schema.passwordResetToken).where(eq(schema.passwordResetToken.userId, userId));

	// Use crypto.randomBytes for Node.js compatibility
	const tokenBytes = crypto.randomBytes(20);
	const token = encodeHexLowerCase(tokenBytes);

	const tokenHash = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	await db.insert(schema.passwordResetToken).values({
		tokenHash,
		userId,
		expiresAt: new Date(Date.now() + EXPIRES_IN_MS)
	});

	return token;
}

/**
 * Validates a password reset token.
 * Checks if the token exists and is not expired.
 *
 * @param token - The raw token string provided by the user.
 * @returns The userId if valid, otherwise null.
 */
export async function validatePasswordResetToken(token: string): Promise<string | null> {
	const tokenHash = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const result = await db
		.select({ userId: schema.passwordResetToken.userId, expiresAt: schema.passwordResetToken.expiresAt })
		.from(schema.passwordResetToken)
		.where(eq(schema.passwordResetToken.tokenHash, tokenHash))
		.limit(1);

	if (result.length < 1) {
		return null;
	}

	const { userId, expiresAt } = result[0];

	if (Date.now() >= expiresAt.getTime()) {
		await db.delete(schema.passwordResetToken).where(eq(schema.passwordResetToken.tokenHash, tokenHash));
		return null;
	}

	return userId;
}

/**
 * Consumes (deletes) a password reset token.
 * Should be called after successful password reset.
 *
 * @param token - The raw token string.
 */
export async function consumePasswordResetToken(token: string): Promise<void> {
	const tokenHash = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	await db.delete(schema.passwordResetToken).where(eq(schema.passwordResetToken.tokenHash, tokenHash));
}
