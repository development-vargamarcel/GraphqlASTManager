export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
	id: string;
	message: string;
	type: ToastType;
	duration?: number;
}

class ToastState {
	toasts = $state<Toast[]>([]);

	add(message: string, type: ToastType = 'info', duration = 3000) {
		const id = crypto.randomUUID();
		const toast: Toast = { id, message, type, duration };
		this.toasts.push(toast);

		if (duration > 0) {
			setTimeout(() => {
				this.remove(id);
			}, duration);
		}
	}

	remove(id: string) {
		this.toasts = this.toasts.filter((t) => t.id !== id);
	}
}

export const toastState = new ToastState();
