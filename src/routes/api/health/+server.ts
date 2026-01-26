import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { Logger } from '$lib/server/logger.js';
import { healthCheck } from '$lib/server/db/index.js';

const logger = new Logger('health-check');

/**
 * Health check endpoint.
 * Used by monitoring services to verify the application is up and running.
 * Also checks database connectivity.
 */
export const GET: RequestHandler = async ({ request, getClientAddress }) => {
	logger.debug('Health check requested', {
		ip: getClientAddress(),
		userAgent: request.headers.get('user-agent')
	});

	const dbStatus = await healthCheck();
	const status = dbStatus ? 'ok' : 'degraded';

	if (!dbStatus) {
		logger.warn('Health check degraded: Database unreachable');
	}

	return json(
		{
			status,
			database: dbStatus ? 'connected' : 'disconnected',
			timestamp: new Date().toISOString(),
			uptime: process.uptime()
		},
		{ status: dbStatus ? 200 : 503 }
	);
};
