import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getUserById } from '$lib/server/user.js';

/**
 * GET handler for fetching the authenticated user's profile.
 * Access control is handled by the global `handleApiAuth` hook.
 */
export const GET: RequestHandler = async ({ locals }) => {
	// Locals.user is guaranteed by hooks for /api/ routes
	const user = locals.user!;
	const userDetails = await getUserById(user.id);

	return json({
		id: user.id,
		username: user.username,
		age: userDetails?.age,
		bio: userDetails?.bio
	});
};
