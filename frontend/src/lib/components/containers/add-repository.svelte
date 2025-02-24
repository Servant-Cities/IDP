<script lang="ts">
	import SquarePlus from 'lucide-svelte/icons/square-plus';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	let { form } = $props();
</script>

<Dialog.Content>
	<form method="POST" use:form action="/repositories?/add">
		<Dialog.Header>
			<Dialog.Title class=" flex items-center">
				<SquarePlus class="mr-3 h-6 w-6 rounded" />
				Add a repository
			</Dialog.Title>
			<Dialog.Description>This will not deploy the app yet</Dialog.Description>
		</Dialog.Header>
		<div class="my-8 grid gap-4">
			<div class="grid gap-2">
				<Label for="clone-url">URL to clone</Label>
				<Input
					id="clone-url"
					name="clone-url"
					disabled={form?.pending}
					placeholder="eg: https://github.com/Servant-Cities/IDP.git"
				/>
			</div>
			<div class="grid gap-2">
				<Label for="name">Name (optional)</Label>
				<Input
					id="name"
					name="name"
					disabled={form?.pending}
					placeholder="eg: https://github.com/Servant-Cities/IDP.git"
				/>
			</div>
		</div>
		<Button type="submit" class="w-full">Save</Button>
	</form>
</Dialog.Content>
