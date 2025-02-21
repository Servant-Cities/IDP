<script lang="ts">
	import File from 'lucide-svelte/icons/file';
	import Link from 'lucide-svelte/icons/link';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { PageProps } from './$types';
	import FilePreview from '$lib/components/file-preview/file-preview.svelte';

	let { data }: PageProps = $props();

	function getSslDetails(modifiedDate: string) {
		if (modifiedDate === 'NOT_FOUND') {
			return { class: '', lastModified: "Not Found", variant: 'destructive'};
		}
		const now = new Date();
		const lastModified = new Date(modifiedDate);
		const timeDiff = now.getTime() - lastModified.getTime();
		const oneMonthInMillis = 30 * 24 * 60 * 60 * 1000;

		if (timeDiff < oneMonthInMillis) {
			return { class: 'bg-green-400', lastModified: lastModified.toLocaleString(), variant: 'default'};
		} else {
			return { class: 'bg-yellow-700', lastModified: lastModified.toLocaleString(), variant: 'default' };
		}
	}
</script>

<h2 class="border-b pb-2 text-xl font-semibold tracking-tight transition-colors">Nginx Sites</h2>
{#if data.sites}
	<div class="grid w-full gap-4 py-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
		{#each data.sites as site}
			{@const ssl = getSslDetails(site.sslCertificateLastModified)}
			<Card.Root class="flex flex-col">
				<Card.Header>
					<Card.Title class="line-clamp-1 flex flex-row items-center justify-between gap-8">
						<span class="truncate">{site.name}</span>
						<Badge class="bg-green-400">
							Proxy Port: {site.proxyPassPort || 'N/A'}
						</Badge>
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<Badge variant={site.corsAllowed ? 'default' : 'destructive'} class="mt-2">
						CORS: {site.corsAllowed ? 'Allowed' : 'Not Allowed'}
					</Badge>
					<Badge
						variant={ssl.variant}
						class={`mt-2 ${ssl.class}`}
					>
						SSL: {ssl.lastModified}
					</Badge>
				</Card.Content>
				<Card.Footer class="mt-auto flex justify-between gap-8 border-t p-4">
					<Button variant="link" href="https://{site.domain}" target="_blank" class="text-muted-foreground text-xs">
						{site.domain}
						<Link class="ml-1 size-2" />
					</Button>
					<Dialog.Root>
						<Dialog.Trigger class={buttonVariants({ variant: 'link' })}>
							See the file
							<File class="ml-1 size-4" />
						</Dialog.Trigger>
						<FilePreview file={site.file} filePath={site.filePath} />
					</Dialog.Root>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
{/if}
