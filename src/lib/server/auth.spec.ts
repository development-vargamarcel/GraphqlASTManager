import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as auth from './auth.js';
import { db } from '$lib/server/db/index.js';
import * as table from '$lib/server/db/schema.js';
import type { RequestEvent } from '@sveltejs/kit';

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

// Mock crypto
Object.defineProperty(global, 'crypto', {
	value: {
		getRandomValues: (arr: Uint8Array) => {
			for (let i = 0; i < arr.length; i++) {
				arr[i] = Math.floor(Math.random() * 256);
			}
			return arr;
		}
	}
});

describe('auth', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('generateSessionToken', () => {
		it('should generate a string', () => {
			const token = auth.generateSessionToken();
			expect(typeof token).toBe('string');
			expect(token.length).toBeGreaterThan(0);
		});
	});

	describe('createSession', () => {
		it('should create a session and insert into db', async () => {
			const token = 'test-token';
			const userId = 'user-123';

			const mockValues = vi.fn().mockResolvedValue(undefined);
			vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

			const session = await auth.createSession(token, userId);

			expect(session).toBeDefined();
			expect(session.userId).toBe(userId);
			// Check if expiration is roughly 30 days from now
			const now = Date.now();
			const expectedExpiry = now + auth.DAY_IN_MS * auth.SESSION_EXPIRATION_DAYS;
			expect(session.expiresAt.getTime()).toBeGreaterThan(expectedExpiry - 1000);
			expect(session.expiresAt.getTime()).toBeLessThan(expectedExpiry + 1000);

			expect(db.insert).toHaveBeenCalledWith(table.session);
			expect(mockValues).toHaveBeenCalledWith(session);
		});

		it('should throw error if db insert fails', async () => {
			const token = 'test-token';
			const userId = 'user-123';
			const error = new Error('DB Error');

			const mockValues = vi.fn().mockRejectedValue(error);
			vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

			await expect(auth.createSession(token, userId)).rejects.toThrow('DB Error');
		});
	});

	describe('validateSessionToken', () => {
		it('should return null if db select throws', async () => {
			const mockFrom = vi.fn().mockReturnValue({
				innerJoin: vi.fn().mockReturnValue({
					where: vi.fn().mockRejectedValue(new Error('DB Error'))
				})
			});
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const result = await auth.validateSessionToken('token');
			expect(result).toEqual({ session: null, user: null });
		});

		it('should return null if session not found', async () => {
			const mockFrom = vi.fn().mockReturnValue({
				innerJoin: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([])
				})
			});
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const result = await auth.validateSessionToken('token');
			expect(result).toEqual({ session: null, user: null });
		});

		it('should delete and return null if session is expired', async () => {
			const expiredSession = {
				id: 'session-id',
				userId: 'user-id',
				expiresAt: new Date(Date.now() - 10000)
			};
			const user = { id: 'user-id', username: 'testuser' };

			const mockWhere = vi.fn().mockResolvedValue([{ session: expiredSession, user }]);
			const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere });
			const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const mockDeleteWhere = vi.fn().mockResolvedValue(undefined);
			vi.mocked(db.delete).mockReturnValue({ where: mockDeleteWhere } as any);

			const result = await auth.validateSessionToken('token');

			expect(result).toEqual({ session: null, user: null });
			expect(db.delete).toHaveBeenCalledWith(table.session);
		});

		it('should handle db error during deletion of expired session', async () => {
			const expiredSession = {
				id: 'session-id',
				userId: 'user-id',
				expiresAt: new Date(Date.now() - 10000)
			};
			const user = { id: 'user-id', username: 'testuser' };

			const mockWhere = vi.fn().mockResolvedValue([{ session: expiredSession, user }]);
			const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere });
			const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const mockDeleteWhere = vi.fn().mockRejectedValue(new Error('DB Error'));
			vi.mocked(db.delete).mockReturnValue({ where: mockDeleteWhere } as any);

			const result = await auth.validateSessionToken('token');
			// Should swallow error and return null
			expect(result).toEqual({ session: null, user: null });
		});

		it('should return session and user if valid', async () => {
			const validSession = {
				id: 'session-id',
				userId: 'user-id',
				expiresAt: new Date(Date.now() + auth.DAY_IN_MS * 20) // More than 15 days
			};
			const user = { id: 'user-id', username: 'testuser' };

			const mockWhere = vi.fn().mockResolvedValue([{ session: validSession, user }]);
			const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere });
			const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const result = await auth.validateSessionToken('token');

			expect(result).toEqual({ session: validSession, user });
			expect(db.delete).not.toHaveBeenCalled();
			expect(db.update).not.toHaveBeenCalled();
		});

		it('should renew session if close to expiration', async () => {
			const closeToExpirySession = {
				id: 'session-id',
				userId: 'user-id',
				expiresAt: new Date(Date.now() + auth.DAY_IN_MS * 10) // Less than 15 days
			};
			const user = { id: 'user-id', username: 'testuser' };

			const mockWhere = vi.fn().mockResolvedValue([{ session: closeToExpirySession, user }]);
			const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere });
			const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const mockUpdateSet = vi
				.fn()
				.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
			vi.mocked(db.update).mockReturnValue({ set: mockUpdateSet } as any);

			const result = await auth.validateSessionToken('token');

			expect(result.session).toBeDefined();
			expect(result.user).toBeDefined();
			expect(db.update).toHaveBeenCalledWith(table.session);
			// Check if expiration was updated in memory object
			expect(result.session!.expiresAt.getTime()).toBeGreaterThan(Date.now() + auth.DAY_IN_MS * 29);
		});
	});

	describe('invalidateSession', () => {
		it('should delete session from db', async () => {
			const mockWhere = vi.fn().mockResolvedValue(undefined);
			vi.mocked(db.delete).mockReturnValue({ where: mockWhere } as any);

			await auth.invalidateSession('session-id');

			expect(db.delete).toHaveBeenCalledWith(table.session);
			expect(mockWhere).toHaveBeenCalled();
		});

		it('should throw error if db delete fails', async () => {
			const mockWhere = vi.fn().mockRejectedValue(new Error('DB Error'));
			vi.mocked(db.delete).mockReturnValue({ where: mockWhere } as any);

			await expect(auth.invalidateSession('session-id')).rejects.toThrow('DB Error');
		});
	});

	describe('cookie helpers', () => {
		let event: RequestEvent;
		beforeEach(() => {
			event = {
				cookies: {
					set: vi.fn(),
					delete: vi.fn(),
					get: vi.fn()
				}
			} as unknown as RequestEvent;
		});

		it('setSessionTokenCookie should set cookie', () => {
			const token = 'token';
			const expiresAt = new Date();
			auth.setSessionTokenCookie(event, token, expiresAt);
			expect(event.cookies.set).toHaveBeenCalledWith(auth.SESSION_COOKIE_NAME, token, {
				expires: expiresAt,
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: expect.any(Boolean)
			});
		});

		it('deleteSessionTokenCookie should delete cookie', () => {
			auth.deleteSessionTokenCookie(event);
			expect(event.cookies.delete).toHaveBeenCalledWith(auth.SESSION_COOKIE_NAME, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: expect.any(Boolean)
			});
		});
	});
});
