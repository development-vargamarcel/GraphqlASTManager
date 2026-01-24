export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
	id: string;
	message: string;
	type: ToastType;
	duration?: number;
}

/**
 * Global state for managing toast notifications.
 * Uses Svelte 5 Runes for reactivity.
 */
class ToastState {
	toasts = $state<Toast[]>([]);

	/**
	 * Adds a new toast notification.
	 *
	 * @param message - The text message to display.
	 * @param type - The type of toast (success, error, info, warning).
	 * @param duration - Duration in milliseconds before auto-dismissing. Defaults to 5000.
	 */
	add(message: string, type: ToastType = 'info', duration = 5000) {
		const id = crypto.randomUUID();
		const toast: Toast = { id, message, type, duration };
		this.toasts.push(toast);

		if (duration > 0) {
			setTimeout(() => {
				this.remove(id);
			}, duration);
		}
	}

	/**
	 * Removes a toast notification by its ID.
	 *
	 * @param id - The unique identifier of the toast to remove.
	 */
	remove(id: string) {
		this.toasts = this.toasts.filter((t) => t.id !== id);
	}
}

export const toastState = new ToastState();
