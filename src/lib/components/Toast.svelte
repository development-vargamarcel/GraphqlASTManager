<!--
  @component
  Displays a list of toast notifications managed by the global `toastState`.
  Toasts are positioned at the bottom right of the viewport.
-->
<script lang="ts">
	import { toastState } from '$lib/state/toast.svelte';
	import { fly } from 'svelte/transition';

	const typeClasses = {
		success: 'bg-green-100 border-green-400 text-green-700',
		error: 'bg-red-100 border-red-400 text-red-700',
		info: 'bg-blue-100 border-blue-400 text-blue-700',
		warning: 'bg-yellow-100 border-yellow-400 text-yellow-700'
	};
</script>

<div class="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col gap-2">
	{#each toastState.toasts as toast (toast.id)}
		<div
			class="pointer-events-auto flex items-center justify-between gap-4 rounded border px-4 py-3 shadow-md {typeClasses[
				toast.type
			]}"
			transition:fly={{ y: 20, duration: 300 }}
			role="alert"
		>
			<span>{toast.message}</span>
			<button
				onclick={() => toastState.remove(toast.id)}
				class="font-bold focus:outline-none"
				aria-label="Close"
			>
				&times;
			</button>
		</div>
	{/each}
</div>
