import { NextResponse, type NextRequest } from 'next/server';

/**
 * Network-boundary checks (Next 16 "proxy", Node runtime).
 *
 * Item deep links: with Cache Components, a notFound() raised at request time streams with a 200
 * status (plus noindex). Hidden or unknown items must answer 404, so document requests for
 * /item/<slug> are checked against the visible-slug list (served fresh from the cached menu)
 * and rewritten to a path with no route, which renders the branded 404 with a 404 status.
 * Client-side (RSC) navigations are left alone: the modal renders its own not-found state.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = /^\/item\/([^/]+)\/?$/.exec(pathname);
  const isDocument =
    request.method === 'GET' && !request.headers.has('rsc') && !request.headers.has('next-router-prefetch');

  if (match && isDocument) {
    const slug = decodeURIComponent(match[1]!);
    try {
      const res = await fetch(new URL('/api/menu/slugs', request.nextUrl.origin), { cache: 'no-store' });
      if (res.ok) {
        const { slugs } = (await res.json()) as { slugs: string[] };
        if (!slugs.includes(slug)) {
          return NextResponse.rewrite(new URL('/__lupo/not-found', request.url));
        }
      }
    } catch {
      // Fail open: the page itself still renders the not-found UI (noindex) for hidden items.
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/item/:slug*'],
};
