import { ModalPresence } from '@/components/item/ModalPresence';

/** Public site: page content plus the @modal slot (intercepted item details). */
export default function SiteLayout({ children, modal }: LayoutProps<'/'>) {
  return (
    <>
      {children}
      <ModalPresence>{modal}</ModalPresence>
    </>
  );
}
