import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import { AppIcon } from '@/components/icons/AppIcon';
import { En } from '@/components/ui/En';
import { ar } from '@/i18n/ar';
import { logoUrlOf } from '@/lib/brand';
import { formatJD } from '@/lib/format';
import { getPublicMenu } from '@/server/repos/menu';
import type { MenuItem } from '@/types/menu';
import { PrintButton } from './PrintButton';

export const metadata: Metadata = {
  title: 'المنيو الكلاسيكي | LUPO',
  alternates: { canonical: '/classic' },
};

function PhotoCard({ item }: { item: MenuItem }) {
  const multi = item.prices.length > 1;
  return (
    <article className="classic-card overflow-hidden rounded-[20px] border border-white/12 bg-[rgb(16_16_16/0.94)] shadow-[0_12px_32px_rgb(0_0_0/0.32)] print:break-inside-avoid print:border-black/20 print:bg-white print:shadow-none">
      {item.image && (
        <div className="relative aspect-[16/11]">
          <Image
            src={item.image.url}
            alt={item.image.alt || `${item.nameAr} — ${item.nameEn}`}
            fill
            sizes="(min-width: 720px) 45vw, 100vw"
            quality={70}
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <En as="h3" className="block text-end text-2xl leading-display font-black text-accent-hi print:text-black">
          {item.nameEn}
        </En>
        <p className="mt-1 mb-4 text-lg leading-heading font-black text-white print:text-black">{item.nameAr}</p>
        {multi ? (
          <div className="grid grid-cols-2 gap-2">
            {item.prices.map((p, i) => (
              <div key={i} className="rounded-xl border border-white/7 bg-black/50 p-3 print:border-black/15 print:bg-white">
                <span className="block text-xs leading-ui font-bold text-white print:text-black">{p.labelAr}</span>
                {p.labelEn && <En className="block text-[9px] leading-ui text-muted print:text-black/60">{p.labelEn}</En>}
                <strong dir="ltr" className="tabular mt-2 block text-lg leading-ui text-white print:text-black">
                  {formatJD(p.amountFils)}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <span
            dir="ltr"
            className="tabular inline-block rounded-[10px] border border-accent/70 px-3 py-2 text-xl leading-ui font-black text-accent-hi print:border-black/40 print:text-black"
          >
            {formatJD(item.prices[0]?.amountFils ?? 0)}
          </span>
        )}
      </div>
    </article>
  );
}

function ExtraRow({ item }: { item: MenuItem }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed border-white/16 p-4 last:border-b-0 print:break-inside-avoid print:border-black/20">
      <div className="flex items-center gap-3">
        <AppIcon name={item.icon} size={22} className="text-accent-hi print:text-black" />
        <span>
          <strong className="block text-sm leading-ui font-bold text-white print:text-black">{item.nameAr}</strong>
          <En className="block text-[9px] leading-ui text-muted print:text-black/60">{item.nameEn}</En>
        </span>
      </div>
      <span dir="ltr" className="tabular font-black text-accent-hi print:text-black">
        {item.prices.map((p) => formatJD(p.amountFils)).join(' / ')}
      </span>
    </div>
  );
}

/**
 * The original paper-style menu, kept alive from live Firestore data (icons replace the old emojis).
 * Print-friendly on A4.
 */
export default async function ClassicPage() {
  const { settings, sections } = await getPublicMenu();
  const missionLines = settings.mission.titleAr.split('\n').filter(Boolean);

  return (
    <div className="classic min-h-dvh bg-canvas print:bg-white print:text-black">
      <div className="flex items-center justify-between gap-2 px-4 py-3 print:hidden">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm leading-ui font-semibold text-muted hover:text-fg">
          <ArrowLeft size={18} strokeWidth={2} className="rtl:-scale-x-100" aria-hidden="true" />
          {ar.errors.backToMenu}
        </Link>
        <PrintButton icon={<Printer size={18} strokeWidth={2} aria-hidden="true" />} />
      </div>

      <header className="flex flex-col items-center border-b border-line bg-gradient-to-b from-black/40 to-black/70 px-4 pt-6 pb-4 text-center print:border-black/20 print:bg-none">
        {settings.taglineEn && (
          <En as="p" className="mb-3 text-[clamp(22px,5.6vw,32px)] leading-display font-black text-[#f0e8df] print:text-black">
            {settings.taglineEn}
          </En>
        )}
        {settings.subtaglineAr && <p className="text-[15px] leading-ui text-[#d1c8bf] print:text-black/70">{settings.subtaglineAr}</p>}
        {settings.subtaglineEn && (
          <En as="p" caps={false} className="text-[15px] leading-ui text-[#d1c8bf] print:text-black/70">
            {settings.subtaglineEn}
          </En>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element -- vector logo */}
        <img
          src={logoUrlOf(settings)}
          alt={settings.brandName}
          width={1376}
          height={404}
          className="mt-6 h-auto w-[min(620px,94vw)] print:w-[320px] print:invert print:hue-rotate-180"
        />
      </header>

      <nav aria-label={ar.menu.sectionsNav} className="no-scrollbar mx-auto mt-2 mb-6 flex max-w-[1100px] gap-2 overflow-x-auto px-3 py-2 print:hidden">
        {sections.map((s, i) => (
          <a
            key={s.id}
            href={`#${s.slug}`}
            className={`flex shrink-0 items-center gap-2 rounded-full border bg-[#141414] px-3.5 py-2 text-fg ${i === 0 ? 'border-accent' : 'border-white/15'}`}
          >
            <AppIcon name={s.icon} size={18} />
            <span className="flex flex-col leading-ui">
              <b className="text-xs font-bold">{s.nameAr}</b>
              <En className="text-[9px] text-muted">{s.nameEn}</En>
            </span>
          </a>
        ))}
      </nav>

      <main>
        {sections.map((s) => {
          const withPhoto = s.items.filter((i) => i.image || i.cutout);
          const plain = s.items.filter((i) => !i.image && !i.cutout);
          return (
            <section key={s.id} id={`${s.slug}`} className="scroll-mt-4 bg-black/50 px-3.5 pt-8 pb-11 sm:px-7 sm:pt-12 print:bg-white print:py-4">
              <div className="mx-auto mb-5 flex max-w-[1100px] items-center gap-2.5">
                <AppIcon name={s.icon} size={28} className="text-accent-hi print:text-black" />
                <div>
                  <h2 className="text-[29px] leading-heading font-black text-white print:text-black">{s.nameAr}</h2>
                  <En className="block text-lg leading-ui font-black text-accent-hi print:text-black/70">{s.nameEn}</En>
                </div>
              </div>
              {withPhoto.length > 0 && (
                <div className={`mx-auto grid max-w-[1100px] gap-4 sm:grid-cols-2 ${withPhoto.length % 3 === 0 ? 'md:grid-cols-3' : ''} print:grid-cols-3`}>
                  {withPhoto.map((i) => (
                    <PhotoCard key={i.id} item={i} />
                  ))}
                </div>
              )}
              {plain.length > 0 && (
                <div className="mx-auto mt-4 max-w-[760px] overflow-hidden rounded-[18px] border border-line bg-[rgb(12_12_12/0.88)] print:border-black/20 print:bg-white">
                  {plain.map((i) => (
                    <ExtraRow key={i.id} item={i} />
                  ))}
                </div>
              )}
            </section>
          );
        })}

        <section className="bg-black/70 px-4 pt-12 pb-14 text-center print:break-inside-avoid print:bg-white">
          {missionLines.slice(0, -1).map((l) => (
            <p key={l} className="text-lg leading-heading font-black text-accent-hi print:text-black">
              {l}
            </p>
          ))}
          <h2 className="mt-1 mb-1.5 text-[40px] leading-heading font-black text-white print:text-black">{missionLines.at(-1)}</h2>
          <En className="block font-black text-[#eee] print:text-black">{settings.mission.titleEn}</En>
          <p className="mt-2 text-sm leading-ui text-[#bdb5ad] print:text-black/70">{settings.mission.bodyAr}</p>
          <En as="p" caps={false} className="mt-1 text-sm leading-ui text-[#bdb5ad] print:text-black/70">
            {settings.mission.bodyEn}
          </En>
        </section>
      </main>

      <footer className="flex flex-col items-center gap-1 border-t border-line bg-black/80 px-4 pt-7 pb-9 text-center print:break-inside-avoid print:bg-white">
        <strong className="text-[23px] leading-heading font-black text-accent-hi print:text-black">{settings.thanks.titleAr}</strong>
        <En className="text-[11px] leading-ui tracking-en-wide text-fg print:text-black">{settings.thanks.titleEn}</En>
        <small className="text-sm leading-ui text-[#a69f98] print:text-black/70">{settings.thanks.bodyAr}</small>
        <En as="small" caps={false} className="text-sm leading-ui text-[#a69f98] print:text-black/70">
          {settings.thanks.bodyEn}
        </En>
      </footer>
    </div>
  );
}
