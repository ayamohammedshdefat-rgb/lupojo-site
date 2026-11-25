import { IconTile } from '@/components/ui/IconTile';
import { En } from '@/components/ui/En';
import type { Section } from '@/types/menu';

/** Section title: icon tile, Arabic title and English sublabel over a giant outlined English word. */
export function SectionHeader({ section }: { section: Pick<Section, 'slug' | 'nameAr' | 'nameEn' | 'icon'> }) {
  return (
    <div className="relative isolate mb-6 flex items-center gap-4 overflow-x-clip pt-2 lg:mb-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 overflow-hidden">
        <span
          lang="en"
          dir="ltr"
          className="lupo-outline-word block text-[72px] leading-display font-black whitespace-nowrap uppercase sm:text-[104px] lg:text-[128px]"
        >
          {section.nameEn}
        </span>
      </div>
      <IconTile icon={section.icon} size={26} className="size-14 shrink-0 rounded-chip" />
      <div className="flex flex-col">
        <h2 id={`${section.slug}-title`} className="text-[28px] leading-heading font-black text-fg sm:text-[32px]">
          {section.nameAr}
        </h2>
        <En className="text-xs leading-ui font-semibold text-accent-hi">{section.nameEn}</En>
      </div>
    </div>
  );
}
