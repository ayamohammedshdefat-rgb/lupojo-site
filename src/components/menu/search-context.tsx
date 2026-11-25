'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';

type SearchState = {
  query: string;
  setQuery: (q: string) => void;
  /** Mobile search row expanded in the header. */
  open: boolean;
  setOpen: (open: boolean) => void;
  desktopRef: RefObject<HTMLInputElement | null>;
  mobileRef: RefObject<HTMLInputElement | null>;
  /** Focuses the visible search field (desktop field, or expands the mobile one). */
  focus: () => void;
};

const SearchContext = createContext<SearchState | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQueryState] = useState('');
  const [open, setOpen] = useState(false);
  const desktopRef = useRef<HTMLInputElement | null>(null);
  const mobileRef = useRef<HTMLInputElement | null>(null);

  const setQuery = useCallback((q: string) => {
    setQueryState(q);
    if (q.trim()) {
      const menu = document.getElementById('menu');
      if (menu && menu.getBoundingClientRect().top > 160) {
        menu.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  const focus = useCallback(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      desktopRef.current?.focus();
      desktopRef.current?.select();
      return;
    }
    setOpen(true);
    requestAnimationFrame(() => mobileRef.current?.focus());
  }, []);

  const value = useMemo(
    () => ({ query, setQuery, open, setOpen, desktopRef, mobileRef, focus }),
    [query, setQuery, open, focus],
  );
  return <SearchContext value={value}>{children}</SearchContext>;
}

export function useMenuSearch(): SearchState {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useMenuSearch must be used inside <SearchProvider>');
  return ctx;
}
