import { describe, it, expect } from 'vitest';
import { validateUsername, validatePassword } from './validation.js';

describe('validation', () => {
	describe('validateUsername', () => {
		it('should return true for valid usernames', () => {
			expect(validateUsername('user')).toBe(true);
			expect(validateUsername('user123')).toBe(true);
			expect(validateUsername('User_Name-1')).toBe(true);
		});

		it('should return false for invalid usernames', () => {
			expect(validateUsername('us')).toBe(false); // too short
			expect(validateUsername('a'.repeat(32))).toBe(false); // too long
			expect(validateUsername('user@name')).toBe(false); // invalid char
			expect(validateUsername(123)).toBe(false); // not a string
			expect(validateUsername('')).toBe(false);
		});
	});

	describe('validatePassword', () => {
		it('should return true for valid passwords', () => {
			expect(validatePassword('password123')).toBe(true);
			expect(validatePassword('secure-password')).toBe(true);
		});

		it('should return false for invalid passwords', () => {
			expect(validatePassword('pass')).toBe(false); // too short
			expect(validatePassword('a'.repeat(256))).toBe(false); // too long
			expect(validatePassword(123)).toBe(false); // not a string
		});
	});
});
