import { expect, test } from '@playwright/test';
import Database from 'better-sqlite3';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';

test.describe('Password Reset', () => {
	let username = '';
	const password = 'password123';
	const newPassword = 'newpassword123';

	test.beforeEach(async ({ page }) => {
		username = `reset_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
		// Register user first
		await page.goto('/demo/lucia/login');
		await page.click('button[data-testid="register-tab"]');
		await page.fill('input[name="username"]', username);
		await page.fill('input[name="password"]', password);
		await page.fill('input[name="confirmPassword"]', password);
		await page.click('button[data-testid="submit-button"]');
		await expect(page).toHaveURL('/demo/lucia');

		// Logout
		await page.click('button:has-text("Sign out")');
	});

	test('should request password reset', async ({ page }) => {
		await page.goto('/demo/lucia/login');
		await page.click('text=Forgot your password?');
		await expect(page).toHaveURL('/demo/lucia/login/forgot');

		await page.fill('input[name="username"]', username);
		await page.click('button:has-text("Send Reset Link")');

		await expect(page.locator('text=If an account with that username exists')).toBeVisible();
	});

	test('should reset password with valid token', async ({ page }) => {
		// Helper to access DB without SvelteKit context
		const db = new Database('local.db');
		const rawToken = `test-reset-token-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

		try {
			// 1. Get User ID
			const userRecord = db.prepare('SELECT id FROM user WHERE username = ?').get(username) as { id: string };
			if (!userRecord) throw new Error('User not found');

			// 2. Insert Token
			const tokenHash = encodeHexLowerCase(sha256(new TextEncoder().encode(rawToken)));
			// Drizzle stores timestamps as ms (integer) when mode: 'timestamp'
			const expiresAtMs = Date.now() + 1000 * 60 * 15;

			db.prepare('INSERT INTO password_reset_token (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(
				tokenHash,
				userRecord.id,
				expiresAtMs
			);
		} finally {
			db.close();
		}

		// 3. Visit Reset Link
		await page.goto(`/demo/lucia/login/reset/${rawToken}`);

		// 4. Submit New Password
		await page.fill('input[name="password"]', newPassword);
		await page.fill('input[name="confirmPassword"]', newPassword);
		await page.click('button:has-text("Reset Password")');

		// 5. Verify Auto-Login / Dashboard
		await expect(page).toHaveURL('/demo/lucia');
		await expect(page.locator('h1')).toContainText(`Hi, ${username}!`);

		// 6. Verify Old Password doesn't work (Logout first)
		await page.click('button:has-text("Sign out")');
		await page.fill('input[name="username"]', username);
		await page.fill('input[name="password"]', password);
		await page.click('button[data-testid="submit-button"]');
		await expect(page.locator('.text-red-600')).toContainText('Incorrect username or password');

		// 7. Verify New Password works
		await page.fill('input[name="password"]', newPassword);
		await page.click('button[data-testid="submit-button"]');
		await expect(page).toHaveURL('/demo/lucia');
	});
});
