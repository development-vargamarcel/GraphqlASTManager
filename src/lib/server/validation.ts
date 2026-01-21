/**
 * Validates if the input is a valid username.
 * Criteria:
 * - Must be a string
 * - Length between 3 and 31 characters
 * - Contains only alphanumeric characters, underscores, and hyphens
 *
 * @param username - The input to validate
 * @returns True if valid, false otherwise
 */
export function validateUsername(username: unknown): username is string {
	return (
		typeof username === 'string' &&
		username.length >= 3 &&
		username.length <= 31 &&
		/^[a-zA-Z0-9_-]+$/.test(username)
	);
}

/**
 * Validates if the input is a valid password.
 * Criteria:
 * - Must be a string
 * - Length between 6 and 255 characters
 *
 * @param password - The input to validate
 * @returns True if valid, false otherwise
 */
export function validatePassword(password: unknown): password is string {
	return typeof password === 'string' && password.length >= 6 && password.length <= 255;
}
