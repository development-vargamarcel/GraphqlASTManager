<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';
</script>

<div
	class="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-16 text-center"
>
	<h1 class="text-6xl font-bold text-gray-900">{$page.status}</h1>
	<p class="mt-4 text-xl text-gray-600">{$page.error?.message || 'Something went wrong'}</p>
	<a
		href="{base}/"
		class="mt-8 rounded-md bg-blue-600 px-6 py-3 text-white shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
	>
		Go back home
	</a>
</div>
