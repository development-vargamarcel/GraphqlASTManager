import { describe, it, expect } from 'vitest';
import { GET } from './+server.js';

describe('GET /api/health', () => {
	it('should return 200 OK and status json', async () => {
		const response = await GET({} as any);
		expect(response.status).toBe(200);

		const data = await response.json();
		expect(data).toHaveProperty('status', 'ok');
		expect(data).toHaveProperty('timestamp');
		expect(data).toHaveProperty('uptime');
	});
});
