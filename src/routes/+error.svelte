<!--
  @component
  The global error page.
  Displays error status and message when an unhandled error occurs or a load function fails.
-->
<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { toastState } from '$lib/state/toast.svelte';

	function copyErrorId() {
		if ($page.error?.errorId) {
			navigator.clipboard.writeText($page.error.errorId);
			toastState.add('Error ID copied to clipboard', 'success');
		}
	}
</script>

<div
	class="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16 text-center"
>
	<h1 class="text-6xl font-bold text-gray-900 dark:text-white">{$page.status}</h1>
	<p class="mt-4 text-xl text-gray-600 dark:text-gray-300">
		{$page.error?.message || 'Something went wrong'}
	</p>
	{#if $page.error?.errorId}
		<div
			class="mt-2 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400"
		>
			<p>
				Reference ID: <span class="rounded bg-gray-100 px-1 font-mono dark:bg-gray-800"
					>{$page.error.errorId}</span
				>
			</p>
			<button
				onclick={copyErrorId}
				class="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
				title="Copy Error ID"
				aria-label="Copy Error ID"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-4"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
					/>
				</svg>
			</button>
		</div>
	{/if}
	<a
		href="{base}/"
		class="mt-8 rounded-md bg-blue-600 px-6 py-3 text-white shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:hover:bg-blue-500"
	>
		Go back home
	</a>
</div>
