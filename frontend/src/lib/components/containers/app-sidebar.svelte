<script lang="ts">
	import Shuffle from 'lucide-svelte/icons/shuffle';
	import FolderCode from 'lucide-svelte/icons/folder-code';
	import MonitorCheck from 'lucide-svelte/icons/monitor-check';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ToggleMode from './toggle-mode.svelte';

	// Menu items.
	const items = [
		{
			title: 'Router',
			url: '/',
			icon: Shuffle
		},
		{
			title: 'Repositories',
			url: '/repositories',
			icon: FolderCode
		},
		{
			title: 'PM2 Services',
			url: '/services',
			icon: MonitorCheck
		}
	];
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Content class="bg-white dark:bg-black">
		<Sidebar.Group>
			<Sidebar.GroupLabel>
				<h1 class="text-lg font-extrabold tracking-tight">
					IDP Servant Cities
				</h1>
			</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer class="bg-white dark:bg-black">
		<ToggleMode/>
	</Sidebar.Footer>
</Sidebar.Root>
