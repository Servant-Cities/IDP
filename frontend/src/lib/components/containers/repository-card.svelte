<script lang="ts">
	import { Clipboard, Play } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import StartService from '$lib/components/containers/start-service.svelte';

	let {
		form,
		repository
	}: {
		form: any,
		repository: {
			name: string;
			lastCommitHash: string;
			lastCommitMessage: string;
			lastCommitDate: string;
			remoteUrl: string | null;
			activeBranch: string;
			path: string;
		};
	} = $props();

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

	let parsed = parseCommitMessage(repository.lastCommitMessage);
</script>

<Card.Root class="flex max-w-sm flex-col">
	<Card.Header class="mb-auto">
		<Card.Title class="items-top flex justify-between">
			<span class="line-clamp-2 text-ellipsis">{repository.name}</span>
			<Badge class="h-6">{repository.activeBranch}</Badge>
		</Card.Title>
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

		<div class="text-accent flex items-center gap-2">
			<p class="text-muted-foreground truncate text-xs">{repository.lastCommitHash}</p>
			<button
				onclick={() => copyToClipboard(repository.lastCommitHash)}
				class="rounded-md p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
			>
				<Clipboard class="h-4 w-4" />
			</button>
		</div>
	</Card.Content>
	<Card.Footer class="mt-auto flex justify-between border-t p-4">
		<p class="text-sm">{new Date(repository.lastCommitDate).toLocaleString()}</p>
		<Dialog.Root>
			<Dialog.Trigger class="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
				<Play class="h-4 w-4" />
				Start
			</Dialog.Trigger>
			<StartService {form} prefilledValues={{appPath:repository.path, name:repository.name, script:'/build/index.js'}} />
		</Dialog.Root>
	</Card.Footer>
</Card.Root>
