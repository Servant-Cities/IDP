<script lang="ts">
	import House from 'lucide-svelte/icons/house';
	import Inbox from 'lucide-svelte/icons/inbox';
	import Settings from 'lucide-svelte/icons/settings';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ToggleMode from './toggle-mode.svelte';

	// Menu items.
	const items = [
		{
			title: 'Router',
			url: '/',
			icon: House
		},
		{
			title: 'Repositories',
			url: '/repositories',
			icon: Inbox
		},
		{
			title: 'Services',
			url: '/services',
			icon: Settings
		}
	];
</script>

<Sidebar.Root>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>
				<h1 class="text-lg">IDP Servant Cities</h1>
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
	<Sidebar.Footer>
		<ToggleMode />
	</Sidebar.Footer>
</Sidebar.Root>
