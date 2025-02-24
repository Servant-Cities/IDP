<script lang="ts">
	import SquarePlus from 'lucide-svelte/icons/square-plus';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import AddRepository from '$lib/components/containers/add-repository.svelte';
	import RepositoryCard from '$lib/components/containers/repository-card.svelte';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<Dialog.Root>
	<h2 class="w-full border-b pb-2 text-xl font-semibold tracking-tight transition-colors flex items-center justify-between">
		Repositories
		<Dialog.Trigger>
			<Label class="sr-only" for="add-repository">Add a repository</Label>
			<SquarePlus class="h-6 w-6 rounded" />
		</Dialog.Trigger>
	</h2>
	<AddRepository {form} />
</Dialog.Root>
{#if data.repositories}
	<div class="grid w-full gap-4 py-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
		{#each data.repositories as repository}
			<RepositoryCard {repository} />
		{/each}
	</div>
{/if}
