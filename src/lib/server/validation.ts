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

/**
 * Validates if the input is a valid note title.
 * Criteria:
 * - Must be a string
 * - Length between 1 and 100 characters
 *
 * @param title - The input to validate
 * @returns True if valid, false otherwise
 */
export function validateNoteTitle(title: unknown): title is string {
	return typeof title === 'string' && title.length >= 1 && title.length <= 100;
}

/**
 * Validates if the input is a valid note content.
 * Criteria:
 * - Must be a string
 * - Length between 1 and 1000 characters
 *
 * @param content - The input to validate
 * @returns True if valid, false otherwise
 */
export function validateNoteContent(content: unknown): content is string {
	return typeof content === 'string' && content.length >= 1 && content.length <= 1000;
}
