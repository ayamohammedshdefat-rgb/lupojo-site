'use client';

import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ar } from '@/i18n/ar';
import { SearchField } from './SearchField';
import { useMenuSearch } from './search-context';

type SiteHeaderProps = { logoUrl: string; brandName: string };

/**
 * Compact sticky header (logo + search). Scroll-linked docking: as the hero logo scrolls under the
 * header, `--dock` goes 0 -> 1 and drives the background and the small logo (fade, rise, scale).
 * On desktop the search field is always visible; on mobile it expands from the search button.
 * Ctrl/Cmd+K focuses search.
 */
export function SiteHeader({ logoUrl, brandName }: SiteHeaderProps) {
  const { open, setOpen, setQuery, focus } = useMenuSearch();
  const headerRef = useRef<HTMLElement>(null);
  const [docked, setDocked] = useState(false);

  // rAF-throttled; writes one CSS variable per frame (no React re-render while scrolling).
  useEffect(() => {
    let start = 160;
    let end = 300;
    let frame = 0;
    const measure = () => {
      const hero = document.getElementById('hero-logo');
      if (!hero) return;
      const r = hero.getBoundingClientRect();
      const top = r.top + window.scrollY;
      start = top + r.height * 0.25 - 56;
      end = Math.max(start + 1, top + r.height - 32);
    };
    const update = () => {
      frame = 0;
      const p = Math.min(1, Math.max(0, (window.scrollY - start) / (end - start)));
      headerRef.current?.style.setProperty('--dock', p.toFixed(3));
      setDocked(p > 0.5);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focus]);

  return (
    <header
      ref={headerRef}
      data-docked={docked ? '' : undefined}
      className="sticky top-0 z-40 h-14"
      style={{ '--dock': 0 } as CSSProperties}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-0 border-b border-line bg-canvas/80 backdrop-blur-xl ${open ? '' : 'lupo-dock-bg'}`}
      />
      <div className="relative mx-auto flex h-full max-w-[1280px] items-center gap-3 px-4 lg:px-8">
        <div className={`shrink-0 ${open ? 'max-lg:hidden' : 'lupo-dock-logo'} ${docked || open ? '' : 'pointer-events-none'}`}>
          <Link
            href="/"
            aria-label={brandName}
            tabIndex={docked ? undefined : -1}
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- vector logo, no optimization needed */}
            <img src={logoUrl} alt={brandName} width={1376} height={404} className="h-8 w-auto" />
          </Link>
        </div>

        <div className="flex-1 max-lg:hidden">
          <SearchField variant="desktop" className="mx-auto max-w-md" />
        </div>

        {open ? (
          <div className="flex flex-1 items-center gap-2 lg:hidden">
            <SearchField variant="mobile" className="flex-1" autoFocus onClose={() => setOpen(false)} />
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setOpen(false);
              }}
              aria-label={ar.common.close}
              className="flex size-11 shrink-0 items-center justify-center rounded-full text-fg hover:bg-white/10"
            >
              <X size={20} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={focus}
            aria-label={ar.search.label}
            className="glass ms-auto flex size-11 items-center justify-center rounded-full text-fg lg:hidden"
          >
            <Search size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>
        )}
      </div>
    </header>
  );
}
