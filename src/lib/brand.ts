import type { SiteSettings } from '@/types/menu';

export const DEFAULT_LOGO = '/brand/lupo-logo.svg';
export const DEFAULT_MARK = '/brand/lupo-mark.svg';

/**
 * The seeded logo is also bundled locally, so the LCP image stays same-origin.
 * A logo the owner uploads in Settings (a different Storage path) is used as-is.
 */
export function logoUrlOf(settings: SiteSettings): string {
  const logo = settings.logo;
  if (!logo || logo.path === 'public/brand/lupo-logo.svg') return DEFAULT_LOGO;
  return logo.url;
}
