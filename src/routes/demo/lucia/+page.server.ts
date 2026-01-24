import * as auth from '$lib/server/auth.js';
import * as userFn from '$lib/server/user.js';
import * as validation from '$lib/server/validation.js';
import { Logger } from '$lib/server/logger.js';
import { fail, redirect } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';
import type { Actions, PageServerLoad } from './$types.js';

const logger = new Logger('lucia-profile');

export const load: PageServerLoad = async () => {
	const user = requireLogin();
	// Fetch fresh user data to get the age
	const freshUser = await userFn.getUserById(user.id);
	if (!freshUser) {
		return redirect(302, '/demo/lucia/login');
	}
	// Return the fresh user data but ensure we don't leak sensitive info if any
	// The current user object in locals is safe, let's see what getUserById returns.
	// It returns the whole row. We should probably only return safe fields.
	// However, locals.user only has id and username.
	return {
		user: {
			id: freshUser.id,
			username: freshUser.username,
			age: freshUser.age
		}
	};
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);

		logger.info('User logged out', { userId: event.locals.user?.id });

		return redirect(302, '/demo/lucia/login');
	},

	updateProfile: async (event) => {
		if (!event.locals.session || !event.locals.user) {
			return fail(401);
		}
		const formData = await event.request.formData();
		const ageStr = formData.get('age');

		if (!ageStr || typeof ageStr !== 'string') {
			logger.debug('Update profile failed: invalid age format', { userId: event.locals.user.id });
			return fail(400, { message: 'Invalid age provided' });
		}

		const age = parseInt(ageStr, 10);
		if (isNaN(age) || age < 0 || age > 150) {
			logger.debug('Update profile failed: invalid age range', {
				userId: event.locals.user.id,
				age
			});
			return fail(400, { message: 'Invalid age provided' });
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

	changePassword: async (event) => {
		if (!event.locals.session || !event.locals.user) {
			return fail(401);
		}
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

	deleteAccount: async (event) => {
		if (!event.locals.session || !event.locals.user) {
			return fail(401);
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

function requireLogin() {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		return redirect(302, '/demo/lucia/login');
	}

	return locals.user;
}
