<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { PageProps } from './$types';
	import { Clipboard } from 'lucide-svelte';

	let { data }: PageProps = $props();

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text).then(() => {
			alert(`Copied to clipboard: ${text}`);
		});
	}

	function parseCommitMessage(message: string) {
		const match = message.match(/^(\w+)(?:\(([^)]+)\))?\s*:?\s*(.*)$/);
		if (match) {
			return {
				type: match[1],
				scope: match[2] || '',
				message: match[3]
			};
		}
		return { type: '', scope: '', message };
	}
</script>

<h2 class="border-b w-full pb-2 text-xl font-semibold tracking-tight transition-colors">Repositories</h2>
{#if data.repositories}
	<div class="grid w-full gap-4 py-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
		{#each data.repositories as repository}
			{@const parsed = parseCommitMessage(repository.lastCommitMessage)}
			<Card.Root class="flex flex-col max-w-sm">
				<Card.Header class="my-auto">
					<Card.Title class="line-clamp-2 text-ellipsis">{repository.name}</Card.Title>
					<Card.Description class="line-clamp-2 text-ellipsis">{repository.remoteUrl}</Card.Description>
				</Card.Header>
				<Card.Content class="mt-auto pb-2">
					<h4 class="text-md inline-block max-w-full overflow-hidden">
						<div class="line-clamp-2">
							{#if parsed.type}<Badge variant="outline">{parsed.type}</Badge>{/if}
							{#if parsed.scope}<Badge variant="outline">{parsed.scope}</Badge>{/if}
							{parsed.message}
						</div>
					</h4>
					
					<div class="flex items-center gap-2 text-accent">
						<p class="truncate text-xs text-muted-foreground">{repository.lastCommitHash}</p>
						<button
							onclick={() => copyToClipboard(repository.lastCommitHash)}
							class="rounded-md p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
						>
							<Clipboard class="h-4 w-4" />
						</button>
					</div>
				</Card.Content>
				<Card.Footer class="mt-auto flex justify-between border-t p-4">
					<Badge>{repository.activeBranch}</Badge>
					<p class="text-sm">{new Date(repository.lastCommitDate).toLocaleString()}</p>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
{/if}
