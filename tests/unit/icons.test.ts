import { describe, expect, it } from 'vitest';
import { ICON_KEYS, ICON_REGISTRY, resolveIconKey, strokeFor } from '@/components/icons/registry';

describe('icon registry', () => {
  it('has an entry with an Arabic label for every key', () => {
    for (const key of ICON_KEYS) {
      const entry = ICON_REGISTRY[key];
      expect(entry, key).toBeDefined();
      expect(entry.labelAr.length).toBeGreaterThan(0);
      if (entry.kind === 'lucide') expect(entry.Icon).toBeTruthy();
      else expect(entry.node.length).toBeGreaterThan(0);
    }
  });

  it('falls back to utensils for unknown keys', () => {
    expect(resolveIconKey('nope')).toBe('utensils');
    expect(resolveIconKey(undefined)).toBe('utensils');
    expect(resolveIconKey('fries')).toBe('fries');
  });

  it('follows the stroke rule', () => {
    expect(strokeFor(16)).toBe(2);
    expect(strokeFor(24)).toBe(1.75);
  });
});
