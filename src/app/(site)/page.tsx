import { UtensilsCrossed } from 'lucide-react';
import { BackToTop } from '@/components/menu/BackToTop';
import { INTRO_BOOT_SCRIPT } from '@/components/motion/intro/boot';
import { IntroOverlay } from '@/components/motion/intro/IntroOverlay';
import { Hero } from '@/components/menu/Hero';
import { MenuBrowser } from '@/components/menu/MenuBrowser';
import { Mission } from '@/components/menu/Mission';
import { SearchProvider } from '@/components/menu/search-context';
import { SiteFooter } from '@/components/menu/SiteFooter';
import { SiteHeader } from '@/components/menu/SiteHeader';
import { ar } from '@/i18n/ar';
import { DEFAULT_MARK, logoUrlOf } from '@/lib/brand';
import { getPublicMenu } from '@/server/repos/menu';

export default async function HomePage() {
  const menu = await getPublicMenu();
  const { settings, sections } = menu;
  const logoUrl = logoUrlOf(settings);
  const all = sections.flatMap((s) => s.items);
  const featured = all.find((i) => i.featured) ?? all[0] ?? null;

  return (
    <SearchProvider>
      {settings.introEnabled && (
        <>
          <IntroOverlay
            logoUrl={logoUrl}
            brandName={settings.brandName}
            taglineEn={settings.taglineEn}
            subtaglineAr={settings.subtaglineAr}
          />
          {/* Picks the intro mode before first paint (sha256 allow-listed in the CSP). */}
          <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT_SCRIPT }} />
        </>
      )}
      <SiteHeader logoUrl={logoUrl} brandName={settings.brandName} />
      <main id="main">
        <Hero settings={settings} logoUrl={logoUrl} featured={featured} />
        {sections.length > 0 ? (
          <MenuBrowser sections={sections} />
        ) : (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center text-muted">
            <UtensilsCrossed size={32} strokeWidth={1.75} aria-hidden="true" />
            <p className="text-base leading-ui font-semibold">{ar.menu.empty}</p>
          </div>
        )}
        <Mission mission={settings.mission} />
      </main>
      <SiteFooter settings={settings} markUrl={DEFAULT_MARK} />
      <BackToTop />
    </SearchProvider>
  );
}
