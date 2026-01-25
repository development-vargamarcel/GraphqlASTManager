import { describe, it, expect, vi } from 'vitest';
import { GET } from './+server.js';

describe('GET /api/health', () => {
	it('should return 200 OK and status json', async () => {
		const mockEvent = {
			request: {
				headers: {
					get: vi.fn()
				}
			},
			getClientAddress: vi.fn().mockReturnValue('127.0.0.1')
		};

		const response = await GET(mockEvent as any);
		expect(response.status).toBe(200);

		const data = await response.json();
		expect(data).toHaveProperty('status', 'ok');
		expect(data).toHaveProperty('timestamp');
		expect(data).toHaveProperty('uptime');
	});
});
