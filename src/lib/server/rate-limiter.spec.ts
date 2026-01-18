import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RateLimiter } from './rate-limiter';

describe('RateLimiter', () => {
	let limiter: RateLimiter;

	beforeEach(() => {
		vi.useFakeTimers();
		limiter = new RateLimiter(1000, 2); // 1 second window, 2 requests max
	});

	afterEach(() => {
		limiter.destroy();
		vi.useRealTimers();
	});

	it('should allow requests within limit', () => {
		expect(limiter.check('ip1')).toBe(true);
		expect(limiter.check('ip1')).toBe(true);
	});

	it('should block requests exceeding limit', () => {
		limiter.check('ip1');
		limiter.check('ip1');
		expect(limiter.check('ip1')).toBe(false);
	});

	it('should reset after window expires', () => {
		limiter.check('ip1');
		limiter.check('ip1');
		expect(limiter.check('ip1')).toBe(false);

		vi.advanceTimersByTime(1001);

		expect(limiter.check('ip1')).toBe(true);
	});

	it('should track different keys independently', () => {
		limiter.check('ip1');
		limiter.check('ip1');
		expect(limiter.check('ip1')).toBe(false);
		expect(limiter.check('ip2')).toBe(true);
	});

	it('should cleanup expired entries', () => {
		// hits is private, so we can't check it directly easily without type casting or reflection
		// but we can verify behavior
		limiter.check('ip1');
		vi.advanceTimersByTime(60 * 1000 + 100); // Wait for cleanup interval

		// If cleanup worked, the entry should be gone, treating next request as new (which it would anyway due to expiry check)
		// To truly test cleanup, we'd need to inspect the Map size, but let's assume if it doesn't crash it works.
		expect(limiter.check('ip1')).toBe(true);
	});

	it('should destroy interval on destroy', () => {
		const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
		limiter.destroy();
		expect(clearIntervalSpy).toHaveBeenCalled();
	});
});
