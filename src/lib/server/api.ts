import { db } from '$lib/server/db/index.js';
import * as schema from '$lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';
import crypto from 'node:crypto';
import type { User } from '$lib/server/db/schema.js';

/**
 * Result of validating an API token.
 * Mimics the session validation result but without a session object.
 */
export type ApiTokenValidationResult =
	| { session: null; user: User; token: schema.ApiToken }
	| { session: null; user: null; token: null };

/**
 * Generates a SHA-256 hash of the given token.
 *
 * @param token - The raw token string.
 * @returns The hex string of the hash.
 */
function hashToken(token: string): string {
	return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Creates a new API token for the specified user.
 * Generates a random 32-byte hex string as the token.
 * Stores the SHA-256 hash of the token in the database.
 *
 * @param userId - The ID of the user creating the token.
 * @param name - A descriptive name for the token.
 * @returns An object containing the raw token (to be shown once) and the success message.
 */
export async function createApiToken(
	userId: string,
	name: string
): Promise<{ token: string; message: string }> {
	// Generate 32 bytes of random data
	const tokenBytes = crypto.randomBytes(32);
	const token = tokenBytes.toString('hex');
	const tokenHash = hashToken(token);
	const id = crypto.randomUUID();

	await db.insert(schema.apiToken).values({
		id,
		userId,
		tokenHash,
		name,
		createdAt: new Date()
	});

	return {
		token,
		message: 'API token created successfully. Copy it now, you won’t see it again.'
	};
}

/**
 * Validates an API token.
 * Hashes the provided token and looks up the hash in the database.
 *
 * @param token - The raw token string provided in the request.
 * @returns A validation result containing the user if valid, or nulls if invalid.
 */
export async function validateApiToken(token: string): Promise<ApiTokenValidationResult> {
	const tokenHash = hashToken(token);

	const result = await db
		.select({
			token: schema.apiToken,
			user: schema.user
		})
		.from(schema.apiToken)
		.innerJoin(schema.user, eq(schema.apiToken.userId, schema.user.id))
		.where(eq(schema.apiToken.tokenHash, tokenHash))
		.limit(1);

	if (result.length < 1) {
		return { session: null, user: null, token: null };
	}

	const { user, token: tokenRecord } = result[0];
	return { session: null, user, token: tokenRecord };
}

/**
 * Revokes (deletes) an API token.
 * Users can only revoke their own tokens.
 *
 * @param tokenId - The ID of the token to revoke.
 * @param userId - The ID of the user attempting to revoke the token.
 */
export async function revokeApiToken(tokenId: string, userId: string): Promise<void> {
	await db
		.delete(schema.apiToken)
		.where(and(eq(schema.apiToken.id, tokenId), eq(schema.apiToken.userId, userId)));
}

/**
 * Lists all API tokens for a user.
 * Does not return the token hash for security.
 *
 * @param userId - The ID of the user.
 * @returns A list of API tokens (without hash).
 */
export async function listApiTokens(userId: string) {
	return await db
		.select({
			id: schema.apiToken.id,
			name: schema.apiToken.name,
			createdAt: schema.apiToken.createdAt,
			expiresAt: schema.apiToken.expiresAt
		})
		.from(schema.apiToken)
		.where(eq(schema.apiToken.userId, userId));
}
