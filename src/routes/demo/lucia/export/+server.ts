import { json, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth.js';
import * as userFn from '$lib/server/user.js';
import * as noteFn from '$lib/server/note.js';
import { getUserActivity } from '$lib/server/activity.js';
import { Logger } from '$lib/server/logger.js';
import type { RequestHandler } from './$types.js';

const logger = new Logger('export-data');

/**
 * Handles the data export request.
 * Authenticated users can download their profile, session history, notes, and activity logs as a JSON file.
 */
export const GET: RequestHandler = async (event) => {
	if (!event.locals.user) {
		logger.warn('Unauthorized export attempt');
		return redirect(302, '/demo/lucia/login');
	}

	const userId = event.locals.user.id;
	logger.info('Exporting user data', { userId });

	try {
		// Fetch full user details
		const user = await userFn.getUserById(userId);
		if (!user) {
			logger.error('User not found during export', { userId });
			return json({ message: 'User not found' }, { status: 404 });
		}

		// Fetch user sessions
		const sessions = await auth.getUserSessions(userId);

		// Fetch user notes
		const notes = await noteFn.getUserNotes(userId);

		// Fetch all user activity
		const activityLogs = await getUserActivity(userId, null);

		const exportData = {
			user: {
				id: user.id,
				username: user.username,
				age: user.age,
				bio: user.bio
			},
			sessions: sessions.map((s) => ({
				id: s.id,
				expiresAt: s.expiresAt,
				ipAddress: s.ipAddress,
				userAgent: s.userAgent
			})),
			notes: notes.map((n) => ({
				id: n.id,
				title: n.title,
				content: n.content,
				createdAt: n.createdAt,
				updatedAt: n.updatedAt
			})),
			activityLogs: activityLogs.map((l) => ({
				action: l.action,
				details: l.details,
				timestamp: l.timestamp
			})),
			exportedAt: new Date().toISOString()
		};

		logger.info('User data exported', {
			userId,
			noteCount: notes.length,
			activityLogCount: activityLogs.length
		});

		return json(exportData, {
			headers: {
				'Content-Disposition': `attachment; filename="user-data-${userId}.json"`
			}
		});
	} catch (error) {
		logger.error('Failed to export user data', error, { userId });
		return json({ message: 'An internal error occurred' }, { status: 500 });
	}
};
