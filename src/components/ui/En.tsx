import type { ComponentPropsWithoutRef, ElementType } from 'react';

type EnProps<T extends ElementType> = {
  as?: T;
  /** Uppercase + tracking (default). Set false for sentence-case English. */
  caps?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'lang' | 'dir'>;

/**
 * English text inside the RTL page. `dir="ltr"` keeps punctuation in place
 * ("SMASHING TASTE." instead of ".SMASHING TASTE"); `lang="en"` for a11y and the brand tests.
 */
export function En<T extends ElementType = 'span'>({ as, caps = true, className, ...rest }: EnProps<T>) {
  const Tag: ElementType = as ?? 'span';
  return <Tag lang="en" dir="ltr" className={[caps ? 'en-caps' : '', className].filter(Boolean).join(' ')} {...rest} />;
}
