'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';

/**
 * Card <-> detail shared-element transition without a motion library.
 * The card records where its image/title were when pressed; the detail flies a fixed-position
 * ghost (a clone, so no container can clip it) from there to its own slot on mount, and back
 * into the card when the modal closes. Web Animations API, transform + opacity only.
 */

type Kind = 'media' | 'title';
type Source = { rects: Partial<Record<Kind, DOMRect>>; at: number };

const sources = new Map<string, Source>();
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const FRESH_MS = 2500;
export const MODAL_CLOSING_EVENT = 'lupo:modal-closing';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const onScreen = (r: DOMRect) => r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;

/** Called on card press: remembers the start rects for the flight. */
export function rememberSource(card: Element, slug: string) {
  const rects: Source['rects'] = {};
  for (const kind of ['media', 'title'] as const) {
    const el = card.querySelector<HTMLElement>(`[data-shared="${kind}"]`);
    if (el) rects[kind] = el.getBoundingClientRect();
  }
  sources.set(slug, { rects, at: performance.now() });
}

/** True when a fresh card source exists (the modal then fades in and lets the image fly). */
export function hasFreshSource(slug: string) {
  const s = sources.get(slug);
  return !!s && performance.now() - s.at < FRESH_MS;
}

/**
 * Clones `el` (already rendered and loaded) at its own rect `from`, so its content fits naturally,
 * and flies the clone to rect `to`. `hide` elements stay invisible during the flight.
 */
function flyGhost(el: HTMLElement, from: DOMRect, to: DOMRect, hide: HTMLElement[], duration: number) {
  const ghost = el.cloneNode(true) as HTMLElement;
  ghost.removeAttribute('data-shared-target');
  ghost.removeAttribute('data-shared');
  ghost.removeAttribute('id');
  ghost.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
  ghost.setAttribute('aria-hidden', 'true');
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    margin: '0',
    zIndex: '90',
    pointerEvents: 'none',
    transformOrigin: '0 0',
    visibility: 'visible',
  });
  document.body.appendChild(ghost);
  hide.forEach((h) => (h.style.visibility = 'hidden'));
  const sx = to.width / Math.max(1, from.width);
  const sy = to.height / Math.max(1, from.height);
  const anim = ghost.animate(
    [{ transform: 'none' }, { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${sx}, ${sy})` }],
    { duration, easing: EASE, fill: 'forwards' },
  );
  const done = () => {
    ghost.remove();
    hide.forEach((h) => (h.style.visibility = ''));
  };
  anim.finished.then(done, done);
}

function cardPart(slug: string, kind: Kind) {
  return document.querySelector<HTMLElement>(`[data-item-card="${slug}"] [data-shared="${kind}"]`);
}

/** Marks a card element as a shared-element source. */
export function SharedSource({ kind, children, className }: { kind: Kind; children: ReactNode; className?: string }) {
  return (
    <div data-shared={kind} className={className}>
      {children}
    </div>
  );
}

/** Detail-side shared element: flies in from the card on mount and back into it on close. */
export function SharedTarget({ slug, kind, children, className }: { slug: string; kind: Kind; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const source = sources.get(slug);
    const from = source?.rects[kind];
    const card = cardPart(slug, kind);
    if (from && card && source && performance.now() - source.at < FRESH_MS && !reduced()) {
      // Clone the card's part (its image is already loaded) and fly it into this slot.
      flyGhost(card, from, el.getBoundingClientRect(), [el, card], 540);
    }
    if (kind === 'media') sources.delete(slug);

    const onClosing = () => {
      const card = cardPart(slug, kind);
      if (!card || reduced()) return;
      const to = card.getBoundingClientRect();
      const now = el.getBoundingClientRect();
      if (!onScreen(to) || !onScreen(now)) return;
      // Fly a clone of the detail part back into the card.
      flyGhost(el, now, to, [el, card], 320);
    };
    window.addEventListener(MODAL_CLOSING_EVENT, onClosing);
    return () => window.removeEventListener(MODAL_CLOSING_EVENT, onClosing);
  }, [slug, kind]);

  return (
    <div ref={ref} data-shared-target={kind} className={className}>
      {children}
    </div>
  );
}
