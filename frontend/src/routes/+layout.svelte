<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';

	let { children } = $props();
</script>

<ModeWatcher />
<Sidebar.Provider>
	<AppSidebar />
	<main>
		<Sidebar.Trigger class="fixed" />
		<div class="p-8">
			{@render children?.()}
		</div>
	</main>
</Sidebar.Provider>
