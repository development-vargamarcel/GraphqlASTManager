import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './+server.js';
import * as userFn from '$lib/server/user.js';
import * as auth from '$lib/server/auth.js';

vi.mock('$lib/server/user.js', () => ({
	getUserById: vi.fn()
}));

vi.mock('$lib/server/auth.js', () => ({
	getUserSessions: vi.fn()
}));

// Mock `json` and `redirect` from SvelteKit
vi.mock('@sveltejs/kit', () => ({
	json: (data: any, init?: any) => ({
		status: init?.status ?? 200,
		headers: new Map(Object.entries(init?.headers ?? {})),
		json: async () => data
	}),
	redirect: (status: number, location: string) => ({ status, location, type: 'redirect' })
}));

describe('GET /demo/lucia/export', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should redirect if user is not authenticated', async () => {
		const event = {
			locals: { user: null }
		};

		const response = await GET(event as any);
		expect(response).toEqual({
			status: 302,
			location: '/demo/lucia/login',
			type: 'redirect'
		});
	});

	it('should return user data and sessions if authenticated', async () => {
		const mockUser = {
			id: 'user-123',
			username: 'testuser',
			age: 25,
			passwordHash: 'hash'
		};
		const mockSessions = [
			{
				id: 'session-1',
				expiresAt: new Date(),
				ipAddress: '127.0.0.1',
				userAgent: 'TestAgent'
			}
		];

		(userFn.getUserById as any).mockResolvedValue(mockUser);
		(auth.getUserSessions as any).mockResolvedValue(mockSessions);

		const event = {
			locals: { user: { id: 'user-123' } }
		};

		const response = await GET(event as any);
		expect(response.status).toBe(200);

		const data = await response.json();
		expect(data.user).toEqual({
			id: 'user-123',
			username: 'testuser',
			age: 25
		});
		expect(data.sessions).toHaveLength(1);
		expect(data.sessions[0].id).toBe('session-1');

		// Check headers
		const disposition = response.headers.get('Content-Disposition');
		expect(disposition).toContain('attachment');
		expect(disposition).toContain('user-data-user-123.json');
	});

	it('should return 404 if user not found in DB', async () => {
		(userFn.getUserById as any).mockResolvedValue(null);

		const event = {
			locals: { user: { id: 'user-123' } }
		};

		const response = await GET(event as any);
		expect(response.status).toBe(404);
	});
});
