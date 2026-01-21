<script lang="ts">
	import { page } from '$app/state';
</script>

<header class="bg-white shadow-sm">
	<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
		<div class="flex items-center">
			<a href="/" class="text-xl font-bold text-gray-900">SvelteKit Demo</a>
			<nav class="ml-10 hidden space-x-8 md:flex">
				<a
					href="/"
					class:text-blue-600={page.url.pathname === '/'}
					class:text-gray-500={page.url.pathname !== '/'}
					class="text-sm font-medium hover:text-gray-900">Home</a
				>
				<a
					href="/demo/lucia"
					class:text-blue-600={page.url.pathname.startsWith('/demo/lucia')}
					class:text-gray-500={!page.url.pathname.startsWith('/demo/lucia')}
					class="text-sm font-medium hover:text-gray-900">Authentication</a
				>
				<a
					href="/demo/paraglide"
					class:text-blue-600={page.url.pathname.startsWith('/demo/paraglide')}
					class:text-gray-500={!page.url.pathname.startsWith('/demo/paraglide')}
					class="text-sm font-medium hover:text-gray-900">Localization</a
				>
			</nav>
		</div>
		<div class="flex items-center space-x-4">
			<!-- Placeholder for user profile or extra actions -->
		</div>
	</div>
</header>
