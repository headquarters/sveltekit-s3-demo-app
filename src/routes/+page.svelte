<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	const { list } = data.streaming;
</script>

<h1>S3 Demo</h1>
{#await list}
	Loading...
{:then value}
	{#each value as object}
		{object.name} <br />
		{object.lastModified} <br />
		{object.etag} <br />
		{object.size}
	{:else}
		No objects in bucket.
	{/each}
{:catch error}
	{error.message}
{/await}
