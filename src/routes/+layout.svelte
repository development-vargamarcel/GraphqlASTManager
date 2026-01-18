<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col bg-gray-50">
	<Header />
	<main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{@render children()}
	</main>
	<Footer />
</div>
