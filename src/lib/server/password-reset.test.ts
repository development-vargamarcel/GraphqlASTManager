import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	createPasswordResetToken,
	validatePasswordResetToken,
	consumePasswordResetToken
} from './password-reset.js';
import { db } from './db/index.js';

// Mock DB
vi.mock('./db/index.js', () => ({
	db: {
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		limit: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis()
	}
}));

describe('Password Reset Logic', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('createPasswordResetToken should generate a token, delete old ones, and store hash', async () => {
		const userId = 'user-123';
		const token = await createPasswordResetToken(userId);

		expect(token).toBeDefined();
		expect(token).toHaveLength(40); // 20 bytes hex = 40 chars

		expect(db.delete).toHaveBeenCalled(); // Should clean up old tokens
		expect(db.insert).toHaveBeenCalled(); // Should insert new one
	});

	it('validatePasswordResetToken should return null if token not found', async () => {
		(db as any).limit.mockReturnValueOnce([]); // Mock no result

		const result = await validatePasswordResetToken('invalid-token');
		expect(result).toBeNull();
	});

	it('validatePasswordResetToken should return null and delete if expired', async () => {
		const expiredDate = new Date(Date.now() - 10000);
		(db as any).limit.mockReturnValueOnce([{ userId: 'user-123', expiresAt: expiredDate }]);

		const result = await validatePasswordResetToken('expired-token');
		expect(result).toBeNull();
		expect(db.delete).toHaveBeenCalled(); // Should delete expired token
	});

	it('validatePasswordResetToken should return userId if valid', async () => {
		const futureDate = new Date(Date.now() + 10000);
		(db as any).limit.mockReturnValueOnce([{ userId: 'user-123', expiresAt: futureDate }]);

		const result = await validatePasswordResetToken('valid-token');
		expect(result).toBe('user-123');
	});

	it('consumePasswordResetToken should delete the token', async () => {
		await consumePasswordResetToken('token-to-consume');
		expect(db.delete).toHaveBeenCalled();
	});
});
