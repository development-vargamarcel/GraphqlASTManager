<!--
  @component
  Displays a progress bar at the top of the screen during navigation.
  Listens to the `$app/stores` `navigating` store.
-->
<script lang="ts">
	import { navigating } from '$app/stores';
	import { fade } from 'svelte/transition';
</script>

{#if $navigating}
	<div class="fixed top-0 right-0 left-0 z-50 h-1 bg-blue-500" transition:fade={{ duration: 100 }}>
		<div class="h-full w-full animate-pulse bg-blue-300"></div>
	</div>
{/if}
