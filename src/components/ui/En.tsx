import type { ComponentPropsWithoutRef, ElementType } from 'react';

type EnProps<T extends ElementType> = {
  as?: T;
  /** Uppercase + tracking (default). Set false for sentence-case English. */
  caps?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'lang' | 'dir'>;

/**
 * English text inside the RTL page. The text is isolated in `<bdi dir="ltr">` so punctuation stays put
 * ("SMASHING TASTE." not ".SMASHING TASTE") while the element itself keeps RTL alignment.
 */
export function En<T extends ElementType = 'span'>({ as, caps = true, className, children, ...rest }: EnProps<T>) {
  const Tag: ElementType = as ?? 'span';
  return (
    <Tag lang="en" className={[caps ? 'en-caps' : '', className].filter(Boolean).join(' ')} {...rest}>
      <bdi dir="ltr">{children}</bdi>
    </Tag>
  );
}
