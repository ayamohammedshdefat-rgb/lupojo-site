'use client';

import { useLayoutEffect, useRef } from 'react';

/**
 * Positions one indicator element over the active item and lets CSS transition it between items
 * (the "active pill slides between chips" effect, no animation library). Coordinates are taken
 * relative to the indicator's container, so RTL and horizontal scrolling need no special casing.
 */
export function useSlidingIndicator<C extends HTMLElement, I extends HTMLElement>(
  activeSelector: string | null,
  axis: 'x' | 'y',
) {
  const containerRef = useRef<C>(null);
  const indicatorRef = useRef<I>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const indicator = indicatorRef.current;
    if (!container || !indicator) return;
    const place = () => {
      const target = activeSelector ? container.querySelector<HTMLElement>(activeSelector) : null;
      if (!target) {
        indicator.style.opacity = '0';
        return;
      }
      const c = container.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      if (axis === 'x') {
        indicator.style.width = `${t.width}px`;
        indicator.style.height = `${t.height}px`;
        indicator.style.transform = `translate(${t.left - c.left}px, ${t.top - c.top}px)`;
      } else {
        indicator.style.height = `${t.height}px`;
        indicator.style.width = `${t.width}px`;
        indicator.style.transform = `translate(${t.left - c.left}px, ${t.top - c.top}px)`;
      }
      indicator.style.opacity = '1';
      container.dataset.indicatorReady = '';
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(container);
    return () => ro.disconnect();
  }, [activeSelector, axis]);

  return { containerRef, indicatorRef };
}
