import { MINIO_BUCKET } from '$env/static/private';
import minioClient from '$lib/minio';
import type { BucketItem } from 'minio';

// Event Stream? https://stackoverflow.com/a/74336207
export async function load({ depends }) {
  depends('s3:list');

  const listStream = minioClient.listObjectsV2(MINIO_BUCKET, '');

  const list: BucketItem[] = [];

  let resolve: (value: BucketItem[]) => void;
  let reject: (reason: string) => void;

  const listPromise = () => new Promise<BucketItem[]>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  listStream.on('data', function (obj) {
    console.log(obj);
    list.push(obj);
  })
  listStream.on('error', function (e) {
    console.error(e);
    reject(e.message);
  });

  listStream.on('end', function () {
    resolve(list);
  });

  // https://kit.svelte.dev/docs/load#streaming-with-promises
  return { streaming: { listPromise: listPromise() } }
}
