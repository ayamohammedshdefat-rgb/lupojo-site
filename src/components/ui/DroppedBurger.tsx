import Link from 'next/link';
import { Hamburger } from 'lucide-react';
import type { ReactNode } from 'react';
import { ar } from '@/i18n/ar';

/** Branded 404/error moment: a burger icon tumbles off the tray and lands with a bounce. */
export function DroppedBurger({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden px-6 text-center">
      <div aria-hidden="true" className="glow-accent animate-breathe absolute top-1/3 -z-10 size-[520px] rounded-full opacity-50 blur-3xl" />
      <div aria-hidden="true" className="relative h-40 w-56">
        <span className="lupo-tumble absolute inset-x-0 top-0 mx-auto flex w-fit justify-center text-fg">
          <Hamburger size={84} strokeWidth={1.5} />
        </span>
        <span className="lupo-shadow absolute inset-x-6 bottom-2 mx-auto h-3 rounded-[50%] bg-black/60 blur-sm" />
        <span className="absolute inset-x-0 bottom-0 mx-auto h-1 w-44 rounded-full bg-gradient-to-l from-transparent via-accent/70 to-transparent" />
      </div>
      <h1 className="text-3xl leading-heading font-black text-fg sm:text-4xl">{title}</h1>
      <p className="max-w-sm text-base leading-ar text-muted">{body}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {action}
        <Link
          href="/"
          className="inline-flex min-h-12 items-center rounded-full bg-accent px-6 text-base leading-ui font-semibold text-canvas transition-colors hover:bg-accent-hi"
        >
          {ar.errors.backToMenu}
        </Link>
      </div>
    </main>
  );
}
