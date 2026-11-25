/**
 * Review screenshots at the two QA viewports (390x844 mobile, 1440x900 desktop):
 * intro (mid-reveal), hero, menu section, item modal, item page, classic, plus full-page home.
 * Usage: npx tsx scripts/reference/checkpoint.ts [baseURL=http://localhost:3100] [outDir=reference/checkpoint]
 */
import { mkdir } from 'node:fs/promises';
import { chromium, devices, type BrowserContextOptions, type Page } from '@playwright/test';

const base = process.argv[2] ?? 'http://localhost:3100';
const out = process.argv[3] ?? 'reference/checkpoint';

const VIEWPORTS: { name: string; ctx: BrowserContextOptions }[] = [
  {
    name: '390x844',
    ctx: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  },
  { name: '1440x900', ctx: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 } },
];

async function ready(page: Page, url: string, skipIntro = true) {
  if (skipIntro) await page.addInitScript(() => sessionStorage.setItem('lupo:intro', 'seen'));
  await page.goto(base + url, { waitUntil: 'networkidle' });
  await page.waitForSelector('html[data-hydrated]', { state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
}

async function main() {
  await mkdir(out, { recursive: true });
  const browser = await chromium.launch();
  for (const v of VIEWPORTS) {
    const shot = (page: Page, name: string, fullPage = false) =>
      page.screenshot({ path: `${out}/${name}-${v.name}.png`, fullPage });

    // Intro, mid-reveal (fresh context so it plays).
    {
      const ctx = await browser.newContext(v.ctx);
      const page = await ctx.newPage();
      await page.goto(base + '/', { waitUntil: 'commit' });
      await page.waitForSelector('#lupo-intro[data-mode="full"]');
      await page.waitForTimeout(1450);
      await shot(page, '01-intro');
      await ctx.close();
    }

    const ctx = await browser.newContext(v.ctx);
    const page = await ctx.newPage();
    await ready(page, '/');
    await page.waitForTimeout(400);
    await shot(page, '02-hero');

    await page.locator('#burgers').scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      const top = document.getElementById('burgers')!.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top - (window.innerWidth >= 1024 ? 88 : 128), behavior: 'instant' });
    });
    await page.waitForTimeout(900);
    await shot(page, '03-menu');

    await page.locator('[data-item-card="double-smash"]').click();
    await page.waitForSelector('[data-item-modal]:visible [data-item-name]');
    await page.waitForTimeout(900);
    await shot(page, '04-item-modal');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(300);
    await shot(page, '06-home-full', true);

    await ready(page, '/item/loaded-fries');
    await page.waitForTimeout(500);
    await shot(page, '05-item-page');

    await ready(page, '/classic');
    await page.waitForTimeout(400);
    await shot(page, '07-classic');
    await ctx.close();
    console.log('captured', v.name);
  }
  await browser.close();
}

void main();
