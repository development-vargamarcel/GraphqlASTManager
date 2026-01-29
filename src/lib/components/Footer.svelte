<!--
  @component
  The main application footer.
  Displays copyright information.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	let systemStatus = $state<'loading' | 'ok' | 'error'>('loading');

	onMount(async () => {
		try {
			const res = await fetch('/api/health');
			if (res.ok) {
				systemStatus = 'ok';
			} else {
				systemStatus = 'error';
			}
		} catch (_e) {
			systemStatus = 'error';
		}
	});
</script>

<footer class="mt-auto border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
	<div
		class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8"
	>
		<p class="text-sm text-gray-500 dark:text-gray-400">
			&copy; {new Date().getFullYear()} SvelteKit Demo App. All rights reserved.
		</p>
		<div class="flex flex-col items-end gap-1">
			<div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
				<span class="font-medium">System Status:</span>
				{#if systemStatus === 'loading'}
					<span class="block h-2 w-2 animate-pulse rounded-full bg-gray-400"></span>
					<span>Checking...</span>
				{:else if systemStatus === 'ok'}
					<span class="block h-2 w-2 rounded-full bg-green-500"></span>
					<span>Operational</span>
				{:else}
					<span class="block h-2 w-2 rounded-full bg-red-500"></span>
					<span>Issue Detected</span>
				{/if}
			</div>
			{#if page.data.requestId}
				<p class="text-[10px] text-gray-400 dark:text-gray-600" title="Request ID">
					ID: {page.data.requestId}
				</p>
			{/if}
		</div>
	</div>
</footer>
