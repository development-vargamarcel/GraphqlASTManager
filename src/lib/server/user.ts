import { db } from '$lib/server/db/index.js';
import * as table from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { User } from '$lib/server/db/schema.js';
import { Logger } from '$lib/server/logger.js';

const logger = new Logger('user');

export async function getUserByUsername(username: string): Promise<User | undefined> {
	try {
		const results = await db.select().from(table.user).where(eq(table.user.username, username));
		return results.at(0);
	} catch (error) {
		logger.error('Failed to get user by username', error, { username });
		throw error;
	}
}

export async function createUser(id: string, username: string, passwordHash: string): Promise<User> {
	const user: User = {
		id,
		username,
		passwordHash,
		age: null
	};
	try {
		await db.insert(table.user).values(user);
		logger.info('User created', { userId: id, username });
		return user;
	} catch (error) {
		logger.error('Failed to create user', error, { userId: id, username });
		throw error;
	}
}
