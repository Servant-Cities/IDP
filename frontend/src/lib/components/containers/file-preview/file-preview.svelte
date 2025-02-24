<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import X from 'lucide-svelte/icons/x';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Separator } from '$lib/components/ui/separator';
	import CustomDialogContent from './custom-dialog-content.svelte';

	let { file, filePath }: { file: string; filePath: string } = $props();
</script>

<CustomDialogContent class="mb-0 w-auto max-w-full gap-0 p-0 max-h-screen flex flex-col overflow-hidden">
	<Dialog.Header class="p-4 mb-1 text-left flex-row gap-4 items-center justify-between">
		<Dialog.Title class="mt-1">{filePath}</Dialog.Title>
		<DialogPrimitive.Close
			class="ring-offset-background focus:ring-ring rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none my-0"
		>
			<X class="size-4" />
			<span class="sr-only">Close</span>
		</DialogPrimitive.Close>
	</Dialog.Header>
	<Separator />
	<div class="flex-1 overflow-auto p-4">
		<pre class="max-h-[70vh] overflow-auto">{file}</pre>
	</div>
</CustomDialogContent>

