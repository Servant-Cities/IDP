<script lang="ts">
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	let { form } = $props();
</script>

<div class="grid gap-6">
	<form method="POST" use:form action="/login?/login">
		<div class="grid gap-2">
			<div class="grid gap-1">
				<Label class="sr-only" for="token">Token</Label>
				<Input id="token" name="token" type="password" disabled={form?.pending} />
			</div>
			<Button type="submit" disabled={form?.pending}>
				{#if form?.pending}
					<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				Sign me in
			</Button>
		</div>
	</form>
	{#if form?.success}
		<p class="text-green-500 text-center">Successfully signed in!</p>
	{/if}
	{#if form?.error}
		<p class="text-red-500 text-center">{form?.error.message || 'Failed to sign in. Please try again.'}</p>
	{/if}
	<div class="relative">
		<div class="absolute inset-0 flex items-center">
			<span class="w-full border-t" />
		</div>
		<div class="relative flex justify-center text-xs uppercase">
			<span class="bg-background px-2 text-muted-foreground">
				Or download the source code from
			</span>
		</div>
	</div>
	<Button
		variant="outline"
		target="_blank"
		href="https://github.com/Servant-Cities/IDP.git"
	>
		GitHub
	</Button>
</div>
