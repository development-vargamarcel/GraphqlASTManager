<script lang="ts">
	import { enhance } from '$app/forms';
	import { toastState } from '$lib/state/toast.svelte';
	import type { PageServerData } from './$types.js';

	let { data }: { data: PageServerData } = $props();

	let loading = $state(false);
</script>

<div class="flex min-h-[calc(100vh-12rem)] items-center justify-center">
	<div class="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow dark:bg-gray-800">
		<div class="text-center">
			<h1 class="text-3xl font-extrabold text-gray-900 dark:text-white">
				Hi, {data.user.username}!
			</h1>
			<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Your user ID is {data.user.id}</p>
		</div>

		<form
			method="post"
			action="?/logout"
			use:enhance={() => {
				loading = true;
				return async ({ update, result }) => {
					loading = false;
					if (result.type === 'redirect') {
						toastState.add('Signed out successfully', 'success');
					}
					await update();
				};
			}}
			class="mt-8 space-y-6"
		>
			<button
				type="submit"
				disabled={loading}
				class="group relative flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if loading}
					<svg
						class="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Signing out...
				{:else}
					Sign out
				{/if}
			</button>
		</form>
	</div>
</div>
