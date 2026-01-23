import { test, expect } from '@playwright/test';

test('verify home page and demo pages', async ({ page }) => {
	// 1. Go to the Home Page
	await page.goto('/');

	// Verify Header
	await expect(page.getByRole('link', { name: 'SvelteKit Demo' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Authentication' }).first()).toBeVisible();

	// Verify Hero Section
	await expect(
		page.getByRole('heading', { name: 'Welcome to the SvelteKit Demo Application' })
	).toBeVisible();

	// Verify Cards
	await expect(page.getByRole('link', { name: 'Authentication Secure login' })).toBeVisible();
	await expect(
		page.getByRole('link', { name: 'Localization Internationalization (i18n) using Paraglide JS.' })
	).toBeVisible();

	// 2. Go to Authentication Demo
	await page.click('text=Authentication');
	await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

	// 3. Go back and check Localization Demo
	await page.goto('/');
	await page.click('text=Localization');
	await expect(page.getByRole('heading', { name: 'Hello, SvelteKit User from en!' })).toBeVisible();
});
