<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h2 class="border-b pb-2 text-xl font-semibold tracking-tight transition-colors">Repositories</h2>
<pre>{JSON.stringify(data, null, 4)}</pre>