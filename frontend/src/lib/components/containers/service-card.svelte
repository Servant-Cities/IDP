<script lang="ts">
	import { Clipboard } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	let {
		service
	}: {
		service: {
			pid: number | undefined;
			name: string | undefined;
			status: 'online' | 'stopping' | 'launching' | 'one-launch-status' | 'errored' | 'stopped' | undefined;
			pm_cwd: string | undefined;
			pm_uptime: number | undefined;
			port: number | null;
			unstable_restarts: number | undefined;
			memory: number | undefined;
			cpu: number | undefined;
		};
	} = $props();

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

	let statusBadge = $derived(getStatusBadge(service.status, service.port));
</script>

<Card.Root class="flex max-w-sm flex-col">
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
