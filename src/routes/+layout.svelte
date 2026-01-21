<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import LoadingBar from '$lib/components/LoadingBar.svelte';

	let { children } = $props();
</script>

<LoadingBar />
<Toast />

<div class="flex min-h-screen flex-col bg-gray-50">
	<Header />
	<main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
		{@render children()}
	</main>
	<Footer />
</div>
