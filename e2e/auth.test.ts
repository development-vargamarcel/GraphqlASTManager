import { expect, test } from '@playwright/test';

test.describe('Authentication', () => {
	const username = `testuser_${Date.now()}`;
	const password = 'password123';

	test('should allow a user to register, logout and login', async ({ page }) => {
		// Register
		await page.goto('/demo/lucia/login');
		await page.click('button[data-testid="register-tab"]'); // Switch to Register tab
		await page.fill('input[name="username"]', username);
		await page.fill('input[name="password"]', password);
		await page.fill('input[name="confirmPassword"]', password);
		await page.click('button[data-testid="submit-button"]');

		// Verify redirected to profile page
		await expect(page).toHaveURL('/demo/lucia');
		await expect(page.locator('h1')).toContainText(`Hi, ${username}!`);

		// Logout
		await page.click('button:has-text("Sign out")');
		await expect(page).toHaveURL('/demo/lucia/login');

		// Login
		// Note: Default mode is Login, so we don't strictly need to click login tab, but cleaner if we check/ensure
		// But here we just landed on login page.
		await page.fill('input[name="username"]', username);
		await page.fill('input[name="password"]', password);
		await page.click('button[data-testid="submit-button"]');

		// Verify redirected to profile page
		await expect(page).toHaveURL('/demo/lucia');
		await expect(page.locator('h1')).toContainText(`Hi, ${username}!`);
	});

	test('should show error when registering with existing username', async ({ page }) => {
		// Register with same username again
		await page.goto('/demo/lucia/login');
		await page.click('button[data-testid="register-tab"]'); // Switch to Register tab
		await page.fill('input[name="username"]', username);
		await page.fill('input[name="password"]', password);
		await page.fill('input[name="confirmPassword"]', password);
		await page.click('button[data-testid="submit-button"]');

		// Verify error message
		await expect(page.locator('#username-error')).toContainText('Username already taken');
	});

	test('should show error when login with incorrect password', async ({ page }) => {
		await page.goto('/demo/lucia/login');
		await page.fill('input[name="username"]', username);
		await page.fill('input[name="password"]', 'wrongpassword');
		await page.click('button[data-testid="submit-button"]');

		await expect(page.locator('.text-red-600')).toContainText('Incorrect username or password');
	});

	test('should show error when passwords do not match during registration', async ({ page }) => {
		await page.goto('/demo/lucia/login');
		await page.click('button[data-testid="register-tab"]');
		await page.fill('input[name="username"]', `user_${Date.now()}`);
		await page.fill('input[name="password"]', 'password123');
		await page.fill('input[name="confirmPassword"]', 'password456');

		// The button should be disabled due to client-side validation
		await expect(page.locator('button[data-testid="submit-button"]')).toBeDisabled();

		// Check for error text
		await expect(page.locator('#confirm-password-error')).toContainText('Passwords do not match');
	});
});
