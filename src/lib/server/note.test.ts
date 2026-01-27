import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as note from './note.js';
import { db } from '$lib/server/db/index.js';
import * as table from '$lib/server/db/schema.js';

// Mock the DB module
vi.mock('$lib/server/db/index.js', () => ({
	db: {
		insert: vi.fn(),
		select: vi.fn(),
		delete: vi.fn(),
		update: vi.fn()
	}
}));

vi.mock('$lib/server/logger.js', () => {
	return {
		Logger: class {
			constructor() {}
			info = vi.fn();
			warn = vi.fn();
			error = vi.fn();
			debug = vi.fn();
		}
	};
});

describe('note', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('createNote', () => {
		it('should insert note and return it', async () => {
			const userId = 'user1';
			const title = 'Test Note';
			const content = 'This is a test note';

			const mockValues = vi.fn().mockResolvedValue(undefined);
			vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

			const result = await note.createNote(userId, title, content);

			expect(result).toMatchObject({
				userId,
				title,
				content
			});
			expect(result.id).toBeDefined();
			expect(result.createdAt).toBeInstanceOf(Date);
			expect(result.updatedAt).toBeInstanceOf(Date);

			expect(db.insert).toHaveBeenCalledWith(table.note);
			expect(mockValues).toHaveBeenCalled();
		});

		it('should throw error if db fails', async () => {
			const userId = 'user1';
			const title = 'Test';
			const content = 'Content';

			const mockValues = vi.fn().mockRejectedValue(new Error('DB Error'));
			vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

			await expect(note.createNote(userId, title, content)).rejects.toThrow('DB Error');
		});
	});

	describe('getUserNotes', () => {
		it('should return notes for user', async () => {
			const mockNotes = [{ id: '1', userId: 'user1', title: 'Note 1' }];
			const mockOrderBy = vi.fn().mockResolvedValue(mockNotes);
			const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
			const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const result = await note.getUserNotes('user1');
			expect(result).toEqual(mockNotes);
			expect(db.select).toHaveBeenCalled();
		});

		it('should throw error if db fails', async () => {
			const mockOrderBy = vi.fn().mockRejectedValue(new Error('DB Error'));
			const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
			const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			await expect(note.getUserNotes('user1')).rejects.toThrow('DB Error');
		});
	});

	describe('getNoteById', () => {
		it('should return note if found', async () => {
			const mockNote = { id: '1', title: 'Note 1' };
			const mockWhere = vi.fn().mockResolvedValue([mockNote]);
			const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const result = await note.getNoteById('1');
			expect(result).toEqual(mockNote);
		});

		it('should return undefined if not found', async () => {
			const mockWhere = vi.fn().mockResolvedValue([]);
			const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const result = await note.getNoteById('1');
			expect(result).toBeUndefined();
		});
	});

	describe('updateNote', () => {
		it('should update note', async () => {
			const mockSet = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
			vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

			await note.updateNote('1', 'New Title', 'New Content');
			expect(db.update).toHaveBeenCalledWith(table.note);
			// Check arguments passed to set, avoiding strict equality check on Date
			const setCallArgs = mockSet.mock.calls[0][0];
			expect(setCallArgs.title).toBe('New Title');
			expect(setCallArgs.content).toBe('New Content');
			expect(setCallArgs.updatedAt).toBeInstanceOf(Date);
		});
	});

	describe('deleteNote', () => {
		it('should delete note', async () => {
			const mockWhere = vi.fn().mockResolvedValue(undefined);
			vi.mocked(db.delete).mockReturnValue({ where: mockWhere } as any);

			await note.deleteNote('1');
			expect(db.delete).toHaveBeenCalledWith(table.note);
		});
	});
});
