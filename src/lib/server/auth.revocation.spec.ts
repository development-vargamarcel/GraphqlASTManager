import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as auth from './auth.js';
import { db } from './db/index.js';

// Mock dependencies
vi.mock('./db/index.js', () => ({
	db: {
		insert: vi.fn().mockReturnValue({ values: vi.fn() }),
		select: vi.fn(),
		delete: vi.fn(),
		update: vi.fn()
	}
}));

vi.mock('@oslojs/crypto/sha2', () => ({
	sha256: vi.fn()
}));

vi.mock('@oslojs/encoding', () => ({
	encodeBase64url: vi.fn(),
	encodeHexLowerCase: vi.fn().mockReturnValue('hashed-token'),
	encodeBase32LowerCase: vi.fn()
}));

describe('invalidateOtherSessions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should invalidate all sessions except the current one', async () => {
		const userId = 'user-123';
		const currentSessionId = 'session-current';
		const otherSessionId1 = 'session-other-1';
		const otherSessionId2 = 'session-other-2';

		const mockSessions = [
			{ id: currentSessionId, userId, expiresAt: new Date() },
			{ id: otherSessionId1, userId, expiresAt: new Date() },
			{ id: otherSessionId2, userId, expiresAt: new Date() }
		];

		// Mock getUserSessions to return the list of sessions
		(db.select as any).mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue(mockSessions)
			})
		});

		// Mock delete to return a chainable object
		(db.delete as any).mockReturnValue({
			where: vi.fn().mockResolvedValue(undefined)
		});

		await auth.invalidateOtherSessions(userId, currentSessionId);

		// Expect db.delete to be called for otherSessionId1 and otherSessionId2
		expect(db.delete).toHaveBeenCalledTimes(2);
	});

	it('should not delete anything if only current session exists', async () => {
		const userId = 'user-123';
		const currentSessionId = 'session-current';

		const mockSessions = [{ id: currentSessionId, userId, expiresAt: new Date() }];

		(db.select as any).mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue(mockSessions)
			})
		});

		await auth.invalidateOtherSessions(userId, currentSessionId);

		expect(db.delete).not.toHaveBeenCalled();
	});
});
