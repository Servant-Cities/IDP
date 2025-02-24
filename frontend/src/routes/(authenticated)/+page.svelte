<script lang="ts">
	import type { PageProps } from './$types';
	import RouteCard from '$lib/components/containers/route-card.svelte';

	let { data }: PageProps = $props();
</script>

<h2 class="border-b pb-2 text-xl font-semibold tracking-tight transition-colors">Nginx Sites</h2>
{#if data.sites}
	<div class="grid w-full gap-4 py-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
		{#each data.sites as site}
			<RouteCard {site} />
		{/each}
	</div>
{/if}
