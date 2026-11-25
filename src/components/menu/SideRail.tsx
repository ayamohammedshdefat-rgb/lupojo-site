'use client';

import Link from 'next/link';
import { ScrollText } from 'lucide-react';
import { AppIcon } from '@/components/icons/AppIcon';
import { En } from '@/components/ui/En';
import { ar } from '@/i18n/ar';
import { formatInt } from '@/lib/format';
import { useSlidingIndicator } from './useSlidingIndicator';
import type { MenuSection } from '@/types/menu';

/** Desktop (>= 1024px) sticky rail on the start side: sections with icons and item counts. */
export function SideRail({ sections, active }: { sections: MenuSection[]; active: string | null }) {
  const { containerRef, indicatorRef } = useSlidingIndicator<HTMLUListElement, HTMLSpanElement>(
    active ? `a[href="#${active}"]` : null,
    'y',
  );
  return (
    <aside className="sticky top-20 hidden self-start lg:block">
      <nav aria-label={ar.menu.sectionsNav} className="glass rounded-card p-3">
        <ul ref={containerRef} className="lupo-indicator-host relative flex flex-col gap-1">
          <span
            ref={indicatorRef}
            aria-hidden="true"
            className="lupo-indicator rounded-[20px] bg-white/[0.07] ring-1 ring-white/10 ring-inset"
          />
          {sections.map((s) => {
            const isActive = active === s.slug;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.slug}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`lupo-rail-link relative flex items-center gap-3 rounded-[20px] p-2 pe-3 transition-colors duration-180 ${
                    isActive ? 'text-fg' : 'text-muted hover:bg-white/[0.04] hover:text-fg'
                  }`}
                >
                  <span
                    className={`relative flex size-10 shrink-0 items-center justify-center rounded-[14px] transition-colors duration-180 ${
                      isActive ? 'bg-accent text-canvas' : 'bg-white/[0.05]'
                    }`}
                  >
                    <AppIcon name={s.icon} size={20} />
                  </span>
                  <span className="relative flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm leading-ui font-semibold">{s.nameAr}</span>
                    <En className="font-cairo-light truncate text-[10px] leading-ui text-muted">{s.nameEn}</En>
                  </span>
                  <span className="tabular relative text-xs leading-ui font-semibold text-muted" aria-label={ar.menu.itemsCount(s.items.length)}>
                    {formatInt(s.items.length)}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 border-t border-line pt-3">
          <Link
            href="/classic"
            className="flex items-center gap-3 rounded-[20px] p-2 text-sm leading-ui font-semibold text-muted transition-colors hover:bg-white/[0.04] hover:text-fg"
          >
            <span className="flex size-10 items-center justify-center rounded-[14px] bg-white/[0.05]">
              <ScrollText size={20} strokeWidth={1.75} aria-hidden="true" />
            </span>
            {ar.menu.classic}
          </Link>
        </div>
      </nav>
    </aside>
  );
}
