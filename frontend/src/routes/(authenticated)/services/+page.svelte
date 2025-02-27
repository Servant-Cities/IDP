<script lang="ts">
	import SquarePlus from 'lucide-svelte/icons/square-plus';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import StartService from '$lib/components/containers/start-service.svelte';
	import ServiceCard from '$lib/components/containers/service-card.svelte';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

</script>

<Dialog.Root>
	<h2
		class="flex w-full items-center justify-between border-b pb-2 text-xl font-semibold tracking-tight transition-colors"
	>
		PM2 Services
		<Dialog.Trigger>
			<Label class="sr-only" for="start-service">Start a service</Label>
			<SquarePlus class="h-6 w-6 rounded" />
		</Dialog.Trigger>
	</h2>
	<StartService {form} />
</Dialog.Root>

{#if data}
	<div class="grid w-full gap-4 py-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
		{#each data.list as service}
			<ServiceCard {service} />
		{/each}
	</div>
{/if}
