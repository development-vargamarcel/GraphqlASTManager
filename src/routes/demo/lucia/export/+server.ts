import { json, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth.js';
import * as userFn from '$lib/server/user.js';
import { Logger } from '$lib/server/logger.js';
import type { RequestHandler } from './$types.js';

const logger = new Logger('export-data');

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

		const exportData = {
			user: {
				id: user.id,
				username: user.username,
				age: user.age
			},
			sessions: sessions.map((s) => ({
				id: s.id,
				expiresAt: s.expiresAt,
				ipAddress: s.ipAddress,
				userAgent: s.userAgent
			})),
			exportedAt: new Date().toISOString()
		};

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
