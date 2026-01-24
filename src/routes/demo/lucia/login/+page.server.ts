import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth.js';
import * as userModel from '$lib/server/user.js';
import { RateLimiter } from '$lib/server/rate-limiter.js';
import { validateUsername, validatePassword } from '$lib/server/validation.js';
import type { Actions, PageServerLoad } from './$types.js';
import { Logger } from '$lib/server/logger.js';

const logger = new Logger('login-action');
const limiter = new RateLimiter(60 * 1000, 20); // 20 requests per minute

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/demo/lucia');
	}
	return {};
};

function validateAuthFormData(username: unknown, password: unknown) {
	const errors: Record<string, string> = {};
	if (!validateUsername(username)) {
		errors.username = 'Invalid username (3-31 chars, alphanumeric, -, _)';
	}
	if (!validatePassword(password)) {
		errors.password = 'Invalid password (6-255 chars)';
	}
	return { valid: Object.keys(errors).length === 0, errors };
}

export const actions: Actions = {
	login: async (event) => {
		const clientIp = event.getClientAddress();
		if (!limiter.check(clientIp)) {
			return fail(429, { message: 'Too many requests. Please try again later.' });
		}

		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		const validation = validateAuthFormData(username, password);
		if (!validation.valid) {
			logger.debug('Login validation failed', { errors: validation.errors, ip: clientIp });
			return fail(400, { errors: validation.errors });
		}

		// TypeScript needs assurance that username and password are strings after validation
		const validUsername = username as string;
		const validPassword = password as string;

		const existingUser = await userModel.getUserByUsername(validUsername);
		if (!existingUser) {
			logger.debug('Login failed: user not found', { username: validUsername, ip: clientIp });
			return fail(400, { message: 'Incorrect username or password' });
		}

		const validPasswordHash = await auth.verifyPassword(existingUser.passwordHash, validPassword);
		if (!validPasswordHash) {
			logger.debug('Login failed: incorrect password', { username: validUsername, ip: clientIp });
			return fail(400, { message: 'Incorrect username or password' });
		}

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		logger.info('User logged in', {
			userId: existingUser.id,
			username: existingUser.username,
			ip: clientIp
		});

		return redirect(302, '/demo/lucia');
	},
	register: async (event) => {
		const clientIp = event.getClientAddress();
		if (!limiter.check(clientIp)) {
			return fail(429, { message: 'Too many requests. Please try again later.' });
		}

		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');

		const validation = validateAuthFormData(username, password);
		if (!validation.valid) {
			logger.debug('Registration validation failed', { errors: validation.errors, ip: clientIp });
			return fail(400, { errors: validation.errors });
		}

		if (password !== confirmPassword) {
			logger.debug('Registration failed: passwords do not match', { ip: clientIp });
			return fail(400, {
				errors: { confirmPassword: 'Passwords do not match' } as Record<string, string>
			});
		}

		const validUsername = username as string;
		const validPassword = password as string;

		const userId = auth.generateUserId();
		const passwordHash = await auth.hashPassword(validPassword);

		try {
			await userModel.createUser(userId, validUsername, passwordHash);

			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, userId);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

			logger.info('User registered', { userId, username: validUsername, ip: clientIp });
		} catch (e: any) {
			if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
				return fail(400, {
					message: 'Username already taken',
					errors: { username: 'Username already taken' }
				});
			}
			logger.error('Registration failed', e, { username: validUsername, ip: clientIp });
			return fail(500, { message: 'An error has occurred' });
		}
		return redirect(302, '/demo/lucia');
	}
};
