import { test, expect } from '@playwright/test';

test('Verify Session Management', async ({ page }) => {
	// Register and login
	await page.goto('http://localhost:5174/demo/lucia/login');

	// Wait for hydration
	await page.waitForTimeout(500);

	// Click Register tab
	await page.getByTestId('register-tab').click();

	// Wait for state change - heading should say "Create an Account"
	await expect(page.getByRole('heading', { name: 'Create an Account' })).toBeVisible({
		timeout: 10000
	});

	const uniqueUsername = `session_user_${Date.now()}`;
	await page.fill('input[name="username"]', uniqueUsername);
	await page.fill('input[name="password"]', 'password123');

	// Now confirm password should be there
	const confirmInput = page.locator('input[name="confirmPassword"]');
	await expect(confirmInput).toBeVisible();
	await confirmInput.fill('password123');

	await page.getByTestId('submit-button').click();

	// Wait for dashboard
	await expect(page).toHaveURL('http://localhost:5174/demo/lucia');

	// Navigate to Security tab
	await page.getByText('Security').click();

	// Verify Active Sessions section
	await expect(page.getByText('Active Sessions')).toBeVisible();

	// Verify Current Session indicator
	await expect(page.getByText('Current', { exact: true })).toBeVisible();

	// Verify User Agent
	await expect(page.getByText('HeadlessChrome')).toBeVisible();
});
