<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types.js';

	let { form }: { form: ActionData } = $props();

	let loading = $state(false);
	let message = $derived(form?.message);
</script>

<div class="flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
	<div class="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow dark:bg-gray-800">
		<div>
			<h2 class="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
				Reset Password
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
				Enter your username to receive a password reset link.
			</p>
		</div>

		{#if message}
			<div class="rounded-md bg-green-50 p-4 dark:bg-green-900/30">
				<div class="flex">
					<div class="shrink-0">
						<svg
							class="h-5 w-5 text-green-400"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<div class="ml-3">
						<p class="text-sm font-medium text-green-800 dark:text-green-200">
							{message}
						</p>
					</div>
				</div>
			</div>
		{/if}

		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}
			class="mt-8 space-y-6"
		>
			<div>
				<label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>Username</label
				>
				<div class="mt-1">
					<input
						id="username"
						name="username"
						type="text"
						required
						class="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
					/>
				</div>
			</div>

			<div>
				<button
					type="submit"
					disabled={loading}
					class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if loading}
						Sending...
					{:else}
						Send Reset Link
					{/if}
				</button>
			</div>
		</form>

		<div class="text-center text-sm">
			<a
				href="/demo/lucia/login"
				class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
			>
				Back to Login
			</a>
		</div>
	</div>
</div>
