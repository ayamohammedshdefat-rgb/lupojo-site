'use client';

import { SearchX } from 'lucide-react';
import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { matchesQuery } from '@/lib/arabic';
import { ar } from '@/i18n/ar';
import { rememberSource } from '@/components/motion/shared-element';
import type { MenuSection } from '@/types/menu';
import { ItemCard } from './ItemCard';
import { SectionChips } from './SectionChips';
import { SectionHeader } from './SectionHeader';
import { SideRail } from './SideRail';
import { useMenuSearch } from './search-context';
import { useScrollSpy } from './useScrollSpy';

const haystack = (i: MenuSection['items'][number]) =>
  [i.nameAr, i.nameEn, i.taglineAr, i.taglineEn, i.descriptionAr, ...i.ingredients].filter(Boolean).join(' ');

/** Chips + rail + sections. Search filters the items already rendered, instantly and client-side. */
export function MenuBrowser({ sections }: { sections: MenuSection[] }) {
  const { query } = useMenuSearch();
  const active = useScrollSpy(sections.map((s) => s.slug));

  const indexed = useMemo(
    () => sections.map((s) => ({ ...s, items: s.items.map((i) => ({ item: i, text: haystack(i) })) })),
    [sections],
  );

  const q = query.trim();
  const filtered = useMemo(
    () =>
      indexed.map((s) => ({
        ...s,
        visible: new Set(s.items.filter(({ text }) => !q || matchesQuery(text, q)).map(({ item }) => item.id)),
      })),
    [indexed, q],
  );
  const total = filtered.reduce((n, s) => n + s.visible.size, 0);
  const gridRef = useRef<HTMLDivElement>(null);

  // Pointer-following border spotlight (desktop): one delegated listener sets --mx/--my on the hovered card.
  // Shared-element source: remember where the pressed card's image/title are (capture phase,
  // before the Link navigates and the modal mounts).
  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('[data-item-card]');
      const slug = card?.dataset.itemCard;
      if (card && slug) rememberSource(card, slug);
    };
    root.addEventListener('click', onClick, { capture: true });
    return () => root.removeEventListener('click', onClick, { capture: true });
  }, []);

  useEffect(() => {
    const root = gridRef.current;
    if (!root || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const onMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('.lupo-card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    root.addEventListener('pointermove', onMove, { passive: true });
    return () => root.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <>
      <SectionChips sections={sections} active={active} />
      <div
        id="menu"
        className="mx-auto grid max-w-[1280px] gap-8 px-4 pt-8 pb-16 lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-10 lg:px-8 lg:pt-12"
      >
        <SideRail sections={sections} active={active} />
        <div ref={gridRef} className="flex min-w-0 flex-col gap-14 lg:gap-20">
          {q && (
            <p role="status" aria-live="polite" className="sr-only">
              {total === 0 ? ar.search.empty : `${total}`}
            </p>
          )}
          {filtered.map((s) => (
            <section
              key={s.id}
              id={s.slug}
              aria-labelledby={`${s.slug}-title`}
              hidden={s.visible.size === 0}
            >
              <SectionHeader section={s} />
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                {s.items.map(({ item }, idx) => (
                  <li
                    key={item.id}
                    hidden={!s.visible.has(item.id)}
                    data-search-item={item.slug}
                    style={{ '--i': idx % 4 } as CSSProperties}
                  >
                    <ItemCard item={item} priority={s === filtered[0] && idx < 2} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {q && total === 0 && (
            <div className="glass flex flex-col items-center gap-3 rounded-card px-6 py-14 text-center">
              <span className="glass flex size-16 items-center justify-center rounded-chip">
                <SearchX size={28} strokeWidth={1.75} className="text-muted" aria-hidden="true" />
              </span>
              <p className="text-base leading-ui font-semibold text-fg">{ar.search.empty}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
