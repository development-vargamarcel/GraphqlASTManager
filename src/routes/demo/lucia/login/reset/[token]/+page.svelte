<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types.js';

	let { form }: { form: ActionData } = $props();

	let loading = $state(false);
	let newPassword = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);

	let passwordsMatch = $derived(newPassword === confirmPassword);
	let message = $derived(form?.message);

	/**
	 * Calculates the strength of the new password.
	 * Score ranges from 0 to 4 based on length and character types.
	 */
	let strength = $derived.by(() => {
		let score = 0;
		if (newPassword.length > 5) score++;
		if (newPassword.length > 10) score++;
		if (/[A-Z]/.test(newPassword)) score++;
		if (/[0-9]/.test(newPassword)) score++;
		if (/[^A-Za-z0-9]/.test(newPassword)) score++;
		return Math.min(score, 4);
	});

	function toggleShowPassword() {
		showPassword = !showPassword;
	}
</script>

<div class="flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
	<div class="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow dark:bg-gray-800">
		<div>
			<h2 class="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
				Set New Password
			</h2>
		</div>

		{#if message}
			<div class="rounded-md bg-red-50 p-4 dark:bg-red-900/30">
				<div class="flex">
					<div class="shrink-0">
						<svg
							class="h-5 w-5 text-red-400"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<div class="ml-3">
						<p class="text-sm font-medium text-red-800 dark:text-red-200">
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
			<div class="space-y-4">
				<div class="relative">
					<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
						>New Password</label
					>
					<div class="relative mt-1">
						<input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							required
							minlength="6"
							bind:value={newPassword}
							class="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
						/>
						<button
							type="button"
							class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 focus:outline-none"
							onclick={toggleShowPassword}
						>
							{#if showPassword}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="size-5"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
									/>
								</svg>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="size-5"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
									/>
								</svg>
							{/if}
						</button>
					</div>
					<!-- Strength Meter -->
					{#if newPassword.length > 0}
						<div class="mt-2 flex gap-1" aria-hidden="true">
							{#each Array(4) as _, i (i)}
								<div
									class="h-1 flex-1 rounded-full transition-colors duration-300 {i < strength
										? strength <= 1
											? 'bg-red-500'
											: strength === 2
												? 'bg-yellow-500'
												: strength === 3
													? 'bg-blue-500'
													: 'bg-green-500'
										: 'bg-gray-200 dark:bg-gray-600'}"
								></div>
							{/each}
						</div>
						<div aria-live="polite">
							<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
								{#if strength <= 1}
									Weak
								{:else if strength === 2}
									Fair
								{:else if strength === 3}
									Good
								{:else}
									Strong
								{/if}
							</p>
						</div>
					{/if}
				</div>

				<div>
					<label
						for="confirmPassword"
						class="block text-sm font-medium text-gray-700 dark:text-gray-300"
						>Confirm Password</label
					>
					<div class="mt-1">
						<input
							id="confirmPassword"
							name="confirmPassword"
							type={showPassword ? 'text' : 'password'}
							required
							bind:value={confirmPassword}
							class="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
						/>
					</div>
					{#if !passwordsMatch && confirmPassword}
						<p class="mt-1 text-sm text-red-600">Passwords do not match</p>
					{/if}
				</div>
			</div>

			<div>
				<button
					type="submit"
					disabled={loading || !passwordsMatch || !newPassword}
					class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if loading}
						Resetting...
					{:else}
						Reset Password
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
