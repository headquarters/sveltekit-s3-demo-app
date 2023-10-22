<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	let downloadAnchor: HTMLAnchorElement | undefined;

	const { listPromise } = data.streaming;

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
			}
		};

		xhr.open('PUT', url, true);
		xhr.send(fd);

		console.log(name, url);
	}
</script>

<h1>S3 Demo</h1>
{#await listPromise}
	Loading...
{:then list}
	<table>
		<th>Actions</th>
		<th>Name</th>
		<th>Last modified</th>
		<th>Etag</th>
		<th>Size</th>
		{#each list as object}
			<tr>
				<td><button on:click={() => downloadObject(object.name)}>Download</button></td>
				<td>{object.name}</td>
				<td>{object.lastModified}</td>
				<td>{object.etag}</td>
				<td>{object.size}</td>
			</tr>
		{:else}
			<tr>
				<td colspan="5">No objects in bucket.</td>
			</tr>
		{/each}
	</table>
	<!-- svelte-ignore a11y-invalid-attribute -->
	<!-- svelte-ignore a11y-missing-content -->
	<a href="" download class="hidden" bind:this={downloadAnchor} />

	<br />
	<input type="file" on:change={uploadObject} />
{:catch error}
	Error loading object list: {error.message}
{/await}

<style>
	.hidden {
		display: none;
	}
</style>
