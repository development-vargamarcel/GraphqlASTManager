import { fail } from '@sveltejs/kit';
import type { Actions } from './$types.js';
import * as userFn from '$lib/server/user.js';
import * as passwordReset from '$lib/server/password-reset.js';
import { Logger } from '$lib/server/logger.js';

const logger = new Logger('password-reset-request');

export const actions: Actions = {
	default: async ({ request, url }) => {
		const formData = await request.formData();
		const username = formData.get('username');

		if (typeof username !== 'string' || username.length < 3 || username.length > 31) {
			return fail(400, { message: 'Invalid username' });
		}

		try {
			const user = await userFn.getUserByUsername(username);
			if (user) {
				const token = await passwordReset.createPasswordResetToken(user.id);
				const resetLink = `${url.origin}/demo/lucia/login/reset/${token}`;

				// In a real application, send this via email.
				// For demo purposes, we log it to the console.
				logger.info('Password reset link generated', { userId: user.id, resetLink });
				console.log(`\n=== PASSWORD RESET LINK ===\n${resetLink}\n===========================\n`);
			} else {
				// We don't want to reveal if the user exists or not
				logger.info('Password reset requested for non-existent user', { username });
			}
		} catch (error) {
			logger.error('Failed to process password reset request', error, { username });
			return fail(500, { message: 'An unknown error occurred' });
		}

		return {
			message: 'If an account with that username exists, a reset link has been sent (check server logs for demo).'
		};
	}
};
