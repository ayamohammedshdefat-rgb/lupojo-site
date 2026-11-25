import { Award, Clock, Flame, Sparkles } from 'lucide-react';
import { Icon } from 'lucide-react';
import { pepperChilli } from '@lucide/lab';
import type { ReactNode } from 'react';
import { ar } from '@/i18n/ar';
import type { Badge as BadgeKey } from '@/types/menu';

type PillProps = { icon: ReactNode; children: ReactNode; tone?: 'glass' | 'accent' | 'gold' | 'muted'; className?: string };

const TONES = {
  glass: 'glass-strong text-fg',
  accent: 'bg-accent text-canvas',
  gold: 'glass-strong text-gold',
  muted: 'bg-surface-3/90 text-fg ring-1 ring-white/10',
} as const;

export function Pill({ icon, children, tone = 'glass', className = '' }: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] leading-ui font-semibold whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
}

const ICON = 14;

export function ItemBadge({ badge }: { badge: BadgeKey }) {
  switch (badge) {
    case 'new':
      return (
        <Pill icon={<Sparkles size={ICON} strokeWidth={2} aria-hidden="true" />} tone="glass">
          {ar.badges.new}
        </Pill>
      );
    case 'bestseller':
      return (
        <Pill icon={<Flame size={ICON} strokeWidth={2} fill="currentColor" className="text-gold" aria-hidden="true" />}>
          {ar.badges.bestseller}
        </Pill>
      );
    case 'spicy':
      return (
        <Pill icon={<Icon iconNode={pepperChilli} size={ICON} strokeWidth={2} className="text-accent-hi" aria-hidden="true" />}>
          {ar.badges.spicy}
        </Pill>
      );
  }
}

export function TopRatedBadge() {
  return (
    <Pill icon={<Award size={ICON} strokeWidth={2} aria-hidden="true" />} tone="gold">
      {ar.item.topRated}
    </Pill>
  );
}

export function UnavailableBadge({ note }: { note?: string }) {
  return (
    <Pill icon={<Clock size={ICON} strokeWidth={2} aria-hidden="true" />} tone="muted">
      {note ? `${ar.item.unavailable} · ${note}` : ar.item.unavailable}
    </Pill>
  );
}
