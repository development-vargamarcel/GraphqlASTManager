import { sequence } from '@sveltejs/kit/hooks';
import * as auth from '$lib/server/auth.js';
import * as api from '$lib/server/api.js';
import type { Handle, HandleServerError } from '@sveltejs/kit';
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

/**
 * Handle hook for rate limiting.
 * Applies global rate limiting to all requests except static assets.
 */
const handleRateLimit: Handle = async ({ event, resolve }) => {
	// Skip rate limiting for static assets (managed by adapter usually, but good to be safe)
	if (isStaticAsset(event.url.pathname)) {
		return resolve(event);
	}

	const clientIp = event.getClientAddress();
	const allowed = globalLimiter.check(clientIp);
	const remaining = globalLimiter.getRemaining(clientIp);
	const resetTime = globalLimiter.getResetTime(clientIp);

	if (!allowed) {
		logger.warn('Rate limit exceeded', { ip: clientIp, path: event.url.pathname });
		return new Response('Too many requests', {
			status: 429,
			headers: {
				'X-RateLimit-Limit': '100',
				'X-RateLimit-Remaining': remaining.toString(),
				'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString()
			}
		});
	}

	const response = await resolve(event);
	response.headers.set('X-RateLimit-Limit', '100');
	response.headers.set('X-RateLimit-Remaining', remaining.toString());
	response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());

	return response;
};

/**
 * Handle hook for request logging.
 * Logs incoming requests and their duration/status.
 */
const handleLogging: Handle = async ({ event, resolve }) => {
	const start = Date.now();
	event.locals.requestId = crypto.randomUUID();
	const response = await resolve(event);
	const duration = Date.now() - start;

	response.headers.set('X-Request-ID', event.locals.requestId);

	if (!isStaticAsset(event.url.pathname)) {
		logger.info('Request processed', {
			requestId: event.locals.requestId,
			method: event.request.method,
			path: event.url.pathname,
			status: response.status,
			duration,
			ip: event.getClientAddress()
		});
	}

	return response;
};

/**
 * Handle hook for setting security headers.
 * Adds CSP, X-Frame-Options, etc., to responses.
 */
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

/**
 * Handle hook for localization.
 * Uses Paraglide middleware to handle language negotiation and URL rewriting.
 */
const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

/**
 * Handle hook for authentication.
 * Validates session tokens and sets the user/session in `locals`.
 */
const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.SESSION_COOKIE_NAME);

	if (!sessionToken) {
		logger.debug('No session token found in request', { path: event.url.pathname });
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		logger.debug('Invalid or expired session token', { path: event.url.pathname });
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

/**
 * Handle hook for API authentication.
 * Validates Bearer tokens for requests starting with /api/.
 * Runs after handleAuth to allow overriding or supplementing cookie auth.
 */
const handleApiAuth: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/api/')) {
		const authHeader = event.request.headers.get('Authorization');

		if (authHeader && authHeader.startsWith('Bearer ')) {
			const token = authHeader.split(' ')[1];
			const { user } = await api.validateApiToken(token);

			if (user) {
				event.locals.user = user;
				// API access doesn't have a session object in the traditional sense
				event.locals.session = null;
				logger.info('API request authenticated via Token', {
					userId: user.id,
					path: event.url.pathname
				});
			} else {
				logger.warn('Invalid API token provided', { path: event.url.pathname });
				return new Response(JSON.stringify({ message: 'Invalid API token' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				});
			}
		}

		// If no user is authenticated (via Cookie or Token), return 401 for API routes
		if (!event.locals.user) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	}
	return resolve(event);
};

/**
 * Global server hook.
 * Chains multiple middleware functions to handle logging, security headers,
 * rate limiting, localization, and authentication for every request.
 */
export const handle: Handle = sequence(
	handleLogging,
	handleSecurityHeaders,
	handleRateLimit,
	handleParaglide,
	handleAuth,
	handleApiAuth
);

/**
 * Handle server-side errors.
 * Logs the error and returns a generic message to the client.
 */
export const handleError: HandleServerError = ({ error, event }) => {
	const errorId = crypto.randomUUID();
	const userId = event.locals.user?.id;
	logger.error('Unexpected server error', error, {
		errorId,
		path: event.url.pathname,
		method: event.request.method,
		userId
	});

	return {
		message: 'An unexpected error occurred. Please try again later.',
		errorId
	};
};
