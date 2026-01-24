import { expect, test } from '@playwright/test';

test.describe('Dashboard & User Management', () => {
	const username = `dashboard_user_${Date.now()}`;
	const password = 'password123';
	const newPassword = 'newpassword123';

	test('should allow user to update profile, change password, and delete account', async ({
		page
	}) => {
		// 1. Register a new user
		await page.goto('/demo/lucia/login');
		await page.click('button[data-testid="register-tab"]');
		await page.fill('input[name="username"]', username);
		await page.fill('input[name="password"]', password);
		await page.fill('input[name="confirmPassword"]', password);
		await page.click('button[data-testid="submit-button"]');
		await expect(page).toHaveURL('/demo/lucia');

		// 2. Update Profile (Age)
		// Ensure we are on the Profile tab (default)
		await expect(page.locator('h2')).toContainText('Profile Settings');
		await page.fill('input[name="age"]', '30');
		await page.click('button:has-text("Save Changes")');
		// We expect a toast or some feedback, but mainly we want to verify persistence.
		// Let's reload to verify persistence
		await page.reload();
		await expect(page.locator('input[name="age"]')).toHaveValue('30');

		// 3. Change Password
		await page.click('button:has-text("Security")');
		await expect(page.locator('h2')).toContainText('Change Password');

		await page.fill('input[name="currentPassword"]', password);
		await page.fill('input[name="newPassword"]', newPassword);
		await page.fill('input[name="confirmPassword"]', newPassword);
		await page.click('button:has-text("Update Password")');
		// Wait for potential toast or completion
		await expect(page.locator('input[name="currentPassword"]')).toHaveValue(''); // Form reset indicates success

		// 4. Logout
		await page.click('button:has-text("Sign out")');
		await expect(page).toHaveURL('/demo/lucia/login');

		// 5. Login with OLD password (should fail)
		await page.fill('input[name="username"]', username);
		await page.fill('input[name="password"]', password);
		await page.click('button[data-testid="submit-button"]');
		await expect(page.locator('.text-red-600')).toContainText('Incorrect username or password');

		// 6. Login with NEW password (should succeed)
		await page.fill('input[name="password"]', newPassword); // Username is still filled usually, but let's refill to be safe if cleared
		await page.fill('input[name="username"]', username);
		await page.click('button[data-testid="submit-button"]');
		await expect(page).toHaveURL('/demo/lucia');

		// 7. Delete Account
		await page.click('button[data-testid="danger-tab"]');
		await expect(page.locator('h2')).toContainText('Danger Zone');

		await page.fill('input[name="confirmation"]', 'DELETE');
		await page.click('button[data-testid="delete-account-button"]');
		await expect(page).toHaveURL('/demo/lucia/login');

		// 8. Login with NEW password (should fail as user is deleted)
		await page.fill('input[name="username"]', username);
		await page.fill('input[name="password"]', newPassword);
		await page.click('button[data-testid="submit-button"]');
		await expect(page.locator('.text-red-600')).toContainText('Incorrect username or password');
	});
});
