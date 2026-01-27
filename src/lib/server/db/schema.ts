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
 * Activity Log table definition.
 * Stores user activity history for security and auditing.
 */
export const activityLog = sqliteTable(
	'activity_log',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		action: text('action').notNull(),
		details: text('details'),
		timestamp: integer('timestamp', { mode: 'timestamp' }).notNull()
	},
	(table) => {
		return {
			activityUserIdIdx: index('activity_log_user_id_idx').on(table.userId)
		};
	}
);

/**
 * Note table definition.
 * Stores user personal notes.
 */
export const note = sqliteTable(
	'note',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		title: text('title').notNull(),
		content: text('content').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
	},
	(table) => {
		return {
			noteUserIdIdx: index('note_user_id_idx').on(table.userId)
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

/**
 * Type definition for an Activity Log object inferred from the schema.
 */
export type ActivityLog = typeof activityLog.$inferSelect;

/**
 * Type definition for a Note object inferred from the schema.
 */
export type Note = typeof note.$inferSelect;
