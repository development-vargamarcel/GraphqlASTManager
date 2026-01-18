import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter } from './rate-limiter';

describe('RateLimiter', () => {
	let limiter: RateLimiter;

	beforeEach(() => {
		// Create a new limiter before each test
		// 1 second window, 2 requests max
		limiter = new RateLimiter(1000, 2);
	});

	it('should allow requests under the limit', () => {
		expect(limiter.check('ip1')).toBe(true);
		expect(limiter.check('ip1')).toBe(true);
	});

	it('should block requests over the limit', () => {
		limiter.check('ip1');
		limiter.check('ip1');
		expect(limiter.check('ip1')).toBe(false);
	});

	it('should reset after window expires', async () => {
		limiter.check('ip1');
		limiter.check('ip1');
		expect(limiter.check('ip1')).toBe(false);

		// Wait for window to expire
		await new Promise((resolve) => setTimeout(resolve, 1100));

		expect(limiter.check('ip1')).toBe(true);
	});

	it('should handle multiple keys independently', () => {
		limiter.check('ip1');
		limiter.check('ip1');
		expect(limiter.check('ip1')).toBe(false);

		expect(limiter.check('ip2')).toBe(true);
		expect(limiter.check('ip2')).toBe(true);
		expect(limiter.check('ip2')).toBe(false);
	});
});
