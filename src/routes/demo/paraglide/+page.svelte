<!--
  @component
  The localization demo page.
  Demonstrates internationalization (i18n) using Paraglide JS.
  Allows users to switch the application's locale dynamically.
-->
<script lang="ts">
	import { setLocale } from '$lib/paraglide/runtime.js';
	import { m } from '$lib/paraglide/messages.js';

	// A helper to make the buttons clearer
	const locales = [
		{ code: 'en', label: 'English' },
		{ code: 'es', label: 'Español' },
		{ code: 'it', label: 'Italiano' },
		{ code: 'ro', label: 'Română' }
	] as const;
</script>

<div class="mx-auto max-w-2xl text-center">
	<h1 class="mb-8 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
		{m.hello_world({ name: 'SvelteKit User' })}
	</h1>

	<div class="mb-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
		<p class="mb-6 text-lg text-gray-600">Select a language to switch the locale:</p>
		<div class="flex flex-wrap justify-center gap-4">
			{#each locales as locale (locale.code)}
				<button
					onclick={() => setLocale(locale.code)}
					class="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-blue-400 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
				>
					{locale.label} ({locale.code})
				</button>
			{/each}
		</div>
	</div>

	<p class="text-sm text-gray-500">
		If you use VSCode, install the <a
			href="https://marketplace.visualstudio.com/items?itemName=inlang.vs-code-extension"
			target="_blank"
			class="font-medium text-blue-600 hover:text-blue-500">Sherlock i18n extension</a
		> for a better i18n experience.
	</p>
</div>
