import type { NextRequest } from 'next/server';
import { getPublicMenu } from '@/server/repos/menu';
import { getApprovedComments } from '@/server/repos/reviews';

/**
 * Approved comments for a visible item ("عرض المزيد" pagination).
 * GET /api/items/:id/reviews?cursor=<ISO createdAt>
 * Hidden items (or items in hidden sections) answer 404.
 */
export async function GET(request: NextRequest, ctx: RouteContext<'/api/items/[id]/reviews'>) {
  const { id } = await ctx.params;
  const menu = await getPublicMenu();
  const visible = menu.sections.some((s) => s.items.some((i) => i.id === id));
  if (!visible) return Response.json({ error: 'not_found' }, { status: 404 });
  const cursor = request.nextUrl.searchParams.get('cursor');
  const page = await getApprovedComments(id, cursor);
  return Response.json(page, { headers: { 'Cache-Control': 'no-store' } });
}
