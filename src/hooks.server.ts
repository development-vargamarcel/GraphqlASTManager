import { sequence } from '@sveltejs/kit/hooks';
import * as auth from '$lib/server/auth.js';
import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server.js';
import { RateLimiter } from '$lib/server/rate-limiter.js';
import { Logger } from '$lib/server/logger.js';

const logger = new Logger('hooks');

// Global rate limiter: 100 requests per minute per IP
const globalLimiter = new RateLimiter(60 * 1000, 100);

function isStaticAsset(pathname: string): boolean {
	return (
		pathname.startsWith('/_app') ||
		pathname === '/favicon.ico' ||
		pathname === '/favicon.svg' ||
		pathname === '/robots.txt'
	);
}

const handleRateLimit: Handle = async ({ event, resolve }) => {
	// Skip rate limiting for static assets (managed by adapter usually, but good to be safe)
	if (isStaticAsset(event.url.pathname)) {
		return resolve(event);
	}

	const clientIp = event.getClientAddress();
	if (!globalLimiter.check(clientIp)) {
		logger.warn('Rate limit exceeded', { ip: clientIp, path: event.url.pathname });
		return new Response('Too many requests', { status: 429 });
	}

	return resolve(event);
};

const handleLogging: Handle = async ({ event, resolve }) => {
	const start = Date.now();
	const response = await resolve(event);
	const duration = Date.now() - start;

	if (!isStaticAsset(event.url.pathname)) {
		logger.info('Request processed', {
			method: event.request.method,
			path: event.url.pathname,
			status: response.status,
			duration,
			ip: event.getClientAddress()
		});
	}

	return response;
};

const handleSecurityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Set security headers
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set(
		'Content-Security-Policy',
		"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; frame-ancestors 'none';"
	);

	return response;
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.SESSION_COOKIE_NAME);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

export const handle: Handle = sequence(
	handleLogging,
	handleSecurityHeaders,
	handleRateLimit,
	handleParaglide,
	handleAuth
);
