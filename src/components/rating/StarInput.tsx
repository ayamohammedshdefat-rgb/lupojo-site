'use client';

import { Star } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useId, useRef, useState } from 'react';
import { ar } from '@/i18n/ar';
import { SPRING_UI } from '@/lib/motion-tokens';

type StarInputProps = {
  value: number;
  onChange: (v: number) => void;
  error?: string;
  describedBy?: string;
};

/**
 * Star rating as a radio group. In RTL star 1 is on the right; arrow keys follow reading
 * direction (ArrowLeft = more stars in RTL). Hover/drag previews the fill, selection pops with a
 * spring, and the label morphs: سيئ / مقبول / جيد / جيد جدًا / ممتاز!
 */
export function StarInput({ value, onChange, error, describedBy }: StarInputProps) {
  const [preview, setPreview] = useState<number | null>(null);
  const [popped, setPopped] = useState(0);
  const dragging = useRef(false);
  const groupRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const shown = preview ?? value;

  const select = (v: number) => {
    onChange(v);
    setPopped((p) => p + 1);
  };

  const valueAt = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-star]');
    return el ? Number(el.dataset.star) : null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const inc = (rtl && e.key === 'ArrowLeft') || (!rtl && e.key === 'ArrowRight') || e.key === 'ArrowUp';
    const dec = (rtl && e.key === 'ArrowRight') || (!rtl && e.key === 'ArrowLeft') || e.key === 'ArrowDown';
    if (!inc && !dec && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const next = e.key === 'Home' ? 1 : e.key === 'End' ? 5 : Math.min(5, Math.max(1, (value || 0) + (inc ? 1 : -1)));
    select(next);
    groupRef.current?.querySelector<HTMLElement>(`[data-star="${next}"]`)?.focus();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={groupRef}
        role="radiogroup"
        aria-label={ar.rating.stars}
        aria-describedby={[labelId, describedBy].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? true : undefined}
        className="flex touch-none items-center gap-1.5"
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          dragging.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          const v = valueAt(e.clientX, e.clientY);
          if (v) setPreview(v);
        }}
        onPointerMove={(e) => {
          const v = valueAt(e.clientX, e.clientY);
          if (v && (dragging.current || e.pointerType === 'mouse')) setPreview(v);
        }}
        onPointerUp={(e) => {
          const v = valueAt(e.clientX, e.clientY) ?? preview;
          dragging.current = false;
          setPreview(null);
          if (v) select(v);
        }}
        onPointerLeave={() => {
          if (!dragging.current) setPreview(null);
        }}
        onPointerCancel={() => {
          dragging.current = false;
          setPreview(null);
        }}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= shown;
          const checked = value === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={`${n} — ${ar.rating.labels[n - 1]}`}
              tabIndex={checked || (!value && n === 1) ? 0 : -1}
              data-star={n}
              onClick={(e) => {
                // Keyboard activation (Enter/Space); pointer selection is handled on pointerup.
                if (e.detail === 0) select(n);
              }}
              className="flex size-12 items-center justify-center rounded-full outline-offset-2"
            >
              <m.span
                key={checked ? `pop-${popped}` : `star-${n}`}
                initial={checked ? { scale: 0.6 } : false}
                animate={{ scale: 1 }}
                transition={{ ...SPRING_UI, stiffness: 520, damping: 14 }}
                className="pointer-events-none flex"
              >
                <Star
                  size={36}
                  strokeWidth={1.75}
                  fill={active ? 'currentColor' : 'none'}
                  className={`transition-colors duration-180 ${active ? 'text-gold drop-shadow-[0_0_12px_rgb(255_194_61/0.45)]' : 'text-muted/60'}`}
                  aria-hidden="true"
                />
              </m.span>
            </button>
          );
        })}
      </div>
      <div id={labelId} className="relative h-6 w-40 overflow-hidden text-center" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span
            key={shown || 0}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={SPRING_UI}
            className={`absolute inset-x-0 text-base leading-ui font-semibold ${shown ? 'text-gold' : 'text-muted'}`}
          >
            {shown ? ar.rating.labels[shown - 1] : ar.errors.stars}
          </m.span>
        </AnimatePresence>
      </div>
      {error && (
        <p role="alert" className="text-sm leading-ui text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
