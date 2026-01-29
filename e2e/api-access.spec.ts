import { expect, test } from '@playwright/test';

test.describe('API Access', () => {
	const username = `apitest_${Date.now()}`;
	const password = 'password123';

	test.beforeEach(async ({ page }) => {
		// Register/Login
		await page.goto('/demo/lucia/login');
		await page.click('button[data-testid="register-tab"]');
		await page.fill('input[name="username"]', username);
		await page.fill('input[name="password"]', password);
		await page.fill('input[name="confirmPassword"]', password);
		await page.click('button[data-testid="submit-button"]');
		await expect(page).toHaveURL('/demo/lucia');
	});

	test('should allow creating, viewing, using and revoking an API token', async ({
		page,
		request
	}) => {
		// Navigate to API tab
		await page.click('button:has-text("API Access")');
		await expect(page.locator('h2')).toContainText('API Access');

		// Create Token
		const tokenName = 'Test Token';
		await page.fill('input[name="name"]', tokenName);
		await page.click('button:has-text("Generate")');

		// Verify Success Block Heading (confirms UI updated to show token)
		await expect(page.getByRole('heading', { name: 'Token Created Successfully' })).toBeVisible();

		// Capture Token
		const codeBlock = page.locator('code.break-all');
		await expect(codeBlock).toBeVisible();
		const token = await codeBlock.innerText();
		expect(token).toHaveLength(64);

		// Verify token in list
		const row = page.locator('tr', { hasText: tokenName });
		await expect(row).toBeVisible();

		// Use Token to call API
		const response = await request.get('/api/v1/user', {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
		expect(response.status()).toBe(200);
		const userData = await response.json();
		expect(userData.username).toBe(username);

		// Revoke Token
		await row.locator('button:has-text("Revoke")').click();
		await expect(page.getByText('Token revoked')).toBeVisible();

		// Verify token removed from list
		await expect(page.locator('tr', { hasText: tokenName })).not.toBeVisible();

		// Verify API call fails
		const response2 = await request.get('/api/v1/user', {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
		expect(response2.status()).toBe(401);
	});
});
