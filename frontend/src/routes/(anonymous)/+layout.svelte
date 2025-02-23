<script lang="ts">
	import ToggleMode from '$lib/components/toggle-mode.svelte';

	let { children, data } = $props();
</script>

<main class="flex h-screen w-full">
	<div class="relative h-full w-full bg-black">
		<img
			src="logo_black.jpeg"
			width="100%"
			alt="Servant Cities' logo"
			class="relative inset-y-12"
		/>
		<h2 class="text-md absolute left-8 top-8 font-mono text-white">
			Carefully built by Servant Cities
		</h2>
		<div class="absolute left-4 bottom-4">
			<ToggleMode />
		</div>
	</div>
	<div class="flex h-full w-full flex-col justify-center border-l border-l-4">
		<div class="mx-auto flex w-full flex-col space-y-6 sm:w-[350px]">
			{@render children?.()}
		</div>
	</div>
</main>
