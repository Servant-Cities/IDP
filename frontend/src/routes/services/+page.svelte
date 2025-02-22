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

	function getStatusBadge(status?: string, port?: string) {
		switch (status) {
			case 'online':
				return {
					variant: 'default',
					class: `bg-${port ? 'green' : 'yellow'}-400 whitespace-nowrap`,
					label: port ? `Running on port ${port}` : `Running on unknown port`
				};
			case 'stopping':
				return { variant: 'default', class: 'bg-yellow-400 whitespace-nowrap', label: 'Stopping' };
			case 'launching':
			case 'one-launch-status':
				return { variant: 'outline', class: 'bg-blue-700 whitespace-nowrap', label: 'Launching' };
			case 'errored':
			case 'stopped':
				return { variant: 'destructive', class: 'bg-red-600 whitespace-nowrap', label: 'Stopped' };
			default:
				return { variant: 'secondary', class: 'bg-gray-600 whitespace-nowrap', label: 'Unknown' };
		}
	}

	function formatStartTime(startTime: number): string {
		const date = new Date(startTime);
		return `Started: ${date.toLocaleString()}`;
	}
</script>

<h2 class="border-b pb-2 text-xl font-semibold tracking-tight transition-colors">PM2 Services</h2>
{#if data}
	<div class="grid w-full gap-4 py-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
		{#each data.list as service}
			{@const statusBadge = getStatusBadge(service.status, service.port)}
			<Card.Root class="flex flex-col max-w-sm">
				<Card.Header>
					<Card.Title class="line-clamp-1 flex flex-row items-center justify-between gap-8">
						<span class="truncate">{service.name}</span>
						<Badge variant={statusBadge.variant} class={statusBadge.class}>
							{statusBadge.label}
						</Badge>
					</Card.Title>
					<Card.Description class="line-clamp-2 text-ellipsis">{service.pm_cwd}</Card.Description>
				</Card.Header>
				<Card.Content>
					<Badge variant="outline" class="mt-2">CPU: {service.cpu}%</Badge>
					<Badge variant="outline" class="mt-2">
						{#if service.memory}
							Memory: {(service.memory / (1024 * 1024)).toFixed(2)} MB
						{:else}
							Memory: undefined
						{/if}
					</Badge>
				</Card.Content>
				<Card.Footer class="mt-auto flex justify-between gap-8 border-t p-4">
					<p class="text-muted-foreground text-xs">
						{formatStartTime(service.pm_uptime)}
						{#if service?.unstable_restarts && service.pm2_env.unstable_restarts > 0}
							<Badge variant="destructive" class="mt-2">
								Unstable Restarts: {service.unstable_restarts || 0}
							</Badge>
						{/if}
					</p>
					<div class="flex items-center">
						<p class="text-muted-foreground text-xs">PID: {service.pid}</p>
						<button
							onclick={() => copyToClipboard(service.pid?.toString())}
							class="rounded-md p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
						>
							<Clipboard class="h-4 w-4" />
						</button>
					</div>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
{/if}
