import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import Footer from './Footer.svelte';

describe('Footer', () => {
	it('renders copyright year', async () => {
		render(Footer);
		const year = new Date().getFullYear();
		const footerText = page.getByText(/All rights reserved/);
		await expect.element(footerText).toBeInTheDocument();
		await expect.element(footerText).toHaveTextContent(String(year));
	});
});
