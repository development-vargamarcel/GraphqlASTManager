<!--
  @component
  The global error page.
  Displays error status and message when an unhandled error occurs or a load function fails.
-->
<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';
</script>

<div
	class="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16 text-center"
>
	<h1 class="text-6xl font-bold text-gray-900 dark:text-white">{$page.status}</h1>
	<p class="mt-4 text-xl text-gray-600 dark:text-gray-300">
		{$page.error?.message || 'Something went wrong'}
	</p>
	{#if $page.error?.errorId}
		<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
			Reference ID: <span class="rounded bg-gray-100 px-1 font-mono dark:bg-gray-800"
				>{$page.error.errorId}</span
			>
		</p>
	{/if}
	<a
		href="{base}/"
		class="mt-8 rounded-md bg-blue-600 px-6 py-3 text-white shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:hover:bg-blue-500"
	>
		Go back home
	</a>
</div>
