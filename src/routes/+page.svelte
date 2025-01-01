<script lang="ts">
	import type { PageData } from './$types';
	import { invalidate } from '$app/navigation';

	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Checkbox,
		TableSearch
	} from 'flowbite-svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let downloadAnchor: HTMLAnchorElement | undefined = $state();

	async function downloadObject(name: string | undefined) {
		if (!name) {
			throw new Error('Object name is undefined');
		}

		const response = await fetch(`/api/presigned?object=${name}`);

		const { url } = await response.json();

		if (!downloadAnchor) {
			throw new Error('Failed to create download link.');
		}

		// downloadAnchor.download = 'filename';
		downloadAnchor.href = url;
		downloadAnchor.click();

		console.log({ url });
	}

	async function uploadObject(e: Event) {
		const { files } = e.target as HTMLInputElement;
		if (!files) {
			throw new Error('Failed to select file.');
		}

		const name = files[0].name;

		const response = await fetch(`/api/presigned?object=${name}&method=PUT`);

		const { url } = await response.json();

		const fd = new FormData();
		fd.append(name, files[0]);

		// XHR allows for progress during uploads, whereas fetch does not
		// https://stackoverflow.com/a/35747208 (as old as that is, still applies)
		const xhr = new XMLHttpRequest();
		xhr.upload.onprogress = function (ev) {
			// Upload progress here
			console.log(ev);
		};
		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4 && xhr.status === 200) {
				console.log('ready state change', xhr.responseText); // handle response.
				invalidate('s3:list');
			}
		};

		xhr.open('PUT', url, true);
		xhr.send(fd);

		console.log(name, url);
	}

	let { listPromise } = $derived(data.streaming);
</script>

<h1 class="text-xl">S3 Demo</h1>
<div class="container mx-auto py-4">
	{#await listPromise}
		Loading...
	{:then list}
		<Table>
			<TableHead>
				<TableHeadCell>Actions</TableHeadCell>
				<TableHeadCell>Name</TableHeadCell>
				<TableHeadCell>Last modified</TableHeadCell>
				<TableHeadCell>Etag</TableHeadCell>
				<TableHeadCell>Size</TableHeadCell>
			</TableHead>
			{#each list as object}
				<TableBodyRow>
					<TableBodyCell
						><button onclick={() => downloadObject(object.name)}>Download</button></TableBodyCell
					>
					<TableBodyCell>{object.name}</TableBodyCell>
					<TableBodyCell>{object.lastModified}</TableBodyCell>
					<TableBodyCell>{object.etag}</TableBodyCell>
					<TableBodyCell>{object.size}</TableBodyCell>
				</TableBodyRow>
			{:else}
				<TableBodyRow>
					<TableBodyCell colspan="5">No objects in bucket.</TableBodyCell>
				</TableBodyRow>
			{/each}
		</Table>
		<!-- svelte-ignore a11y_invalid_attribute -->
		<!-- svelte-ignore a11y_missing_content -->
		<a href="" download class="hidden" bind:this={downloadAnchor}></a>

		<br />
		<input type="file" onchange={uploadObject} />
	{:catch error}
		Error loading object list: {error.message}
	{/await}
</div>

<style>
	.hidden {
		display: none;
	}
</style>
