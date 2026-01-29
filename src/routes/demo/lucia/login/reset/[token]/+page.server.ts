import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import * as auth from '$lib/server/auth.js';
import * as userFn from '$lib/server/user.js';
import * as passwordReset from '$lib/server/password-reset.js';
import * as validation from '$lib/server/validation.js';
import { Logger } from '$lib/server/logger.js';

const logger = new Logger('password-reset');

export const load: PageServerLoad = async ({ params }) => {
	const { token } = params;
	const userId = await passwordReset.validatePasswordResetToken(token);

	if (!userId) {
		error(400, {
			message: 'Invalid or expired password reset link',
			errorId: crypto.randomUUID()
		});
	}

	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const { request, params } = event;
		const { token } = params;
		const formData = await request.formData();
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');

		if (!validation.validatePassword(password) || !validation.validatePassword(confirmPassword)) {
			return fail(400, { message: 'Invalid password provided' });
		}

		if (password !== confirmPassword) {
			return fail(400, { message: 'Passwords do not match' });
		}

		const userId = await passwordReset.validatePasswordResetToken(token);
		if (!userId) {
			return fail(400, { message: 'Invalid or expired token' });
		}

		try {
			// Invalidate all existing sessions for security
			await auth.invalidateAllUserSessions(userId);

			// Update password
			const passwordHash = await auth.hashPassword(password);
			await userFn.updateUserPassword(userId, passwordHash);

			// Consume token
			await passwordReset.consumePasswordResetToken(token);

			// Create new session (auto-login)
			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, userId);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

			logger.info('Password reset successfully', { userId });
		} catch (e) {
			logger.error('Failed to reset password', e, { userId });
			return fail(500, { message: 'An unknown error occurred' });
		}

		return redirect(302, '/demo/lucia');
	}
};
