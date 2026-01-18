import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as user from './user.js';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

// Mock the DB module
vi.mock('$lib/server/db', () => ({
	db: {
		insert: vi.fn(),
		select: vi.fn(),
		delete: vi.fn(),
		update: vi.fn()
	}
}));

describe('user', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('getUserByUsername', () => {
		it('should return user if found', async () => {
			const mockUser = { id: '1', username: 'test', passwordHash: 'hash', age: null };
			const mockWhere = vi.fn().mockResolvedValue([mockUser]);
			const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const result = await user.getUserByUsername('test');
			expect(result).toEqual(mockUser);
			expect(db.select).toHaveBeenCalled();
		});

		it('should return undefined if not found', async () => {
			const mockWhere = vi.fn().mockResolvedValue([]);
			const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const result = await user.getUserByUsername('test');
			expect(result).toBeUndefined();
		});
	});

	describe('createUser', () => {
		it('should insert user and return it', async () => {
			const id = '123';
			const username = 'testuser';
			const passwordHash = 'hash';

			const mockValues = vi.fn().mockResolvedValue(undefined);
			vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

			const result = await user.createUser(id, username, passwordHash);

			expect(result).toEqual({
				id,
				username,
				passwordHash,
				age: null
			});
			expect(db.insert).toHaveBeenCalledWith(table.user);
			expect(mockValues).toHaveBeenCalledWith({
				id,
				username,
				passwordHash,
				age: null
			});
		});
	});
});
