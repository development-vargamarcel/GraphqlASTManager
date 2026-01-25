// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		/**
		 * Server-side local state available in requests.
		 * Populated by hooks (e.g., authentication).
		 */
		interface Locals {
			user: import('$lib/server/auth').SessionValidationResult['user'];
			session: import('$lib/server/auth').SessionValidationResult['session'];
			requestId: string;
		}

		/**
		 * Custom error shape for the application.
		 * Extends the default SvelteKit error with an ID for tracking.
		 */
		interface Error {
			message: string;
			errorId: string;
		}
	}
	// interface Locals {}
} // interface PageData {}
// interface PageState {}

// interface Platform {}
export {};
