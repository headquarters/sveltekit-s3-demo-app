import minioClient from "$lib/minio";
import { MINIO_BUCKET } from "$env/static/private";
import { error, json } from "@sveltejs/kit";

export async function GET({ url }) {
  const object = url.searchParams.get('object');
  const method = url.searchParams.get('method') || 'GET';

  if (!object) {
    error(400, { message: 'Missing `object` query parameter.' });
  }

  const options = method === 'GET' ? { "Content-Disposition": "attachment" } : {};

  return json({
    url: await minioClient.presignedUrl(method, MINIO_BUCKET, object, 3600, options)
  });
}