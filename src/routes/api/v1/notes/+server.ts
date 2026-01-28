import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getUserNotes } from '$lib/server/note.js';

/**
 * GET handler for fetching the authenticated user's notes.
 * Access control is handled by the global `handleApiAuth` hook.
 */
export const GET: RequestHandler = async ({ locals }) => {
	// Locals.user is guaranteed by hooks for /api/ routes
	const notes = await getUserNotes(locals.user!.id);
	return json(notes);
};
