export class RateLimiter {
	private readonly windowMs: number;
	private readonly maxRequests: number;
	private readonly hits: Map<string, { count: number; expiresAt: number }>;

	constructor(windowMs: number, maxRequests: number) {
		this.windowMs = windowMs;
		this.maxRequests = maxRequests;
		this.hits = new Map();

		// Clean up expired entries every minute
		setInterval(() => this.cleanup(), 60 * 1000);
	}

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

	private cleanup() {
		const now = Date.now();
		for (const [key, record] of this.hits) {
			if (now > record.expiresAt) {
				this.hits.delete(key);
			}
		}
	}
}
