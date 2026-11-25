import 'server-only';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { getDownloadURL } from 'firebase-admin/storage';
import { adminBucket } from './firebase-admin';
import type { ImageRef } from '@/types/menu';

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp', 'avif', 'heif', 'gif', 'tiff']);

export class ImageError extends Error {}

/** Detects the real format from magic bytes (via sharp) and rejects anything that isn't an image. */
export async function sniffImage(buf: Buffer): Promise<string> {
  if (buf.length === 0 || buf.length > MAX_UPLOAD_BYTES) throw new ImageError('size');
  let format: string | undefined;
  try {
    format = (await sharp(buf, { failOn: 'error' }).metadata()).format;
  } catch {
    throw new ImageError('not-an-image');
  }
  if (!format || !ALLOWED_FORMATS.has(format)) throw new ImageError('format');
  return format;
}

export type ProcessedImage = {
  data: Buffer;
  width: number;
  height: number;
  blurDataURL: string;
  hash: string;
};

/**
 * Re-encodes an upload to WebP (EXIF stripped, auto-rotated), max 1200px wide,
 * and builds a tiny blur placeholder. Cutouts keep their alpha channel.
 */
export async function processImage(input: Buffer, opts: { width?: number; cutout?: boolean } = {}): Promise<ProcessedImage> {
  await sniffImage(input);
  const width = opts.width ?? 1200;
  const pipeline = sharp(input, { failOn: 'error' }).rotate().resize({ width, withoutEnlargement: true });
  const { data, info } = await pipeline
    .webp(opts.cutout ? { quality: 86, alphaQuality: 90, effort: 5 } : { quality: 80, effort: 5 })
    .toBuffer({ resolveWithObject: true });
  const tiny = await sharp(data).resize(16).webp({ quality: 40 }).toBuffer();
  return {
    data,
    width: info.width,
    height: info.height,
    blurDataURL: `data:image/webp;base64,${tiny.toString('base64')}`,
    hash: createHash('sha256').update(data).digest('hex').slice(0, 16),
  };
}

/** Uploads a processed image under `public/...` and returns its ImageRef. */
export async function uploadPublicImage(
  img: ProcessedImage,
  dir: string,
  baseName: string,
  alt: string,
): Promise<ImageRef> {
  const path = `public/${dir}/${baseName}-${img.hash}.webp`;
  const file = adminBucket().file(path);
  const [exists] = await file.exists();
  if (!exists) {
    await file.save(img.data, {
      contentType: 'image/webp',
      resumable: false,
      metadata: { cacheControl: 'public, max-age=31536000, immutable' },
    });
  }
  const url = await getDownloadURL(file);
  return { url, path, width: img.width, height: img.height, blurDataURL: img.blurDataURL, alt };
}

/** Uploads a trusted static asset (e.g. the vector logo) as-is. */
export async function uploadStaticAsset(
  data: Buffer,
  path: string,
  contentType: string,
  meta: { width: number; height: number; alt: string },
): Promise<ImageRef> {
  const file = adminBucket().file(path);
  await file.save(data, { contentType, resumable: false, metadata: { cacheControl: 'public, max-age=3600' } });
  const url = await getDownloadURL(file);
  return { url, path, width: meta.width, height: meta.height, blurDataURL: '', alt: meta.alt };
}

export async function deleteStorageFile(path: string | undefined): Promise<void> {
  if (!path || !path.startsWith('public/')) return;
  await adminBucket()
    .file(path)
    .delete({ ignoreNotFound: true })
    .catch(() => undefined);
}
