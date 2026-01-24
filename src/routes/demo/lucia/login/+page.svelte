<!--
  @component
  The combined Login and Registration page.
  Uses a tabbed interface to toggle between login and register forms.
  Handles authentication submissions via SvelteKit actions.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { toastState } from '$lib/state/toast.svelte';
	import type { ActionData } from './$types.js';

	let { form }: { form: ActionData } = $props();

	let loadingAction = $state<string | null>(null);
	let showPassword = $state(false);
	let password = $state('');
	let confirmPassword = $state('');
	let isRegister = $state(false);

	let strength = $derived.by(() => {
		let score = 0;
		if (password.length > 5) score++;
		if (password.length > 10) score++;
		if (/[A-Z]/.test(password)) score++;
		if (/[0-9]/.test(password)) score++;
		if (/[^A-Za-z0-9]/.test(password)) score++;
		return Math.min(score, 4);
	});

	let passwordsMatch = $derived(isRegister ? password === confirmPassword : true);

	function togglePassword() {
		showPassword = !showPassword;
	}
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-900"
>
	<div class="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow dark:bg-gray-800">
		<div>
			<h1 class="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
				{isRegister ? 'Create an Account' : 'Welcome Back'}
			</h1>
			<div class="mt-4 flex justify-center border-b border-gray-200 dark:border-gray-700">
				<button
					data-testid="login-tab"
					class="px-4 pb-2 text-sm font-medium {!isRegister
						? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
						: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}"
					onclick={() => (isRegister = false)}
				>
					Login
				</button>
				<button
					data-testid="register-tab"
					class="px-4 pb-2 text-sm font-medium {isRegister
						? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
						: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}"
					onclick={() => (isRegister = true)}
				>
					Register
				</button>
			</div>
		</div>
		<form
			method="post"
			action={isRegister ? '?/register' : '?/login'}
			use:enhance={({ submitter }) => {
				const action = submitter?.getAttribute('formaction');
				const isRegisterAction = action?.includes('register') || isRegister;
				loadingAction = isRegisterAction ? 'register' : 'login';
				return async ({ update, result }) => {
					loadingAction = null;
					if (result.type === 'redirect') {
						toastState.add(
							isRegisterAction ? 'Registered successfully!' : 'Logged in successfully!',
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
			<div class="-space-y-px space-y-4 rounded-md shadow-sm">
				<div>
					<label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
						>Username</label
					>
					<!-- svelte-ignore a11y_autofocus -->
					<input
						id="username"
						name="username"
						autocomplete="username"
						required
						autofocus
						minlength="3"
						maxlength="31"
						pattern="[a-zA-Z0-9_-]+"
						title="Username must be 3-31 characters long and can only contain letters, numbers, underscores, and hyphens."
						aria-invalid={!!form?.errors?.username}
						aria-describedby="username-helper {form?.errors?.username ? 'username-error' : ''}"
						class="mt-1 block w-full appearance-none rounded-md border px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 {form
							?.errors?.username
							? 'border-red-500 focus:border-red-500 focus:ring-red-500'
							: 'border-gray-300 dark:border-gray-600'}"
					/>
					<p id="username-helper" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
						3-31 characters, alphanumeric, -, _
					</p>
					{#if form?.errors?.username}
						<p id="username-error" class="mt-1 text-sm text-red-600">{form.errors.username}</p>
					{/if}
				</div>
				<div class="relative">
					<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
						>Password</label
					>
					<div class="relative mt-1 rounded-md shadow-sm">
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							name="password"
							autocomplete={isRegister ? 'new-password' : 'current-password'}
							required
							minlength="6"
							maxlength="255"
							bind:value={password}
							aria-invalid={!!form?.errors?.password}
							aria-describedby="password-helper {form?.errors?.password ? 'password-error' : ''}"
							class="block w-full appearance-none rounded-md border px-3 py-2 pr-10 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 {form
								?.errors?.password
								? 'border-red-500 focus:border-red-500 focus:ring-red-500'
								: 'border-gray-300 dark:border-gray-600'}"
						/>
						<button
							type="button"
							class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 focus:outline-none"
							onclick={togglePassword}
							aria-label={showPassword ? 'Hide password' : 'Show password'}
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
					{#if password.length > 0}
						<div class="mt-2 flex gap-1">
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
					{/if}
					<p id="password-helper" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
						Min. 6 characters
					</p>
					{#if form?.errors?.password}
						<p id="password-error" class="mt-1 text-sm text-red-600">{form.errors.password}</p>
					{/if}
				</div>

				{#if isRegister}
					<div class="relative">
						<label
							for="confirmPassword"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>Confirm Password</label
						>
						<div class="relative mt-1 rounded-md shadow-sm">
							<input
								id="confirmPassword"
								type={showPassword ? 'text' : 'password'}
								name="confirmPassword"
								autocomplete="new-password"
								required
								minlength="6"
								maxlength="255"
								bind:value={confirmPassword}
								aria-invalid={!!form?.errors?.confirmPassword ||
									(!passwordsMatch && confirmPassword.length > 0)}
								aria-describedby="confirm-password-error"
								class="block w-full appearance-none rounded-md border px-3 py-2 pr-10 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 {form
									?.errors?.confirmPassword ||
								(!passwordsMatch && confirmPassword.length > 0)
									? 'border-red-500 focus:border-red-500 focus:ring-red-500'
									: 'border-gray-300 dark:border-gray-600'}"
							/>
						</div>
						{#if !passwordsMatch && confirmPassword.length > 0}
							<p id="confirm-password-error" class="mt-1 text-sm text-red-600">
								Passwords do not match
							</p>
						{:else if form?.errors?.confirmPassword}
							<p id="confirm-password-error" class="mt-1 text-sm text-red-600">
								{form.errors.confirmPassword}
							</p>
						{/if}
					</div>
				{/if}
			</div>

			{#if form?.message}
				<div class="rounded bg-red-50 p-2 text-sm text-red-600">
					{form.message}
				</div>
			{/if}

			<div class="flex flex-col gap-3">
				{#if isRegister}
					<button
						data-testid="submit-button"
						type="submit"
						formaction="?/register"
						disabled={!!loadingAction || !passwordsMatch}
						class="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if loadingAction === 'register'}
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
							Registering...
						{:else}
							Register
						{/if}
					</button>
				{:else}
					<button
						data-testid="submit-button"
						type="submit"
						formaction="?/login"
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
				{/if}
			</div>

			<div class="mt-4 text-center">
				<a
					href="/"
					class="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
					>← Back to Home</a
				>
			</div>
		</form>
	</div>
</div>
