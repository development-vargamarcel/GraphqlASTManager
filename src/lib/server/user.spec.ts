import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as user from './user.js';
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
			constructor(context: string) {}
			info = vi.fn();
			warn = vi.fn();
			error = vi.fn();
			debug = vi.fn();
		}
	};
});

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

		it('should throw error if db fails', async () => {
			const mockWhere = vi.fn().mockRejectedValue(new Error('DB Error'));
			const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			await expect(user.getUserByUsername('test')).rejects.toThrow('DB Error');
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

		it('should throw error if db fails', async () => {
			const id = '123';
			const username = 'testuser';
			const passwordHash = 'hash';

			const mockValues = vi.fn().mockRejectedValue(new Error('DB Error'));
			vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

			await expect(user.createUser(id, username, passwordHash)).rejects.toThrow('DB Error');
		});
	});
});
