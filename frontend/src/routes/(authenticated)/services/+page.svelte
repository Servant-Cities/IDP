<script lang="ts">
	import ServiceCard from '$lib/components/containers/service-card.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h2 class="border-b pb-2 text-xl font-semibold tracking-tight transition-colors">PM2 Services</h2>
{#if data}
	<div class="grid w-full gap-4 py-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
		{#each data.list as service}
			<ServiceCard service={service}/>
		{/each}
	</div>
{/if}
