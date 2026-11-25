import { expect, test } from '@playwright/test';

const ROUTES = ['/', '/item/double-smash', '/item/matrix', '/classic'];
const ALLOWED_WEIGHTS = new Set(['200', '300', '400', '600', '700', '900']);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('lupo:intro', 'seen'));
});

for (const route of ROUTES) {
  test(`brand rules on ${route}: no emoji, Cairo only, allowed weights`, async ({ page }) => {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const report = await page.evaluate(() => {
      const emoji = /\p{Extended_Pictographic}/u;
      const offenders: string[] = [];
      const families = new Set<string>();
      const weights = new Set<string>();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      for (let el = walker.currentNode as Element | null; el; el = walker.nextNode() as Element | null) {
        if (el.closest('[data-customer-comment], script, style, noscript, nextjs-portal')) continue;
        const own = [...el.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent ?? '').join('');
        if (emoji.test(own)) offenders.push(own.trim().slice(0, 60));
        if (!own.trim()) continue;
        const cs = getComputedStyle(el);
        families.add(cs.fontFamily);
        weights.add(cs.fontWeight);
      }
      for (const attr of ['alt', 'aria-label', 'title', 'placeholder']) {
        document.querySelectorAll(`[${attr}]`).forEach((n) => {
          const v = n.getAttribute(attr) ?? '';
          if (emoji.test(v)) offenders.push(`${attr}: ${v}`);
        });
      }
      if (emoji.test(document.title)) offenders.push(`title: ${document.title}`);
      return { offenders, families: [...families], weights: [...weights] };
    });

    expect(report.offenders).toEqual([]);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, 'no horizontal scroll').toBeLessThanOrEqual(0);
    for (const family of report.families) {
      const names = family.split(',').map((f) => f.trim().replace(/^["']|["']$/g, ''));
      for (const n of names) expect(n.toLowerCase(), `font family "${family}"`).toMatch(/cairo/);
    }
    for (const w of report.weights) expect(ALLOWED_WEIGHTS.has(w), `weight ${w}`).toBe(true);
  });
}
