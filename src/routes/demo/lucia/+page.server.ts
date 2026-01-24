import * as auth from '$lib/server/auth.js';
import * as userFn from '$lib/server/user.js';
import * as validation from '$lib/server/validation.js';
import { fail, redirect } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';
import type { Actions, PageServerLoad } from './$types.js';

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

		return redirect(302, '/demo/lucia/login');
	},

	updateProfile: async (event) => {
		if (!event.locals.session || !event.locals.user) {
			return fail(401);
		}
		const formData = await event.request.formData();
		const ageStr = formData.get('age');

		if (!ageStr || typeof ageStr !== 'string') {
			return fail(400, { message: 'Invalid age provided' });
		}

		const age = parseInt(ageStr, 10);
		if (isNaN(age) || age < 0 || age > 150) {
			return fail(400, { message: 'Invalid age provided' });
		}

		try {
			await userFn.updateUserAge(event.locals.user.id, age);
		} catch (e) {
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
			return fail(400, {
				message: 'Incorrect current password',
				errors: { currentPassword: 'Incorrect password' }
			});
		}

		try {
			const passwordHash = await auth.hashPassword(newPassword);
			await userFn.updateUserPassword(user.id, passwordHash);
		} catch (e) {
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
		} catch (e) {
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
