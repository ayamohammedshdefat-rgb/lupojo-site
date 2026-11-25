'use client';

import { useEffect, useRef } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};

/** Cloudflare Turnstile widget; renders nothing unless NEXT_PUBLIC_TURNSTILE_SITE_KEY is set. */
export function TurnstileField({ onToken }: { onToken: (token: string | undefined) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onToken);
  useEffect(() => {
    cb.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    let widgetId: string | null = null;
    const w = window as typeof window & { turnstile?: TurnstileApi };
    const mount = () => {
      if (!ref.current || !w.turnstile) return;
      widgetId = w.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        theme: 'dark',
        language: 'ar',
        callback: (t: string) => cb.current(t),
        'expired-callback': () => cb.current(undefined),
      });
    };
    if (w.turnstile) mount();
    else {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.onload = mount;
      document.head.appendChild(s);
    }
    return () => {
      if (widgetId && w.turnstile) w.turnstile.remove(widgetId);
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={ref} className="flex min-h-16 justify-center" />;
}
