import Image from 'next/image';
import { IconTile } from '@/components/ui/IconTile';
import type { Item } from '@/types/menu';

type ItemMediaProps = {
  item: Pick<Item, 'nameAr' | 'nameEn' | 'icon' | 'image' | 'cutout'>;
  sizes: string;
  priority?: boolean;
  /** 'card' keeps the grid rhythm, 'detail' is the large hero. */
  variant?: 'card' | 'detail';
  className?: string;
};

/**
 * Cutout -> floats over its glow with a deep shadow. Photo -> rounded, masked, vignetted.
 * Neither -> icon tile. Never a broken image.
 */
export function ItemMedia({ item, sizes, priority, variant = 'card', className = '' }: ItemMediaProps) {
  const alt = `${item.nameAr} — ${item.nameEn}`;
  const radius = variant === 'card' ? 'rounded-[22px]' : 'rounded-[30px]';

  if (item.cutout) {
    return (
      <div className={`relative isolate aspect-[5/4] ${className}`}>
        <div aria-hidden="true" className="glow-accent animate-breathe absolute inset-[6%] -z-10 rounded-full" />
        <Image
          src={item.cutout.url}
          alt={item.cutout.alt || alt}
          width={item.cutout.width}
          height={item.cutout.height}
          sizes={sizes}
          priority={priority}
          quality={85}
          className="h-full w-full object-contain drop-shadow-[0_28px_30px_rgb(0_0_0/0.65)]"
        />
      </div>
    );
  }

  if (item.image) {
    return (
      <div className={`relative isolate aspect-[5/4] overflow-hidden ${radius} bg-surface-2 ${className}`}>
        <Image
          src={item.image.url}
          alt={item.image.alt || alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={variant === 'detail' ? 85 : 70}
          placeholder={item.image.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={item.image.blurDataURL || undefined}
          className="lupo-media object-cover transition-transform duration-600 ease-lupo"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_30%,transparent_55%,rgb(0_0_0/0.55))]"
        />
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 ${radius} ring-1 ring-white/10 ring-inset`}
        />
      </div>
    );
  }

  return (
    <IconTile
      icon={item.icon}
      size={variant === 'card' ? 56 : 96}
      intense={variant === 'detail'}
      className={`aspect-[5/4] w-full ${radius} ${className}`}
    />
  );
}
