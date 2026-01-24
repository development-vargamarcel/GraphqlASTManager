import 'dotenv/config';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { user } from './schema.js';
import { hash } from '@node-rs/argon2';
import { encodeBase32LowerCase } from '@oslojs/encoding';

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not set');
}

const client = new Database(process.env.DATABASE_URL);
const db = drizzle(client);

/**
 * Main function to seed the database with initial data.
 * Creates a default user if they don't already exist.
 */
async function main() {
	const timestamp = new Date().toISOString();
	console.log(
		JSON.stringify({
			timestamp,
			level: 'INFO',
			message: 'Seeding database started',
			dbUrl: process.env.DATABASE_URL
		})
	);

	const username = 'demo';
	const password = 'password123';

	// Hash password
	const passwordHash = await hash(password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	// Generate ID
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);

	try {
		const result = await db
			.insert(user)
			.values({
				id,
				username,
				passwordHash,
				age: 25
			})
			.onConflictDoNothing()
			.returning();

		if (result.length > 0) {
			console.log(
				JSON.stringify({
					timestamp: new Date().toISOString(),
					level: 'INFO',
					message: 'User created',
					username,
					password
				})
			);
		} else {
			console.log(
				JSON.stringify({
					timestamp: new Date().toISOString(),
					level: 'INFO',
					message: 'User already exists, skipped creation',
					username
				})
			);
		}
	} catch (e) {
		console.error(
			JSON.stringify({
				timestamp: new Date().toISOString(),
				level: 'ERROR',
				message: 'Error seeding user',
				error: e instanceof Error ? e.message : e
			})
		);
	}

	console.log(
		JSON.stringify({
			timestamp: new Date().toISOString(),
			level: 'INFO',
			message: 'Seeding complete'
		})
	);
}

main().catch((e) => {
	console.error('Seeding failed:', e);
	process.exit(1);
});
