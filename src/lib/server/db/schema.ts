import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
}, (table) => {
	return {
		userIdIdx: index('session_user_id_idx').on(table.userId)
	};
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
