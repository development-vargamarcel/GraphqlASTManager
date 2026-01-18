import { expect, test } from '@playwright/test';

test.describe('Authentication', () => {
	const username = `testuser_${Date.now()}`;
	const password = 'password123';

	test('should allow a user to register, logout and login', async ({ page }) => {
		// Register
		await page.goto('/demo/lucia/login');
		await page.fill('input[name="username"]', username);
		await page.fill('input[name="password"]', password);
		await page.click('button:has-text("Register")');

		// Verify redirected to profile page
		await expect(page).toHaveURL('/demo/lucia');
		await expect(page.locator('h1')).toContainText(`Hi, ${username}!`);

		// Logout
		await page.click('button:has-text("Sign out")');
		await expect(page).toHaveURL('/demo/lucia/login');

		// Login
		await page.fill('input[name="username"]', username);
		await page.fill('input[name="password"]', password);
		await page.click('button:has-text("Login")');

		// Verify redirected to profile page
		await expect(page).toHaveURL('/demo/lucia');
		await expect(page.locator('h1')).toContainText(`Hi, ${username}!`);
	});

	test('should show error when registering with existing username', async ({ page }) => {
		// Register with same username again
		await page.goto('/demo/lucia/login');
		await page.fill('input[name="username"]', username);
		await page.fill('input[name="password"]', password);
		await page.click('button:has-text("Register")');

		// Verify error message
		await expect(page.locator('.text-red-600')).toContainText('Username already taken');
	});

	test('should show error when login with incorrect password', async ({ page }) => {
		await page.goto('/demo/lucia/login');
		await page.fill('input[name="username"]', username);
		await page.fill('input[name="password"]', 'wrongpassword');
		await page.click('button:has-text("Login")');

		await expect(page.locator('.text-red-600')).toContainText('Incorrect username or password');
	});
});
