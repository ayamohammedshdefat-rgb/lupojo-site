import { connection } from 'next/server';
import { getPublicItemSlugs } from '@/server/repos/menu';

/**
 * Slugs of every publicly visible item (the same list the sitemap exposes).
 * Backed by the cached menu, so it is fresh right after any owner change (updateTag/revalidateTag).
 * Used by the proxy to give hidden/unknown item URLs a real 404 status.
 */
export async function GET() {
  // Answer per request (the menu data underneath stays cached and tag-invalidated).
  await connection();
  const slugs = await getPublicItemSlugs();
  return Response.json({ slugs }, { headers: { 'Cache-Control': 'no-store' } });
}
