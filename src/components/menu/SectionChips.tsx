'use client';

import { m } from 'motion/react';
import { useEffect, useRef } from 'react';
import { AppIcon } from '@/components/icons/AppIcon';
import { En } from '@/components/ui/En';
import { ar } from '@/i18n/ar';
import { SPRING_UI } from '@/lib/motion-tokens';
import type { Section } from '@/types/menu';

type ChipsProps = { sections: Pick<Section, 'id' | 'slug' | 'nameAr' | 'nameEn' | 'icon'>[]; active: string | null };

/** Sticky, horizontally scrollable section chips (mobile/tablet). The active pill slides between chips. */
export function SectionChips({ sections, active }: ChipsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Center the active chip horizontally. scrollBy on the strip only: scrollIntoView would also
  // touch the window and cancel an in-flight smooth scroll to the section. Deltas are physical, so RTL is fine.
  useEffect(() => {
    const list = listRef.current;
    const chip = active ? list?.querySelector<HTMLElement>(`[data-chip="${active}"]`) : null;
    if (!list || !chip) return;
    const c = chip.getBoundingClientRect();
    const l = list.getBoundingClientRect();
    const delta = c.left + c.width / 2 - (l.left + l.width / 2);
    if (Math.abs(delta) > 4) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      list.scrollBy({ left: delta, behavior: reduce ? 'auto' : 'smooth' });
    }
  }, [active]);

  return (
    <nav
      aria-label={ar.menu.sectionsNav}
      className="sticky top-14 z-30 border-b border-line bg-canvas/80 backdrop-blur-xl lg:hidden"
    >
      <div ref={listRef} className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2.5">
        {sections.map((s) => {
          const isActive = active === s.slug;
          return (
            <a
              key={s.id}
              href={`#${s.slug}`}
              data-chip={s.slug}
              aria-current={isActive ? 'true' : undefined}
              className={`relative flex shrink-0 items-center gap-2 rounded-chip py-1.5 ps-1.5 pe-3.5 transition-colors duration-180 ${
                isActive ? 'text-canvas' : 'text-fg hover:bg-white/5'
              }`}
            >
              {isActive && (
                <m.span layoutId="chip-pill" transition={SPRING_UI} className="absolute inset-0 -z-0 rounded-chip bg-accent" aria-hidden="true" />
              )}
              <span
                className={`relative flex size-9 items-center justify-center rounded-[13px] ${
                  isActive ? 'bg-canvas/15' : 'glass'
                }`}
              >
                <AppIcon name={s.icon} size={20} />
              </span>
              <span className="relative flex flex-col">
                <span className="text-[13px] leading-ui font-semibold">{s.nameAr}</span>
                <En className={`text-[9px] leading-ui ${isActive ? 'font-semibold text-canvas/75' : 'font-cairo-light text-muted'}`}>
                  {s.nameEn}
                </En>
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
