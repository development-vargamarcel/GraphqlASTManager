import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { Logger } from '$lib/server/logger.js';

const logger = new Logger('health-check');

/**
 * Health check endpoint.
 * Used by monitoring services to verify the application is up and running.
 */
export const GET: RequestHandler = async ({ request, getClientAddress }) => {
	logger.debug('Health check requested', {
		ip: getClientAddress(),
		userAgent: request.headers.get('user-agent')
	});
	return json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		uptime: process.uptime()
	});
};
