import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth.js';
import * as userModel from '$lib/server/user.js';
import { RateLimiter } from '$lib/server/rate-limiter.js';
import { validateUsername, validatePassword } from '$lib/server/validation.js';
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
			return fail(400, { message: 'Invalid username (3-31 chars, alphanumeric, -, _)' });
		}
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password (6-255 chars)' });
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
			return fail(400, { message: 'Invalid username (3-31 chars, alphanumeric, -, _)' });
		}
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password (6-255 chars)' });
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
