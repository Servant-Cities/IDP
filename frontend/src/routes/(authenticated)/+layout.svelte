<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/containers/app-sidebar.svelte';

	let { children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<main>
		<Sidebar.Trigger class="fixed" />
		<div class="p-8">
			{@render children?.()}
		</div>
	</main>
</Sidebar.Provider>
