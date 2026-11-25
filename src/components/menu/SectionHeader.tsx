import { IconTile } from '@/components/ui/IconTile';
import { En } from '@/components/ui/En';
import { VelocityMarquee } from '@/components/motion/VelocityMarquee';
import type { Section } from '@/types/menu';

/** Section title: icon tile, Arabic title (mask slide-up) and English sublabel over a velocity marquee. */
export function SectionHeader({ section }: { section: Pick<Section, 'slug' | 'nameAr' | 'nameEn' | 'icon'> }) {
  return (
    <div className="relative isolate mb-6 flex items-center gap-4 pt-2 lg:mb-8">
      <div className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2">
        <VelocityMarquee text={section.nameEn} />
      </div>
      <IconTile icon={section.icon} size={26} className="size-14 shrink-0 rounded-chip" />
      <div className="flex flex-col">
        <h2 id={`${section.slug}-title`} className="reveal-mask overflow-hidden text-[28px] leading-heading font-black text-fg sm:text-[32px]">
          <span className="block">{section.nameAr}</span>
        </h2>
        <En className="text-xs leading-ui font-semibold text-accent-hi">{section.nameEn}</En>
      </div>
    </div>
  );
}
