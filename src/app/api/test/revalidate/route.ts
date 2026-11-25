import { revalidateTag } from 'next/cache';

/**
 * E2E-only hook: expires cache tags after tests write fixtures straight to the emulator.
 * Disabled (404) unless the app runs against the Firebase emulators.
 */
export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_USE_EMULATORS !== 'true') return new Response(null, { status: 404 });
  const body = (await request.json().catch(() => ({}))) as { tags?: unknown };
  const tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === 'string').slice(0, 20) : ['menu'];
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: tags });
}
