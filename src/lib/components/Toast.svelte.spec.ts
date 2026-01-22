import { describe, it, expect, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import Toast from './Toast.svelte';
import { toastState } from '$lib/state/toast.svelte';

describe('Toast', () => {
	beforeEach(() => {
		toastState.toasts = [];
	});

	it('renders a toast message', async () => {
		toastState.add('Test Message', 'info');
		render(Toast);

		const toast = page.getByText('Test Message');
		await expect.element(toast).toBeInTheDocument();
	});

	it('removes a toast when close button is clicked', async () => {
		toastState.add('To be removed', 'info');
		render(Toast);

		const toast = page.getByText('To be removed');
		await expect.element(toast).toBeInTheDocument();

		const closeButton = page.getByLabelText('Close');
		await closeButton.click();

		await expect.element(toast).not.toBeInTheDocument();
	});
});
