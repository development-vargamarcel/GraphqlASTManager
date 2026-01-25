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
			class="pointer-events-auto relative flex items-center justify-between gap-4 overflow-hidden rounded border px-4 py-3 shadow-md {typeClasses[
				toast.type
			]}"
			transition:fly={{ y: 20, duration: 300 }}
			role="alert"
		>
			<span class="z-10">{toast.message}</span>
			<button
				onclick={() => toastState.remove(toast.id)}
				class="z-10 font-bold focus:outline-none"
				aria-label="Close"
			>
				&times;
			</button>
			{#if toast.duration && toast.duration > 0}
				<div
					class="absolute bottom-0 left-0 h-1 bg-current opacity-25"
					style="width: 100%; animation: shrink {toast.duration}ms linear forwards;"
				></div>
			{/if}
		</div>
	{/each}
</div>

<style>
	@keyframes shrink {
		from {
			width: 100%;
		}
		to {
			width: 0%;
		}
	}
</style>
