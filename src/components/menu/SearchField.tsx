'use client';

import { Search, X } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { ar } from '@/i18n/ar';
import { useMenuSearch } from './search-context';

const noopSubscribe = () => () => {};

/** Menu search input. Ctrl/Cmd+K focuses it on desktop. */
type SearchFieldProps = { variant: 'desktop' | 'mobile'; className?: string; autoFocus?: boolean; onClose?: () => void };

export function SearchField({ variant, className = '', autoFocus = false, onClose }: SearchFieldProps) {
  const { query, setQuery, desktopRef, mobileRef } = useMenuSearch();
  const inputRef = variant === 'desktop' ? desktopRef : mobileRef;
  const isMac = useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.userAgent),
    () => false,
  );

  return (
    <div role="search" className={`relative flex items-center ${className}`}>
      <Search size={18} strokeWidth={2} className="pointer-events-none absolute start-3.5 text-muted" aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        autoFocus={autoFocus}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            if (query) setQuery('');
            else onClose?.();
          }
        }}
        placeholder={ar.search.placeholder}
        aria-label={ar.search.label}
        className="h-11 w-full rounded-full border border-line bg-white/[0.06] ps-10 pe-20 text-[15px] text-fg placeholder:text-muted focus:border-accent/60 focus:bg-white/[0.09] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {query ? (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            inputRef.current?.focus();
          }}
          aria-label={ar.search.clear}
          className="absolute end-1.5 flex size-8 items-center justify-center rounded-full text-muted hover:bg-white/10 hover:text-fg"
        >
          <X size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      ) : (
        <span className="pointer-events-none absolute end-3 hidden lg:block">
          <kbd dir="ltr" className="rounded-md border border-line px-1.5 py-0.5 text-[11px] leading-ui font-semibold text-muted">
            {isMac ? 'Cmd K' : 'Ctrl K'}
          </kbd>
        </span>
      )}
    </div>
  );
}
