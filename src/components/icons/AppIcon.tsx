import { Icon } from 'lucide-react';
import { ICON_REGISTRY, resolveIconKey, strokeFor } from './registry';

type AppIconProps = {
  /** Registry key (unknown values fall back to `utensils`). */
  name: string | undefined;
  size?: number;
  className?: string;
  /** Accessible label; without it the icon is decorative (aria-hidden). */
  label?: string;
  strokeWidth?: number;
};

/** Renders a registry icon (lucide, @lucide/lab or LUPO custom) with the project's stroke rules. */
export function AppIcon({ name, size = 24, className, label, strokeWidth }: AppIconProps) {
  const entry = ICON_REGISTRY[resolveIconKey(name)];
  const common = {
    size,
    strokeWidth: strokeWidth ?? strokeFor(size),
    className,
    'aria-hidden': label ? undefined : true,
    'aria-label': label,
    role: label ? 'img' : undefined,
    focusable: 'false',
  } as const;
  if (entry.kind === 'lucide') {
    const C = entry.Icon;
    return <C {...common} />;
  }
  return <Icon iconNode={entry.node} {...common} />;
}
