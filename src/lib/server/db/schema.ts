import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

/**
 * User table definition.
 * Stores user account information.
 */
export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	bio: text('bio'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

/**
 * Session table definition.
 * Stores active user sessions for authentication.
 */
export const session = sqliteTable(
	'session',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent')
	},
	(table) => {
		return {
			userIdIdx: index('session_user_id_idx').on(table.userId)
		};
	}
);

/**
 * Type definition for a Session object inferred from the schema.
 */
export type Session = typeof session.$inferSelect;

/**
 * Type definition for a User object inferred from the schema.
 */
export type User = typeof user.$inferSelect;
