import { db } from '$lib/server/db/index.js';
import * as table from '$lib/server/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { Logger } from '$lib/server/logger.js';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import type { Note } from '$lib/server/db/schema.js';

const logger = new Logger('note');

/**
 * Generates a random note ID.
 */
function generateNoteId() {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

/**
 * Creates a new note for a user.
 *
 * @param userId - The ID of the user creating the note.
 * @param title - The title of the note.
 * @param content - The content of the note.
 * @param tags - The tags associated with the note.
 * @returns The created note.
 */
export async function createNote(
	userId: string,
	title: string,
	content: string,
	tags: string[] = []
): Promise<Note> {
	const id = generateNoteId();
	const note: Note = {
		id,
		userId,
		title,
		content,
		tags,
		createdAt: new Date(),
		updatedAt: new Date()
	};
	try {
		await db.insert(table.note).values(note);
		logger.info('Note created', { noteId: id, userId });
		return note;
	} catch (error) {
		logger.error('Failed to create note', error, { userId });
		throw error;
	}
}

/**
 * Retrieves all notes for a specific user, ordered by creation date (descending).
 *
 * @param userId - The ID of the user.
 * @returns A list of notes.
 */
export async function getUserNotes(userId: string): Promise<Note[]> {
	try {
		const notes = await db
			.select()
			.from(table.note)
			.where(eq(table.note.userId, userId))
			.orderBy(desc(table.note.createdAt));
		return notes;
	} catch (error) {
		logger.error('Failed to get user notes', error, { userId });
		throw error;
	}
}

/**
 * Retrieves a single note by ID.
 *
 * @param noteId - The ID of the note.
 * @returns The note if found, otherwise undefined.
 */
export async function getNoteById(noteId: string): Promise<Note | undefined> {
	try {
		const results = await db.select().from(table.note).where(eq(table.note.id, noteId));
		return results.at(0);
	} catch (error) {
		logger.error('Failed to get note by id', error, { noteId });
		throw error;
	}
}

/**
 * Updates a note's title, content, and tags.
 * Updates the updatedAt timestamp.
 *
 * @param noteId - The ID of the note to update.
 * @param title - The new title.
 * @param content - The new content.
 * @param tags - The new tags.
 */
export async function updateNote(
	noteId: string,
	title: string,
	content: string,
	tags: string[]
): Promise<void> {
	try {
		await db
			.update(table.note)
			.set({ title, content, tags, updatedAt: new Date() })
			.where(eq(table.note.id, noteId));
		logger.info('Note updated', { noteId });
	} catch (error) {
		logger.error('Failed to update note', error, { noteId });
		throw error;
	}
}

/**
 * Deletes a note.
 *
 * @param noteId - The ID of the note to delete.
 */
export async function deleteNote(noteId: string): Promise<void> {
	try {
		await db.delete(table.note).where(eq(table.note.id, noteId));
		logger.info('Note deleted', { noteId });
	} catch (error) {
		logger.error('Failed to delete note', error, { noteId });
		throw error;
	}
}
