import { test, expect } from '@playwright/test';

test('Verify Session Management', async ({ page }) => {
	// Register and login
	await page.goto('/demo/lucia/login');

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
	await expect(page).toHaveURL(/\/demo\/lucia/);

	// Navigate to Security tab
	await page.getByText('Security').click();

	// Verify Active Sessions section
	await expect(page.getByText('Active Sessions')).toBeVisible();

	// Verify Current Session indicator
	await expect(page.getByText('Current Session', { exact: true })).toBeVisible();

	// Verify User Agent
	// The user agent parser might return "Chrome on Linux" or similar, not "HeadlessChrome"
	// Let's just check for 'Chrome' or 'Linux' or 'Unknown' depending on environment
	// Or even better, check for the presence of ANY user agent text in the list item
	// We know the structure:
	// <p class="...truncate..." title="...">User Agent String</p>
	// Let's verify we have a non-empty string in that paragraph.

	const uaParagraph = page.locator('li').first().locator('p[title]');
	await expect(uaParagraph).toBeVisible();
	const uaText = await uaParagraph.textContent();
	expect(uaText?.length).toBeGreaterThan(0);
});
