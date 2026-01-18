import { db } from '$lib/server/db/index.js';
import * as table from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { User } from '$lib/server/db/schema.js';
import { Logger } from '$lib/server/logger.js';

const logger = new Logger('user');

export async function getUserByUsername(username: string): Promise<User | undefined> {
	try {
		const normalizedUsername = username.toLowerCase();
		const results = await db.select().from(table.user).where(eq(table.user.username, normalizedUsername));
		return results.at(0);
	} catch (error) {
		logger.error('Failed to get user by username', error, { username });
		throw error;
	}
}

export async function createUser(id: string, username: string, passwordHash: string): Promise<User> {
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
