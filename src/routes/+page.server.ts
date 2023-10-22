import Minio from 'minio';
import { MINIO_BUCKET, MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_PORT, MINIO_SECRET_KEY } from '$env/static/private';
import { error, json } from '@sveltejs/kit';
import type { BucketItem } from 'minio';

const minioClient = new Minio.Client({
  endPoint: MINIO_ENDPOINT,
  port: Number(MINIO_PORT),
  useSSL: false,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY
});

// Event Stream? https://stackoverflow.com/a/74336207
export async function load() {
  const listStream = minioClient.listObjectsV2(MINIO_BUCKET, '');

  const list: BucketItem[] = [];

  let res: (value: BucketItem[]) => void;

  const listPromise = () => new Promise<BucketItem[]>((resolve, reject) => {
    res = resolve;
  });

  listStream.on('data', function (obj) {
    console.log(obj);
    list.push(obj);
  })
  listStream.on('error', function (e) {
    console.error(e);
    throw error(400, e.message);
  });

  listStream.on('end', async function (e) {
    console.log(list);
    res(list);
  });

  return { streaming: { list: listPromise() } }
}
