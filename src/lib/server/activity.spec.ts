import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as activity from './activity.js';
import { db } from '$lib/server/db/index.js';
import * as table from '$lib/server/db/schema.js';

// Mock the DB module
vi.mock('$lib/server/db/index.js', () => ({
	db: {
		insert: vi.fn(),
		select: vi.fn(),
		delete: vi.fn()
	}
}));

vi.mock('$lib/server/logger.js', () => {
	return {
		Logger: class {
			constructor() {}
			info = vi.fn();
			error = vi.fn();
		}
	};
});

describe('activity', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('logActivity', () => {
		it('should insert activity log', async () => {
			const userId = 'user1';
			const action = 'LOGIN';
			const details = 'details';

			const mockValues = vi.fn().mockResolvedValue(undefined);
			vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

			await activity.logActivity(userId, action, details);

			expect(db.insert).toHaveBeenCalledWith(table.activityLog);
			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					userId,
					action,
					details
				})
			);
		});

		it('should handle object details', async () => {
			const userId = 'user1';
			const action = 'LOGIN';
			const details = { ip: '127.0.0.1' };

			const mockValues = vi.fn().mockResolvedValue(undefined);
			vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

			await activity.logActivity(userId, action, details);

			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					details: JSON.stringify(details)
				})
			);
		});

		it('should not throw error if db fails', async () => {
			const mockValues = vi.fn().mockRejectedValue(new Error('DB Error'));
			vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

			await expect(activity.logActivity('u1', 'a1')).resolves.not.toThrow();
		});
	});

	describe('getUserActivity', () => {
		it('should return activities', async () => {
			const mockLogs = [{ id: '1', userId: 'u1', action: 'a1', timestamp: new Date() }];
			const mockLimit = vi.fn().mockResolvedValue(mockLogs);
			const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit });
			const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
			const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const result = await activity.getUserActivity('u1');
			expect(result).toEqual(mockLogs);
			expect(mockLimit).toHaveBeenCalledWith(50);
		});

		it('should return empty array on error', async () => {
			const mockFrom = vi.fn().mockReturnValue({
				where: vi.fn().mockImplementation(() => {
					throw new Error('DB Error');
				})
			});
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const result = await activity.getUserActivity('u1');
			expect(result).toEqual([]);
		});
	});

	describe('clearUserActivity', () => {
		it('should clear user activity', async () => {
			const mockWhere = vi.fn().mockResolvedValue(undefined);
			vi.mocked(db.delete).mockReturnValue({ where: mockWhere } as any);

			await activity.clearUserActivity('u1');

			expect(db.delete).toHaveBeenCalledWith(table.activityLog);
			expect(mockWhere).toHaveBeenCalled();
		});

		it('should throw error if db fails', async () => {
			const mockWhere = vi.fn().mockRejectedValue(new Error('DB Error'));
			vi.mocked(db.delete).mockReturnValue({ where: mockWhere } as any);

			await expect(activity.clearUserActivity('u1')).rejects.toThrow('DB Error');
		});
	});
});
