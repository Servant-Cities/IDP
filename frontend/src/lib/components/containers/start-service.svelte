<script lang="ts">
	import SquarePlus from 'lucide-svelte/icons/square-plus';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	let { form, prefilledValues }: { form: any, prefilledValues?: {
		appPath?: string;
		name?: string;
		script?: string;
		env?: string;
	} } = $props();

	let appPath = $state(prefilledValues?.appPath);
	let name = $state(prefilledValues?.name);
	let script = $state(prefilledValues?.script);
	let env = $state(prefilledValues?.env);
</script>

<Dialog.Content>
	<form method="POST" use:form action="/services?/start">
		<Dialog.Header>
			<Dialog.Title class="flex items-center">
				<SquarePlus class="mr-3 h-6 w-6 rounded" />
				Start a service
			</Dialog.Title>
			<Dialog.Description>This will start the service using PM2</Dialog.Description>
		</Dialog.Header>
		<div class="my-8 grid gap-4">
			<div class="grid gap-2">
				<Label for="appPath">Service Path</Label>
				<Input
					id="appPath"
					name="appPath"
					disabled={form?.pending}
					placeholder="eg: /home/user/services/IDP"
					bind:value={appPath}
				/>
			</div>
			<div class="grid gap-2">
				<Label for="name">App Name</Label>
				<Input
					id="name"
					name="name"
					disabled={form?.pending}
					placeholder="eg: IDP-Frontend"
					bind:value={name}
				/>
			</div>
			<div class="grid gap-2">
				<Label for="script">Script to Run</Label>
				<Input
					id="script"
					name="script"
					disabled={form?.pending}
					placeholder="eg: ./build/index.js"
					bind:value={script}
				/>
			</div>
			<div class="grid gap-2">
				<Label for="env">Environment Variables</Label>
				<Textarea
					id="env"
					name="env"
					disabled={form?.pending}
					placeholder="eg: SERVICES_PATH=/home/user/services\nSITES_AVAILABLE_PATH=/etc/nginx/sites-available"
					bind:value={env}
				/>
			</div>
		</div>
		<Button type="submit" class="w-full" disabled={form?.pending}>
			{#if form?.pending}
				<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
			{/if}
			Start
		</Button>
		{#if form?.success}
			<p class="text-green-500 text-center">Service started successfully!</p>
		{/if}
		{#if form?.error}
			<p class="text-red-500 text-center">{form?.error.message || 'Failed to start service. Please try again.'}</p>
		{/if}
	</form>
</Dialog.Content>
