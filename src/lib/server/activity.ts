import { db } from '$lib/server/db/index.js';
import * as table from '$lib/server/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { Logger } from '$lib/server/logger.js';
import type { ActivityLog } from '$lib/server/db/schema.js';

const logger = new Logger('activity');

/**
 * Generates a random activity ID.
 * @returns A string representing the activity ID.
 */
function generateActivityId() {
	const bytes = crypto.getRandomValues(new Uint8Array(20));
	return encodeBase32LowerCase(bytes);
}

/**
 * Logs a user activity.
 *
 * @param userId - The ID of the user performing the action.
 * @param action - The action performed (e.g., 'LOGIN', 'UPDATE_PROFILE').
 * @param details - Optional details about the action (string or object).
 */
export async function logActivity(
	userId: string,
	action: string,
	details?: string | object
): Promise<void> {
	const id = generateActivityId();
	const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details;

	try {
		await db.insert(table.activityLog).values({
			id,
			userId,
			action,
			details: detailsStr || null,
			timestamp: new Date()
		});
		logger.info('Activity logged', { userId, action, activityId: id });
	} catch (error) {
		logger.error('Failed to log activity', error, { userId, action });
		// We don't throw here to avoid disrupting the user flow if logging fails
	}
}

/**
 * Retrieves the activity log for a user.
 *
 * @param userId - The ID of the user.
 * @param limit - The maximum number of records to return (default: 50). Pass null for no limit.
 * @returns A list of activity log entries.
 */
export async function getUserActivity(
	userId: string,
	limit: number | null = 50
): Promise<ActivityLog[]> {
	try {
		let query = db
			.select()
			.from(table.activityLog)
			.where(eq(table.activityLog.userId, userId))
			.orderBy(desc(table.activityLog.timestamp));

		if (limit !== null) {
			// @ts-ignore: Dynamic query construction
			query = query.limit(limit);
		}

		return await query;
	} catch (error) {
		logger.error('Failed to get user activity', error, { userId });
		return [];
	}
}

/**
 * Clears the activity log for a user.
 *
 * @param userId - The ID of the user.
 */
export async function clearUserActivity(userId: string): Promise<void> {
	try {
		await db.delete(table.activityLog).where(eq(table.activityLog.userId, userId));
		logger.info('User activity cleared', { userId });
	} catch (error) {
		logger.error('Failed to clear user activity', error, { userId });
		throw error;
	}
}
