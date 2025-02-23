<script lang="ts">
	import AuthForm from '$lib/components/auth-form.svelte';

	let { form } = $props();
</script>

<div class="flex flex-col space-y-2 text-center">
	<h1 class="text-2xl font-semibold tracking-tight">Connect to your IDP</h1>
	<p class="text-sm text-muted-foreground">Enter your token here to connect</p>
</div>
<AuthForm {form} />
