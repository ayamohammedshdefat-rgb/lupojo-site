import { Star } from 'lucide-react';
import { strokeFor } from '@/components/icons/registry';

type StarsProps = {
  /** 0–5, fractional values render partial stars. */
  value: number;
  size?: number;
  className?: string;
  label?: string;
};

/** Read-only star row. In RTL, star 1 is on the right (flex follows the document direction). */
export function Stars({ value, size = 16, className = '', label }: StarsProps) {
  const stroke = strokeFor(size);
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} strokeWidth={stroke} className="absolute inset-0 text-muted/45" aria-hidden="true" />
            {fill > 0 && (
              <span className="absolute inset-y-0 start-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star
                  size={size}
                  strokeWidth={stroke}
                  className="absolute inset-y-0 start-0 text-gold"
                  fill="currentColor"
                  aria-hidden="true"
                />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
