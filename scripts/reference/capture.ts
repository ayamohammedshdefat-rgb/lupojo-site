/**
 * Full-page screenshots of a URL at the two QA viewports (390x844 mobile, 1440x900 desktop).
 * Usage: npx tsx scripts/reference/capture.ts <url> <outDir> [prefix] [--no-full]
 */
import { mkdir } from 'node:fs/promises';
import { chromium, devices } from '@playwright/test';

const [url, outDir, prefix = 'page'] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const fullPage = !process.argv.includes('--no-full');
if (!url || !outDir) throw new Error('usage: capture.ts <url> <outDir> [prefix]');

const viewports = [
  { name: 'mobile-390x844', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: devices['iPhone 13']!.userAgent },
  { name: 'desktop-1440x900', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
] as const;

async function main() {
  await mkdir(outDir!, { recursive: true });
  const browser = await chromium.launch();
  for (const v of viewports) {
    const { name, ...ctxOpts } = v;
    const ctx = await browser.newContext({ ...ctxOpts, reducedMotion: 'no-preference' });
    const page = await ctx.newPage();
    await page.goto(url!, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    const file = `${outDir}/${prefix}-${name}.png`;
    await page.screenshot({ path: file, fullPage });
    console.log('saved', file);
    await ctx.close();
  }
  await browser.close();
}

void main();
