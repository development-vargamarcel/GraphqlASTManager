<!--
  @component
  The user dashboard page.
  Protected route accessible only to authenticated users.
  Provides profile management, password change, and account deletion functionality.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { toastState } from '$lib/state/toast.svelte';
	import type { ActionData, PageServerData } from './$types.js';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	let activeTab = $state('profile'); // profile, security, danger
	let loadingAction = $state<string | null>(null);

	// Password change state
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);

	let deleteConfirmation = $state('');

	/**
	 * Toggles the visibility of the current password field.
	 */
	function toggleCurrentPassword() {
		showCurrentPassword = !showCurrentPassword;
	}

	/**
	 * Toggles the visibility of the new password and confirm password fields.
	 */
	function toggleNewPassword() {
		showNewPassword = !showNewPassword;
	}

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

	let passwordsMatch = $derived(newPassword === confirmPassword);
	let errors = $derived(
		form && typeof form === 'object' && 'errors' in form ? (form as any).errors : {}
	);
	let message = $derived(
		form && typeof form === 'object' && 'message' in form ? (form as any).message : null
	);
</script>

<div class="flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
	<div class="w-full max-w-2xl space-y-8 rounded-lg bg-white p-8 shadow dark:bg-gray-800">
		<div class="text-center">
			<h1 class="text-3xl font-extrabold text-gray-900 dark:text-white">
				Hi, {data.user.username}!
			</h1>
			<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
				User ID: {data.user.id}
				<button
					class="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
					onclick={() => {
						navigator.clipboard.writeText(data.user.id);
						toastState.add('User ID copied!', 'success');
					}}
					aria-label="Copy User ID"
					title="Copy User ID to clipboard"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="inline size-4"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5"
						/>
					</svg>
				</button>
			</p>
		</div>

		<!-- Tabs -->
		<div class="border-b border-gray-200 dark:border-gray-700">
			<nav class="-mb-px flex justify-center space-x-8" aria-label="Tabs">
				<button
					onclick={() => (activeTab = 'profile')}
					class="{activeTab === 'profile'
						? 'border-blue-500 text-blue-600 dark:text-blue-400'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'} border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap"
				>
					Profile
				</button>
				<button
					onclick={() => (activeTab = 'security')}
					class="{activeTab === 'security'
						? 'border-blue-500 text-blue-600 dark:text-blue-400'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'} border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap"
				>
					Security
				</button>
				<button
					onclick={() => (activeTab = 'danger')}
					data-testid="danger-tab"
					class="{activeTab === 'danger'
						? 'border-red-500 text-red-600 dark:text-red-400'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'} border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap"
				>
					Danger Zone
				</button>
			</nav>
		</div>

		<div class="mt-6">
			{#if activeTab === 'profile'}
				<h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Profile Settings</h2>
				<form
					method="post"
					action="?/updateProfile"
					use:enhance={() => {
						loadingAction = 'updateProfile';
						return async ({ update, result }) => {
							loadingAction = null;
							if (result.type === 'success') {
								toastState.add('Profile updated successfully', 'success');
							} else if (result.type === 'failure') {
								toastState.add(
									result.data?.message?.toString() || 'Failed to update profile',
									'error'
								);
							}
							await update();
						};
					}}
					class="space-y-6"
				>
					<div>
						<label for="age" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>Age</label
						>
						<input
							type="number"
							name="age"
							id="age"
							min="0"
							max="150"
							value={data.user.age ?? ''}
							aria-invalid={!!errors?.age}
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						/>
						{#if errors?.age}
							<p class="mt-1 text-sm text-red-600">{errors.age}</p>
						{/if}
					</div>

					<div>
						<label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>Bio</label
						>
						<textarea
							name="bio"
							id="bio"
							rows="3"
							maxlength="500"
							aria-invalid={!!errors?.bio}
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							placeholder="Tell us about yourself...">{data.user.bio ?? ''}</textarea
						>
						<div class="mt-1 flex justify-between">
							{#if errors?.bio}
								<p class="text-sm text-red-600">{errors.bio}</p>
							{:else}
								<span></span>
							{/if}
							<p class="text-xs text-gray-500 dark:text-gray-400">Max 500 characters</p>
						</div>
					</div>

					<button
						type="submit"
						disabled={loadingAction === 'updateProfile'}
						class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if loadingAction === 'updateProfile'}
							Saving...
						{:else}
							Save Changes
						{/if}
					</button>

					<div class="border-t border-gray-200 pt-6 dark:border-gray-700">
						<h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">Your Data</h3>
						<div class="mt-4">
							<a
								href="/demo/lucia/export"
								class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="mr-2 -ml-1 h-5 w-5"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
									/>
								</svg>
								Download My Data
							</a>
							<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
								Download a copy of your personal data and session history in JSON format.
							</p>
						</div>
					</div>
				</form>
			{:else if activeTab === 'security'}
				<h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Change Password</h2>
				<form
					method="post"
					action="?/changePassword"
					use:enhance={() => {
						loadingAction = 'changePassword';
						return async ({ update, result }) => {
							loadingAction = null;
							if (result.type === 'success') {
								toastState.add('Password changed successfully', 'success');
								// Reset form fields
								currentPassword = '';
								newPassword = '';
								confirmPassword = '';
							} else if (result.type === 'failure') {
								toastState.add(
									result.data?.message?.toString() || 'Failed to change password',
									'error'
								);
							}
							await update();
						};
					}}
					class="space-y-6"
				>
					<div class="relative">
						<label
							for="currentPassword"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>Current Password</label
						>
						<div class="relative mt-1">
							<input
								type={showCurrentPassword ? 'text' : 'password'}
								name="currentPassword"
								id="currentPassword"
								required
								bind:value={currentPassword}
								aria-invalid={!!errors?.currentPassword}
								class="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/>
							<button
								type="button"
								class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 focus:outline-none"
								onclick={toggleCurrentPassword}
								aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
							>
								{#if showCurrentPassword}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="size-5"
										aria-hidden="true"
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
										aria-hidden="true"
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
						{#if errors?.currentPassword}
							<p class="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
						{/if}
					</div>
					<div class="relative">
						<label
							for="newPassword"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label
						>
						<div class="relative mt-1">
							<input
								type={showNewPassword ? 'text' : 'password'}
								name="newPassword"
								id="newPassword"
								required
								minlength="6"
								bind:value={newPassword}
								aria-invalid={!!errors?.newPassword}
								class="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/>
							<button
								type="button"
								class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 focus:outline-none"
								onclick={toggleNewPassword}
								aria-label={showNewPassword ? 'Hide password' : 'Show password'}
							>
								{#if showNewPassword}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="size-5"
										aria-hidden="true"
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
										aria-hidden="true"
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
						{#if errors?.newPassword}
							<p class="mt-1 text-sm text-red-600">{errors.newPassword}</p>
						{/if}
					</div>
					<div>
						<label
							for="confirmPassword"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>Confirm Password</label
						>
						<input
							type={showNewPassword ? 'text' : 'password'}
							name="confirmPassword"
							id="confirmPassword"
							required
							bind:value={confirmPassword}
							aria-invalid={(!passwordsMatch && confirmPassword.length > 0) ||
								!!errors?.confirmPassword}
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						/>
						{#if !passwordsMatch && confirmPassword.length > 0}
							<p class="mt-1 text-sm text-red-600">Passwords do not match</p>
						{:else if errors?.confirmPassword}
							<p class="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
						{/if}
					</div>
					<button
						type="submit"
						disabled={loadingAction === 'changePassword' ||
							!passwordsMatch ||
							newPassword.length === 0}
						class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if loadingAction === 'changePassword'}
							Updating...
						{:else}
							Update Password
						{/if}
					</button>
				</form>

				<div class="border-t border-gray-200 pt-6 dark:border-gray-700">
					<div class="flex items-center justify-between">
						<h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
							Active Sessions
						</h3>
						<div class="flex gap-2">
							{#if data.sessions.length > 1}
								<form
									method="post"
									action="?/revokeOtherSessions"
									use:enhance={() => {
										loadingAction = 'revokeOtherSessions';
										return async ({ update, result }) => {
											loadingAction = null;
											if (result.type === 'success') {
												toastState.add('All other sessions revoked', 'success');
											}
											await update();
										};
									}}
								>
									<button
										type="submit"
										disabled={loadingAction === 'revokeOtherSessions'}
										class="inline-flex items-center rounded border border-transparent bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
									>
										{#if loadingAction === 'revokeOtherSessions'}
											Revoking...
										{:else}
											Revoke Others
										{/if}
									</button>
								</form>
							{/if}
							<form
								method="post"
								action="?/revokeAllSessions"
								use:enhance={() => {
									loadingAction = 'revokeAllSessions';
									return async ({ update, result }) => {
										loadingAction = null;
										if (result.type === 'redirect') {
											toastState.add('Signed out everywhere', 'success');
										}
										await update();
									};
								}}
							>
								<button
									type="submit"
									disabled={loadingAction === 'revokeAllSessions'}
									class="inline-flex items-center rounded border border-transparent bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
								>
									{#if loadingAction === 'revokeAllSessions'}
										Signing out...
									{:else}
										Sign out everywhere
									{/if}
								</button>
							</form>
						</div>
					</div>
					<div
						class="mt-4 overflow-hidden rounded-md border border-gray-200 shadow-sm dark:border-gray-700"
					>
						<ul class="divide-y divide-gray-200 dark:divide-gray-700">
							{#each data.sessions as session (session.id)}
								<li
									class="flex items-center justify-between bg-white px-4 py-4 sm:px-6 dark:bg-gray-800"
								>
									<div class="flex-1 truncate">
										<div class="flex items-center space-x-3">
											<p class="truncate text-sm font-medium text-gray-900 dark:text-white">
												{session.ipAddress || 'Unknown IP'}
											</p>
											{#if session.id === data.currentSessionId}
												<span
													class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
												>
													Current Session
												</span>
											{/if}
										</div>
										<p
											class="mt-1 truncate text-xs text-gray-500 dark:text-gray-400"
											title={session.userAgent}
										>
											{session.userAgent || 'Unknown User Agent'}
										</p>
										<p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
											Expires: {new Date(session.expiresAt).toLocaleDateString()}
										</p>
									</div>
									<div>
										{#if session.id !== data.currentSessionId}
											<form
												method="post"
												action="?/revokeSession"
												use:enhance={() => {
													loadingAction = `revoke-${session.id}`;
													return async ({ update, result }) => {
														loadingAction = null;
														if (result.type === 'success') {
															toastState.add('Session revoked', 'success');
														}
														await update();
													};
												}}
											>
												<input type="hidden" name="sessionId" value={session.id} />
												<button
													type="submit"
													disabled={loadingAction === `revoke-${session.id}`}
													class="inline-flex items-center rounded border border-transparent bg-red-100 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
												>
													{#if loadingAction === `revoke-${session.id}`}
														Revoking...
													{:else}
														Revoke
													{/if}
												</button>
											</form>
										{/if}
									</div>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			{:else if activeTab === 'danger'}
				<h2 class="mb-4 text-xl font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
				<div
					class="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
				>
					<h3 class="text-sm font-medium text-red-800 dark:text-red-200">Delete Account</h3>
					<div class="mt-2 text-sm text-red-700 dark:text-red-300">
						<p>
							Once you delete your account, there is no going back. Please be certain.
							<br />
							Type
							<code
								class="rounded bg-red-100 px-1 py-0.5 font-mono font-bold text-red-800 dark:bg-red-900 dark:text-red-200"
								>DELETE</code
							> to confirm.
						</p>
					</div>
					<div class="mt-4">
						<form
							method="post"
							action="?/deleteAccount"
							use:enhance={() => {
								loadingAction = 'deleteAccount';
								return async ({ update, result }) => {
									loadingAction = null;
									if (result.type === 'redirect') {
										toastState.add('Account deleted successfully', 'success');
									} else if (result.type === 'failure') {
										toastState.add(
											result.data?.message?.toString() || 'Failed to delete account',
											'error'
										);
									}
									await update();
								};
							}}
						>
							<div class="mb-4">
								<label for="confirmation" class="sr-only">Confirmation</label>
								<input
									type="text"
									name="confirmation"
									id="confirmation"
									placeholder="Type DELETE"
									class="block w-full rounded-md border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm dark:border-red-700 dark:bg-red-900/30 dark:text-white dark:placeholder-red-300"
									bind:value={deleteConfirmation}
								/>
							</div>
							<button
								type="submit"
								data-testid="delete-account-button"
								disabled={loadingAction === 'deleteAccount' || deleteConfirmation !== 'DELETE'}
								class="inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							>
								{#if loadingAction === 'deleteAccount'}
									Deleting...
								{:else}
									Delete Account
								{/if}
							</button>
						</form>
					</div>
				</div>
			{/if}
		</div>

		<div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
			<form
				method="post"
				action="?/logout"
				use:enhance={() => {
					loadingAction = 'logout';
					return async ({ update, result }) => {
						loadingAction = null;
						if (result.type === 'redirect') {
							toastState.add('Signed out successfully', 'success');
						}
						await update();
					};
				}}
			>
				<button
					type="submit"
					disabled={loadingAction === 'logout'}
					class="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
				>
					{#if loadingAction === 'logout'}
						Signing out...
					{:else}
						Sign out
					{/if}
				</button>
			</form>
		</div>
	</div>
</div>
