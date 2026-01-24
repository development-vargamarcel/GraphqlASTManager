import { db } from '$lib/server/db/index.js';
import * as table from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { User } from '$lib/server/db/schema.js';
import { Logger } from '$lib/server/logger.js';

const logger = new Logger('user');

/**
 * Retrieves a user by their username.
 * The username is case-insensitive and will be normalized to lowercase.
 *
 * @param username - The username to search for.
 * @returns The user object if found, otherwise undefined.
 */
export async function getUserByUsername(username: string): Promise<User | undefined> {
	try {
		const normalizedUsername = username.toLowerCase();
		const results = await db
			.select()
			.from(table.user)
			.where(eq(table.user.username, normalizedUsername));
		return results.at(0);
	} catch (error) {
		logger.error('Failed to get user by username', error, { username });
		throw error;
	}
}

/**
 * Retrieves a user by their unique ID.
 *
 * @param userId - The unique identifier of the user.
 * @returns The user object if found, otherwise undefined.
 */
export async function getUserById(userId: string): Promise<User | undefined> {
	try {
		const results = await db.select().from(table.user).where(eq(table.user.id, userId));
		return results.at(0);
	} catch (error) {
		logger.error('Failed to get user by id', error, { userId });
		throw error;
	}
}

/**
 * Creates a new user in the database.
 * The username is normalized to lowercase before storage.
 *
 * @param id - The unique identifier for the new user.
 * @param username - The username for the new user.
 * @param passwordHash - The hashed password for the new user.
 * @returns The created user object.
 * @throws Will throw an error if the user cannot be created (e.g., username already taken).
 */
export async function createUser(
	id: string,
	username: string,
	passwordHash: string
): Promise<User> {
	const normalizedUsername = username.toLowerCase();
	const user: User = {
		id,
		username: normalizedUsername,
		passwordHash,
		age: null
	};
	try {
		await db.insert(table.user).values(user);
		logger.info('User created', { userId: id, username: normalizedUsername });
		return user;
	} catch (error) {
		logger.error('Failed to create user', error, { userId: id, username: normalizedUsername });
		throw error;
	}
}

/**
 * Updates the age of a specific user.
 *
 * @param userId - The unique identifier of the user.
 * @param age - The new age to set.
 * @throws Will throw an error if the update fails.
 */
export async function updateUserAge(userId: string, age: number): Promise<void> {
	try {
		await db.update(table.user).set({ age }).where(eq(table.user.id, userId));
		logger.info('User age updated', { userId, age });
	} catch (error) {
		logger.error('Failed to update user age', error, { userId, age });
		throw error;
	}
}

/**
 * Updates the password hash for a specific user.
 *
 * @param userId - The unique identifier of the user.
 * @param passwordHash - The new hashed password.
 * @throws Will throw an error if the update fails.
 */
export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
	try {
		await db.update(table.user).set({ passwordHash }).where(eq(table.user.id, userId));
		logger.info('User password updated', { userId });
	} catch (error) {
		logger.error('Failed to update user password', error, { userId });
		throw error;
	}
}

/**
 * Deletes a user and all associated sessions.
 *
 * @param userId - The unique identifier of the user to delete.
 * @throws Will throw an error if the deletion fails.
 */
export async function deleteUser(userId: string): Promise<void> {
	try {
		await db.delete(table.session).where(eq(table.session.userId, userId));
		await db.delete(table.user).where(eq(table.user.id, userId));
		logger.info('User deleted', { userId });
	} catch (error) {
		logger.error('Failed to delete user', error, { userId });
		throw error;
	}
}
