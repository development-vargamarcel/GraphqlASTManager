/**
 * A simple in-memory rate limiter using a sliding window algorithm (approximated).
 * Note: This is not suitable for distributed systems.
 */
export class RateLimiter {
	private readonly windowMs: number;
	private readonly maxRequests: number;
	private readonly hits: Map<string, { count: number; expiresAt: number }>;
	private readonly cleanupInterval: ReturnType<typeof setInterval>;

	/**
	 * @param windowMs Time window in milliseconds.
	 * @param maxRequests Maximum requests allowed within the window.
	 */
	constructor(windowMs: number, maxRequests: number) {
		this.windowMs = windowMs;
		this.maxRequests = maxRequests;
		this.hits = new Map();

		// Clean up expired entries every minute
		this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
	}

	/**
	 * Checks if a request is allowed for the given key (e.g., IP address).
	 * Increments the counter if allowed.
	 * @param key The unique identifier for the client.
	 * @returns true if allowed, false if rate limit exceeded.
	 */
	check(key: string): boolean {
		const now = Date.now();
		const record = this.hits.get(key);

		if (!record) {
			this.hits.set(key, { count: 1, expiresAt: now + this.windowMs });
			return true;
		}

		if (now > record.expiresAt) {
			this.hits.set(key, { count: 1, expiresAt: now + this.windowMs });
			return true;
		}

		if (record.count >= this.maxRequests) {
			return false;
		}

		record.count++;
		return true;
	}

	reset(key: string) {
		this.hits.delete(key);
	}

	destroy() {
		clearInterval(this.cleanupInterval);
	}

	private cleanup() {
		const now = Date.now();
		for (const [key, record] of this.hits) {
			if (now > record.expiresAt) {
				this.hits.delete(key);
			}
		}
	}
}
