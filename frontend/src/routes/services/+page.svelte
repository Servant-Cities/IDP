<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<pre>{JSON.stringify(data, null, 4)}</pre>