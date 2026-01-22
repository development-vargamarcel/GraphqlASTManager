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

async function main() {
	console.log('Seeding database...');

	// Clean up existing test user if any
	// Note: We don't have a clean way to truncate without raw SQL or delete
	// But let's just try to insert a new one or ignore if exists.

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
		await db
			.insert(user)
			.values({
				id,
				username,
				passwordHash,
				age: 25
			})
			.onConflictDoNothing();

		console.log(`User created: ${username} / ${password}`);
	} catch (e) {
		console.error('Error seeding user:', e);
	}

	console.log('Seeding complete.');
}

main().catch((e) => {
	console.error('Seeding failed:', e);
	process.exit(1);
});
