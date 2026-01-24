import { db } from '$lib/server/db/index.js';
import * as table from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { User } from '$lib/server/db/schema.js';
import { Logger } from '$lib/server/logger.js';

const logger = new Logger('user');

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

export async function getUserById(userId: string): Promise<User | undefined> {
	try {
		const results = await db.select().from(table.user).where(eq(table.user.id, userId));
		return results.at(0);
	} catch (error) {
		logger.error('Failed to get user by id', error, { userId });
		throw error;
	}
}

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

export async function updateUserAge(userId: string, age: number): Promise<void> {
	try {
		await db.update(table.user).set({ age }).where(eq(table.user.id, userId));
		logger.info('User age updated', { userId, age });
	} catch (error) {
		logger.error('Failed to update user age', error, { userId, age });
		throw error;
	}
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
	try {
		await db.update(table.user).set({ passwordHash }).where(eq(table.user.id, userId));
		logger.info('User password updated', { userId });
	} catch (error) {
		logger.error('Failed to update user password', error, { userId });
		throw error;
	}
}

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
