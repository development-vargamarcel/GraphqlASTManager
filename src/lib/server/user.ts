import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { User } from '$lib/server/db/schema';

export async function getUserByUsername(username: string): Promise<User | undefined> {
	const results = await db.select().from(table.user).where(eq(table.user.username, username));
	return results.at(0);
}

export async function createUser(id: string, username: string, passwordHash: string): Promise<User> {
	const user: User = {
		id,
		username,
		passwordHash,
		age: null
	};
	await db.insert(table.user).values(user);
	return user;
}
