import type { Metadata } from 'next';
import { DroppedBurger } from '@/components/ui/DroppedBurger';
import { ar } from '@/i18n/ar';

export const metadata: Metadata = { title: 'LUPO | غير موجود', robots: { index: false } };

export default function NotFound() {
  return <DroppedBurger title={ar.errors.notFoundTitle} body={ar.errors.notFoundBody} />;
}
