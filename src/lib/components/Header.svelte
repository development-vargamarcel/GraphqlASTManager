<!--
  @component
  The main application header.
  Includes the navigation menu and theme toggle.
  Responsive design: shows a hamburger menu on small screens (currently hidden in this implementation) and full menu on larger screens.
-->
<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from './ThemeToggle.svelte';
</script>

<header class="bg-white shadow-sm dark:border-b dark:border-gray-700 dark:bg-gray-800">
	<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
		<div class="flex items-center">
			<a href="/" class="text-xl font-bold text-gray-900 dark:text-white">SvelteKit Demo</a>
			<nav class="ml-10 hidden space-x-8 md:flex">
				<a
					href="/"
					aria-current={page.url.pathname === '/' ? 'page' : undefined}
					class:text-blue-600={page.url.pathname === '/'}
					class:text-gray-500={page.url.pathname !== '/'}
					class="text-sm font-medium hover:text-gray-900 dark:text-gray-300 dark:hover:text-white {page
						.url.pathname === '/'
						? 'dark:text-blue-400'
						: ''}">Home</a
				>
				<a
					href="/demo/lucia"
					aria-current={page.url.pathname.startsWith('/demo/lucia') ? 'page' : undefined}
					class:text-blue-600={page.url.pathname.startsWith('/demo/lucia')}
					class:text-gray-500={!page.url.pathname.startsWith('/demo/lucia')}
					class="text-sm font-medium hover:text-gray-900 dark:text-gray-300 dark:hover:text-white {page.url.pathname.startsWith(
						'/demo/lucia'
					)
						? 'dark:text-blue-400'
						: ''}">Authentication</a
				>
				<a
					href="/demo/paraglide"
					aria-current={page.url.pathname.startsWith('/demo/paraglide') ? 'page' : undefined}
					class:text-blue-600={page.url.pathname.startsWith('/demo/paraglide')}
					class:text-gray-500={!page.url.pathname.startsWith('/demo/paraglide')}
					class="text-sm font-medium hover:text-gray-900 dark:text-gray-300 dark:hover:text-white {page.url.pathname.startsWith(
						'/demo/paraglide'
					)
						? 'dark:text-blue-400'
						: ''}">Localization</a
				>
			</nav>
		</div>
		<div class="flex items-center space-x-4">
			<ThemeToggle />
			<!-- Placeholder for user profile or extra actions -->
		</div>
	</div>
</header>
