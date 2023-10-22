import Minio from 'minio';
import { MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_PORT, MINIO_SECRET_KEY } from '$env/static/private';

const minioClient = new Minio.Client({
  endPoint: MINIO_ENDPOINT,
  port: Number(MINIO_PORT),
  useSSL: false,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY
});

export default minioClient;