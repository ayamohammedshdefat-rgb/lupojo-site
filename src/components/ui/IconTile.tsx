import { AppIcon } from '@/components/icons/AppIcon';

type IconTileProps = {
  icon: string;
  /** Icon size in px. */
  size?: number;
  className?: string;
  /** Stronger glow for hero/detail use. */
  intense?: boolean;
};

/** Warm-white icon over a soft accent glow on a glass tile (items without photos, chips, empty states). */
export function IconTile({ icon, size = 28, className = '', intense = false }: IconTileProps) {
  return (
    <span className={`glass relative isolate flex items-center justify-center overflow-hidden ${className}`}>
      <span
        aria-hidden="true"
        className={`glow-accent absolute inset-[-20%] -z-10 ${intense ? 'opacity-90' : 'opacity-55'}`}
      />
      <span aria-hidden="true" className="absolute inset-0 -z-10 rounded-[inherit] ring-1 ring-white/5 ring-inset" />
      <AppIcon name={icon} size={size} className="text-fg drop-shadow-[0_4px_12px_rgb(0_0_0/0.45)]" />
    </span>
  );
}
