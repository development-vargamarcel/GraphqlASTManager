import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import * as userModel from '$lib/server/user';
import { RateLimiter } from '$lib/server/rate-limiter';
import { validateUsername, validatePassword } from '$lib/server/validation';
import type { Actions, PageServerLoad } from './$types.js';

const limiter = new RateLimiter(60 * 1000, 5); // 5 requests per minute

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/demo/lucia');
	}
	return {};
};

export const actions: Actions = {
	login: async (event) => {
		if (!limiter.check(event.getClientAddress())) {
			return fail(429, { message: 'Too many requests. Please try again later.' });
		}

		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!validateUsername(username)) {
			return fail(400, { message: 'Invalid username (min 3, max 31 characters, alphanumeric only)' });
		}
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password (min 6, max 255 characters)' });
		}

		const existingUser = await userModel.getUserByUsername(username);
		if (!existingUser) {
			return fail(400, { message: 'Incorrect username or password' });
		}

		const validPassword = await auth.verifyPassword(existingUser.passwordHash, password);
		if (!validPassword) {
			return fail(400, { message: 'Incorrect username or password' });
		}

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return redirect(302, '/demo/lucia');
	},
	register: async (event) => {
		if (!limiter.check(event.getClientAddress())) {
			return fail(429, { message: 'Too many requests. Please try again later.' });
		}

		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!validateUsername(username)) {
			return fail(400, { message: 'Invalid username' });
		}
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password' });
		}

		const userId = auth.generateUserId();
		const passwordHash = await auth.hashPassword(password);

		try {
			await userModel.createUser(userId, username, passwordHash);

			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, userId);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch (e: any) {
			if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
				return fail(400, { message: 'Username already taken' });
			}
			return fail(500, { message: 'An error has occurred' });
		}
		return redirect(302, '/demo/lucia');
	},
};
