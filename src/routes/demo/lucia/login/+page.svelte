<script lang="ts">
	import { enhance } from '$app/forms';
	import { toastState } from '$lib/state/toast.svelte';
	import type { ActionData } from './$types.js';

	let { form }: { form: ActionData } = $props();

	let loadingAction = $state<string | null>(null);
	let showPassword = $state(false);

	function togglePassword() {
		showPassword = !showPassword;
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow">
		<div>
			<h1 class="text-center text-3xl font-extrabold text-gray-900">Login / Register</h1>
		</div>
		<form
			method="post"
			action="?/login"
			use:enhance={({ submitter }) => {
				const isRegister =
					submitter?.hasAttribute('formaction') &&
					submitter.getAttribute('formaction')?.includes('register');
				loadingAction = isRegister ? 'register' : 'login';
				return async ({ update, result }) => {
					loadingAction = null;
					if (result.type === 'redirect') {
						toastState.add(
							isRegister ? 'Registered successfully!' : 'Logged in successfully!',
							'success'
						);
					} else if (result.type === 'error') {
						toastState.add('An unexpected error occurred.', 'error');
					}
					await update();
				};
			}}
			class="mt-8 space-y-6"
		>
			<div class="-space-y-px rounded-md shadow-sm">
				<div class="mb-4">
					<label for="username" class="block text-sm font-medium text-gray-700">Username</label>
					<input
						id="username"
						name="username"
						required
						autofocus
						minlength="3"
						maxlength="31"
						pattern="[a-z0-9_-]+"
						title="Username must be 3-31 characters long and can only contain lowercase letters, numbers, underscores, and hyphens."
						class="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
					/>
				</div>
				<div class="relative mb-4">
					<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
					<div class="relative mt-1 rounded-md shadow-sm">
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							name="password"
							required
							minlength="6"
							maxlength="255"
							class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-10 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
						/>
						<button
							type="button"
							class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 focus:outline-none"
							onclick={togglePassword}
							aria-label={showPassword ? 'Hide password' : 'Show password'}
						>
							{#if showPassword}
								<!-- Eye Slash Icon -->
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
								<!-- Eye Icon -->
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
				</div>
			</div>

			{#if form?.message}
				<div class="rounded bg-red-50 p-2 text-sm text-red-600">
					{form.message}
				</div>
			{/if}

			<div class="flex flex-col gap-3">
				<button
					type="submit"
					disabled={!!loadingAction}
					class="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if loadingAction === 'login'}
						<svg
							class="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Logging in...
					{:else}
						Login
					{/if}
				</button>
				<button
					formaction="?/register"
					disabled={!!loadingAction}
					class="group relative flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if loadingAction === 'register'}
						<svg
							class="mr-3 -ml-1 h-5 w-5 animate-spin text-gray-700"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Registering...
					{:else}
						Register
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
