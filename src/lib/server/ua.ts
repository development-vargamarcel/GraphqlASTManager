/**
 * Parses a User Agent string to extract a human-readable browser and OS name.
 * A simplified implementation without external dependencies.
 *
 * @param ua - The user agent string.
 * @returns A string like "Chrome on Windows" or "Safari on iOS".
 */
export function parseUserAgent(ua: string | null): string {
	if (!ua) return 'Unknown Device';

	let browser = 'Unknown Browser';
	if (ua.includes('Firefox')) browser = 'Firefox';
	else if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
	else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
	else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge';
	else if (ua.includes('Chrome')) browser = 'Chrome';
	else if (ua.includes('Safari')) browser = 'Safari';

	let os = 'Unknown OS';
	if (ua.includes('Windows')) os = 'Windows';
	else if (ua.includes('Android')) os = 'Android';
	else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) os = 'iOS';
	else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
	else if (ua.includes('Linux')) os = 'Linux';

	return `${browser} on ${os}`;
}
