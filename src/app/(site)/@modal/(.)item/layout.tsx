import { ItemModal } from '@/components/item/ItemModal';

/** The sheet/dialog shell opens instantly and persists while paging between items. */
export default function ItemModalLayout({ children }: { children: React.ReactNode }) {
  return <ItemModal>{children}</ItemModal>;
}
