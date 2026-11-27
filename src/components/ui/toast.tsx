'use client';

import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import { useEffect, useSyncExternalStore } from 'react';

type Tone = 'success' | 'error' | 'info';
type ToastItem = { id: number; message: string; tone: Tone; leaving?: boolean; action?: { label: string; onClick: () => void } };

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function toast(message: string, tone: Tone = 'success', action?: ToastItem['action']) {
  const id = nextId++;
  items = [...items.slice(-2), { id, message, tone, action }];
  emit();
  return id;
}

/** Plays the exit animation, then removes the toast. */
export function dismissToast(id: number) {
  if (!items.some((t) => t.id === id && !t.leaving)) return;
  items = items.map((t) => (t.id === id ? { ...t, leaving: true } : t));
  emit();
  window.setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    emit();
  }, 220);
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info } as const;
const COLORS = { success: 'text-success', error: 'text-danger', info: 'text-accent-hi' } as const;

function ToastRow({ t }: { t: ToastItem }) {
  useEffect(() => {
    const timer = window.setTimeout(() => dismissToast(t.id), t.action ? 6000 : 3500);
    return () => window.clearTimeout(timer);
  }, [t.id, t.action]);
  const Icon = ICONS[t.tone];
  return (
    <li
      data-leaving={t.leaving ? '' : undefined}
      className="lupo-toast glass-strong pointer-events-auto flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm leading-ui text-fg shadow-card"
    >
      <Icon size={20} strokeWidth={1.75} className={COLORS[t.tone]} aria-hidden="true" />
      <span className="flex-1">{t.message}</span>
      {t.action && (
        <button
          type="button"
          onClick={() => {
            t.action?.onClick();
            dismissToast(t.id);
          }}
          className="min-h-9 rounded-full px-3 text-sm font-semibold text-accent-hi hover:bg-white/10"
        >
          {t.action.label}
        </button>
      )}
    </li>
  );
}

/** Mount once in the root layout. Announces messages politely to screen readers. */
export function Toaster() {
  const list = useSyncExternalStore(subscribe, () => items, () => items);
  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed inset-x-0 top-[calc(0.75rem+env(safe-area-inset-top))] z-[80] flex justify-center px-4"
    >
      <ul className="flex w-full max-w-md flex-col gap-2">
        {list.map((t) => (
          <ToastRow key={t.id} t={t} />
        ))}
      </ul>
    </div>
  );
}
