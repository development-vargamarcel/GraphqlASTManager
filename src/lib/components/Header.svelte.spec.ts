import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import Header from './Header.svelte';

vi.mock('$app/state', () => ({
	page: {
		url: new URL('http://localhost/')
	}
}));

describe('Header', () => {
	it('renders navigation links', async () => {
		render(Header);
		const homeLink = page.getByText('Home');
		await expect.element(homeLink).toBeInTheDocument();

		const authLink = page.getByText('Authentication');
		await expect.element(authLink).toBeInTheDocument();

		const locLink = page.getByText('Localization');
		await expect.element(locLink).toBeInTheDocument();
	});
});
