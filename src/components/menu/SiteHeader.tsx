'use client';

import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ar } from '@/i18n/ar';
import { SearchField } from './SearchField';
import { useMenuSearch } from './search-context';

type SiteHeaderProps = { logoUrl: string; brandName: string };

/**
 * Compact sticky header (logo + search). It turns solid once the hero logo scrolls away.
 * On desktop the search field is always visible; on mobile it expands from the search button.
 */
export function SiteHeader({ logoUrl, brandName }: SiteHeaderProps) {
  const { open, setOpen, setQuery, focus } = useMenuSearch();
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('hero-logo');
    if (!hero) return;
    const io = new IntersectionObserver(([entry]) => setDocked(!entry?.isIntersecting), { rootMargin: '-56px 0px 0px 0px' });
    io.observe(hero);
    return () => io.disconnect();
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

  const solid = docked || open;

  return (
    <header
      data-docked={docked ? '' : undefined}
      className={`sticky top-0 z-40 h-14 transition-[background-color,border-color,backdrop-filter] duration-320 ease-lupo ${
        solid ? 'border-b border-line bg-canvas/80 backdrop-blur-xl' : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1280px] items-center gap-3 px-4 lg:px-8">
        <Link
          href="/"
          aria-label={brandName}
          className={`shrink-0 transition-[opacity,translate] duration-320 ease-lupo ${
            docked || open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
          } ${open ? 'max-lg:hidden' : ''}`}
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
