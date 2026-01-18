<script lang="ts">
	import { setLocale } from '$lib/paraglide/runtime.js';
	import { m } from '$lib/paraglide/messages.js';

    let currentLocale = $state("en"); // This would ideally come from the runtime, but simplified for this view if needed.
    // In a real app we might subscribe to language tag changes.

    // A helper to make the buttons clearer
    const locales = [
        { code: 'en', label: 'English' },
        { code: 'es', label: 'Español' },
        { code: 'it', label: 'Italiano' },
        { code: 'ro', label: 'Română' }
    ] as const;
</script>

<div class="mx-auto max-w-2xl text-center">
	<h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-8">
        {m.hello_world({ name: 'SvelteKit User' })}
    </h1>

    <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mb-8">
        <p class="text-lg text-gray-600 mb-6">Select a language to switch the locale:</p>
        <div class="flex flex-wrap justify-center gap-4">
            {#each locales as locale}
                <button
                    onclick={() => setLocale(locale.code)}
                    class="px-5 py-2.5 rounded-full text-sm font-medium transition-colors border border-gray-300 hover:bg-gray-50 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-white text-gray-700 shadow-sm"
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
