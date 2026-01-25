import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

/**
 * Health check endpoint.
 * Used by monitoring services to verify the application is up and running.
 */
export const GET: RequestHandler = async () => {
	return json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		uptime: process.uptime()
	});
};
