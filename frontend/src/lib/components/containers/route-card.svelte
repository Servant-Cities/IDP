<script lang="ts">
	import File from 'lucide-svelte/icons/file';
	import Link from 'lucide-svelte/icons/link';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import FilePreview from '$lib/components/containers/file-preview/file-preview.svelte';

	let {
		site
	}: {
		site: {
			name: string;
			domain: string;
			sslCertificateLastModified?: string;
			proxyPassPort?: number;
			corsAllowed?: boolean;
			filePath: string;
			file: string;
		};
	} = $props();

	function getSslDetails(modifiedDate?: string) {
		if (!modifiedDate || modifiedDate === 'NOT_FOUND') {
			return { class: '', lastModified: 'Not Found', variant: 'destructive' };
		}
		const now = new Date();
		const lastModified = new Date(modifiedDate);
		const timeDiff = now.getTime() - lastModified.getTime();
		const oneMonthInMillis = 30 * 24 * 60 * 60 * 1000;

		if (timeDiff < oneMonthInMillis) {
			return {
				class: 'bg-green-400',
				lastModified: lastModified.toLocaleString(),
				variant: 'default'
			};
		} else {
			return {
				class: 'bg-yellow-700',
				lastModified: lastModified.toLocaleString(),
				variant: 'default'
			};
		}
	}

	let ssl = $derived(getSslDetails(site.sslCertificateLastModified));
</script>

<Card.Root class="flex max-w-sm flex-col">
	<Card.Header>
		<Card.Title class="line-clamp-1 flex flex-row items-center justify-between gap-8">
			<span class="truncate">{site.name}</span>
			<Badge class="whitespace-nowrap bg-green-400">
				Proxy Port: {site.proxyPassPort || 'N/A'}
			</Badge>
		</Card.Title>
		<Card.Description>
			<Button
				variant="link"
				href={`https://${site.domain}`}
				target="_blank"
				class="text-muted-foreground h-auto min-w-0 truncate p-0 text-xs"
			>
				<span class="truncate">{site.domain}</span>
				<Link class="ml-1 size-2" />
			</Button>
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<Badge variant={site.corsAllowed ? 'default' : 'destructive'} class="mt-2">
			CORS: {site.corsAllowed ? 'Allowed' : 'Not Allowed'}
		</Badge>
		<Badge variant={ssl.variant} class={`mt-2 ${ssl.class}`}>
			SSL: {ssl.lastModified}
		</Badge>
	</Card.Content>
	<Card.Footer class="mt-auto flex flex-row-reverse justify-between gap-4 border-t p-4">
		<Dialog.Root>
			<Dialog.Trigger class={buttonVariants({ variant: 'link' })}>
				Config
				<File class="ml-1 size-2" />
			</Dialog.Trigger>
			<FilePreview file={site.file} filePath={site.filePath} />
		</Dialog.Root>
	</Card.Footer>
</Card.Root>
