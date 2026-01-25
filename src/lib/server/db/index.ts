/**
 * Database initialization module.
 * Establishes the connection to the SQLite database using better-sqlite3
 * and initializes the Drizzle ORM instance.
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { dev } from '$app/environment';
import * as schema from './schema.js';
import { env } from '$env/dynamic/private';
import { Logger } from '$lib/server/logger.js';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const logger = new Logger('db');

const client = new Database(env.DATABASE_URL);
logger.info(`Database client initialized (${dev ? 'dev' : 'prod'} mode)`);

/**
 * The Drizzle ORM database instance.
 * Initialized with the `better-sqlite3` driver and the schema definition.
 */
export const db = drizzle(client, { schema });
