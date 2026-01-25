import * as auth from '$lib/server/auth.js';
import * as userFn from '$lib/server/user.js';
import * as validation from '$lib/server/validation.js';
import { Logger } from '$lib/server/logger.js';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';

const logger = new Logger('lucia-profile');

/**
 * Server load function for the user dashboard.
 * Requires authentication. Returns the user profile data.
 */
export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/demo/lucia/login');
	}
	const user = event.locals.user;

	logger.debug('Loading user profile', { userId: user.id });

	// Fetch fresh user data to get the age
	logger.debug('Fetching fresh user data', { userId: user.id });
	const freshUser = await userFn.getUserById(user.id);
	if (!freshUser) {
		logger.warn('User found in session but not in DB', { userId: user.id });
		return redirect(302, '/demo/lucia/login');
	}
	// Return the fresh user data but ensure we don't leak sensitive info if any
	// The current user object in locals is safe, let's see what getUserById returns.
	// It returns the whole row. We should probably only return safe fields.
	// However, locals.user only has id and username.
	const sessions = await auth.getUserSessions(user.id);

	return {
		user: {
			id: freshUser.id,
			username: freshUser.username,
			age: freshUser.age
		},
		currentSessionId: event.locals.session?.id,
		sessions: sessions.map((s) => ({
			id: s.id,
			expiresAt: s.expiresAt,
			ipAddress: s.ipAddress,
			userAgent: s.userAgent
		}))
	};
};

/**
 * Form actions for user dashboard operations.
 */
export const actions: Actions = {
	/**
	 * Logs out the current user by invalidating the session and deleting the cookie.
	 */
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);

		logger.info('User logged out', { userId: event.locals.user?.id });

		return redirect(302, '/demo/lucia/login');
	},

	/**
	 * Updates the user's profile information (e.g., age).
	 */
	updateProfile: async (event) => {
		if (!event.locals.session || !event.locals.user) {
			return fail(401);
		}

		logger.info('Update profile action initiated', { userId: event.locals.user.id });

		const formData = await event.request.formData();
		const ageStr = formData.get('age');

		if (!ageStr || typeof ageStr !== 'string') {
			logger.debug('Update profile failed: invalid age format', { userId: event.locals.user.id });
			return fail(400, {
				message: 'Invalid age provided',
				errors: { age: 'Invalid age provided' }
			});
		}

		const age = parseInt(ageStr, 10);
		if (isNaN(age) || age < 0 || age > 150) {
			logger.debug('Update profile failed: invalid age range', {
				userId: event.locals.user.id,
				age
			});
			return fail(400, {
				message: 'Invalid age provided',
				errors: { age: 'Invalid age provided' }
			});
		}

		try {
			await userFn.updateUserAge(event.locals.user.id, age);
			logger.info('User age updated', { userId: event.locals.user.id, age });
		} catch (e) {
			logger.error('Failed to update user age', e, { userId: event.locals.user.id });
			return fail(500, { message: 'An unknown error occurred' });
		}

		return { message: 'Profile updated successfully' };
	},

	/**
	 * Changes the user's password.
	 * Verifies the current password before updating to the new one.
	 */
	changePassword: async (event) => {
		if (!event.locals.session || !event.locals.user) {
			return fail(401);
		}

		logger.info('Change password action initiated', { userId: event.locals.user.id });

		const formData = await event.request.formData();
		const currentPassword = formData.get('currentPassword');
		const newPassword = formData.get('newPassword');
		const confirmPassword = formData.get('confirmPassword');

		if (
			!validation.validatePassword(currentPassword) ||
			!validation.validatePassword(newPassword) ||
			!validation.validatePassword(confirmPassword)
		) {
			logger.debug('Change password failed: validation error', { userId: event.locals.user.id });
			return fail(400, {
				message: 'Invalid password provided',
				errors: {
					currentPassword: !validation.validatePassword(currentPassword) ? 'Invalid password' : '',
					newPassword: !validation.validatePassword(newPassword) ? 'Invalid password' : '',
					confirmPassword: !validation.validatePassword(confirmPassword) ? 'Invalid password' : ''
				}
			});
		}

		if (newPassword !== confirmPassword) {
			logger.debug('Change password failed: passwords do not match', {
				userId: event.locals.user.id
			});
			return fail(400, {
				message: 'Passwords do not match',
				errors: { confirmPassword: 'Passwords do not match' }
			});
		}

		// Get full user to check password hash
		const user = await userFn.getUserById(event.locals.user.id);
		if (!user) {
			return fail(401, { message: 'User not found' });
		}

		const validPassword = await auth.verifyPassword(user.passwordHash, currentPassword);
		if (!validPassword) {
			logger.debug('Change password failed: incorrect current password', { userId: user.id });
			return fail(400, {
				message: 'Incorrect current password',
				errors: { currentPassword: 'Incorrect password' }
			});
		}

		try {
			const passwordHash = await auth.hashPassword(newPassword);
			await userFn.updateUserPassword(user.id, passwordHash);
			logger.info('User password updated', { userId: user.id });
		} catch (e) {
			logger.error('Failed to update user password', e, { userId: user.id });
			return fail(500, { message: 'An unknown error occurred' });
		}

		return { message: 'Password updated successfully' };
	},

	/**
	 * Revokes a specific session.
	 * Ensures the session belongs to the current user before invalidating.
	 */
	revokeSession: async (event) => {
		if (!event.locals.session || !event.locals.user) {
			return fail(401);
		}

		const formData = await event.request.formData();
		const sessionId = formData.get('sessionId');

		if (!sessionId || typeof sessionId !== 'string') {
			return fail(400, { message: 'Invalid session ID' });
		}

		logger.info('Revoke session action initiated', {
			userId: event.locals.user.id,
			targetSessionId: sessionId
		});

		// Verify ownership
		const userSessions = await auth.getUserSessions(event.locals.user.id);
		const isOwner = userSessions.some((s) => s.id === sessionId);

		if (!isOwner) {
			logger.warn('Unauthorized session revocation attempt', {
				userId: event.locals.user.id,
				targetSessionId: sessionId
			});
			return fail(403, { message: 'Unauthorized' });
		}

		try {
			await auth.invalidateSession(sessionId);
			logger.info('Session revoked', { userId: event.locals.user.id, sessionId });
		} catch (e) {
			logger.error('Failed to revoke session', e, { userId: event.locals.user.id, sessionId });
			return fail(500, { message: 'An unknown error occurred' });
		}

		return { message: 'Session revoked successfully' };
	},

	/**
	 * Revokes all other sessions for the user except the current one.
	 */
	revokeOtherSessions: async (event) => {
		if (!event.locals.session || !event.locals.user) {
			return fail(401);
		}

		logger.info('Revoke other sessions action initiated', { userId: event.locals.user.id });

		try {
			await auth.invalidateOtherSessions(event.locals.user.id, event.locals.session.id);
			logger.info('Other sessions revoked', { userId: event.locals.user.id });
		} catch (e) {
			logger.error('Failed to revoke other sessions', e, { userId: event.locals.user.id });
			return fail(500, { message: 'An unknown error occurred' });
		}

		return { message: 'All other sessions revoked successfully' };
	},

	/**
	 * Deletes the user's account permanently.
	 * Requires the user to type "DELETE" to confirm.
	 */
	deleteAccount: async (event) => {
		if (!event.locals.session || !event.locals.user) {
			return fail(401);
		}

		logger.info('Delete account action initiated', { userId: event.locals.user.id });

		const formData = await event.request.formData();
		const confirmation = formData.get('confirmation');

		if (confirmation !== 'DELETE') {
			logger.debug('Delete account failed: confirmation incorrect', {
				userId: event.locals.user.id
			});
			return fail(400, { message: 'Incorrect confirmation' });
		}

		try {
			await userFn.deleteUser(event.locals.user.id);
			auth.deleteSessionTokenCookie(event);
			logger.info('User account deleted', { userId: event.locals.user.id });
		} catch (e) {
			logger.error('Failed to delete user account', e, { userId: event.locals.user.id });
			return fail(500, { message: 'An unknown error occurred' });
		}

		return redirect(302, '/demo/lucia/login');
	}
};
