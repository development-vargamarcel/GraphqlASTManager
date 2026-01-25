import { describe, it, expect } from 'vitest';
import { parseUserAgent } from './ua.js';

describe('parseUserAgent', () => {
	it('should return Unknown Device for null', () => {
		expect(parseUserAgent(null)).toBe('Unknown Device');
	});

	it('should parse Chrome on Windows', () => {
		const ua =
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
		expect(parseUserAgent(ua)).toBe('Chrome on Windows');
	});

	it('should parse Safari on macOS', () => {
		const ua =
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15';
		expect(parseUserAgent(ua)).toBe('Safari on macOS');
	});

	it('should parse Firefox on Linux', () => {
		const ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0';
		expect(parseUserAgent(ua)).toBe('Firefox on Linux');
	});

	it('should parse iPhone', () => {
		const ua =
			'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1';
		expect(parseUserAgent(ua)).toBe('Safari on iOS');
	});
});
