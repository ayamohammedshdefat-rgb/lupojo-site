import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isIconKey } from '@/components/icons/keys';

type Seed = {
  site: Record<string, unknown>;
  sections: { slug: string; icon: string; items: { slug: string; icon: string; prices: { amountFils: number }[] }[] }[];
};
const seed = JSON.parse(readFileSync('scripts/seed/lupo-menu.json', 'utf8')) as Seed;

describe('seed data', () => {
  it('uses only registry icon keys', () => {
    for (const s of seed.sections) {
      expect(isIconKey(s.icon), s.slug).toBe(true);
      for (const i of s.items) expect(isIconKey(i.icon), i.slug).toBe(true);
    }
  });

  it('keeps the original anchors and integer fils prices', () => {
    expect(seed.sections.map((s) => s.slug)).toEqual(['burgers', 'sides', 'extras']);
    for (const s of seed.sections)
      for (const i of s.items) {
        expect(i.prices.length).toBeGreaterThan(0);
        for (const p of i.prices) expect(Number.isInteger(p.amountFils)).toBe(true);
      }
  });

  it('has unique item slugs and no invented content', () => {
    const items = seed.sections.flatMap((s) => s.items);
    expect(new Set(items.map((i) => i.slug)).size).toBe(items.length);
    for (const i of items) {
      expect(i).not.toHaveProperty('descriptionAr');
      expect(i).not.toHaveProperty('ingredients');
      expect(i).not.toHaveProperty('calories');
    }
  });
});
