import { sequence } from '@sveltejs/kit/hooks';
import * as auth from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { RateLimiter } from '$lib/server/rate-limiter';

// Global rate limiter: 100 requests per minute per IP
const globalLimiter = new RateLimiter(60 * 1000, 100);

const handleRateLimit: Handle = async ({ event, resolve }) => {
	// Skip rate limiting for static assets (managed by adapter usually, but good to be safe)
	if (event.url.pathname.startsWith('/_app') || event.url.pathname.startsWith('/favicon.ico')) {
		return resolve(event);
	}

	const clientIp = event.getClientAddress();
	if (!globalLimiter.check(clientIp)) {
		return new Response('Too many requests', { status: 429 });
	}

	return resolve(event);
};

const handleSecurityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Set security headers
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	return response;
};

const handleParaglide: Handle = ({ event, resolve }) => paraglideMiddleware(event.request, ({ request, locale }) => {
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

export const handle: Handle = sequence(handleSecurityHeaders, handleRateLimit, handleParaglide, handleAuth);
