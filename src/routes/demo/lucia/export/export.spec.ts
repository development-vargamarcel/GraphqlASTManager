import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './+server.js';
import * as userFn from '$lib/server/user.js';
import * as auth from '$lib/server/auth.js';
import * as noteFn from '$lib/server/note.js';
import * as activityFn from '$lib/server/activity.js';

vi.mock('$lib/server/user.js', () => ({
	getUserById: vi.fn()
}));

vi.mock('$lib/server/auth.js', () => ({
	getUserSessions: vi.fn()
}));

vi.mock('$lib/server/note.js', () => ({
	getUserNotes: vi.fn()
}));

vi.mock('$lib/server/activity.js', () => ({
	getUserActivity: vi.fn()
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
			bio: 'test bio',
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
		const mockNotes = [
			{
				id: 'note-1',
				title: 'Test Note',
				content: 'Content',
				createdAt: new Date(),
				updatedAt: new Date()
			}
		];
		const mockActivity = [
			{
				action: 'LOGIN',
				details: null,
				timestamp: new Date()
			}
		];

		(userFn.getUserById as any).mockResolvedValue(mockUser);
		(auth.getUserSessions as any).mockResolvedValue(mockSessions);
		(noteFn.getUserNotes as any).mockResolvedValue(mockNotes);
		(activityFn.getUserActivity as any).mockResolvedValue(mockActivity);

		const event = {
			locals: { user: { id: 'user-123' } }
		};

		const response = await GET(event as any);
		expect(response.status).toBe(200);

		const data = await response.json();
		expect(data.user).toEqual({
			id: 'user-123',
			username: 'testuser',
			age: 25,
			bio: 'test bio'
		});
		expect(data.sessions).toHaveLength(1);
		expect(data.sessions[0].id).toBe('session-1');
		expect(data.notes).toHaveLength(1);
		expect(data.notes[0].title).toBe('Test Note');
		expect(data.activityLogs).toHaveLength(1);
		expect(data.activityLogs[0].action).toBe('LOGIN');

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
