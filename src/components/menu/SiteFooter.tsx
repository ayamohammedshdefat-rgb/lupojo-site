import Link from 'next/link';
import { AtSign, Clock, MapPin, MessageCircle, Phone, ScrollText } from 'lucide-react';
import type { ReactNode } from 'react';
import { En } from '@/components/ui/En';
import { ar } from '@/i18n/ar';
import type { SiteSettings } from '@/types/menu';

/** Splits the thank-you line so the word "بشغف" can flicker like a flame. */
function withPassion(text: string): ReactNode {
  const word = 'بشغف';
  const i = text.indexOf(word);
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <span className="lupo-flicker text-accent-hi">{word}</span>
      {text.slice(i + word.length)}
    </>
  );
}

export function SiteFooter({ settings, markUrl }: { settings: SiteSettings; markUrl: string }) {
  const { thanks, contact } = settings;
  const contacts = [
    contact.phone && { icon: <Phone size={16} strokeWidth={2} aria-hidden="true" />, label: contact.phone, href: `tel:${contact.phone.replace(/\s/g, '')}`, ltr: true },
    contact.whatsapp && {
      icon: <MessageCircle size={16} strokeWidth={2} aria-hidden="true" />,
      label: contact.whatsapp,
      href: `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`,
      ltr: true,
    },
    contact.instagram && {
      icon: <AtSign size={16} strokeWidth={2} aria-hidden="true" />,
      label: contact.instagram.replace(/^@/, ''),
      href: `https://instagram.com/${contact.instagram.replace(/^@/, '')}`,
      ltr: true,
    },
    contact.address && { icon: <MapPin size={16} strokeWidth={2} aria-hidden="true" />, label: contact.address },
    contact.hours && { icon: <Clock size={16} strokeWidth={2} aria-hidden="true" />, label: contact.hours },
  ].filter(Boolean) as { icon: ReactNode; label: string; href?: string; ltr?: boolean }[];

  return (
    <footer className="border-t border-line bg-surface-1/60">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-2 px-4 py-14 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- small vector emblem */}
        <img src={markUrl} alt="" width={64} height={64} className="mb-2 size-16 opacity-90" />
        {thanks.titleAr && <p className="text-[26px] leading-heading font-black text-accent-hi">{thanks.titleAr}</p>}
        {thanks.titleEn && <En className="text-xs leading-ui font-semibold tracking-en-wide text-fg">{thanks.titleEn}</En>}
        {thanks.bodyAr && <p className="mt-2 text-sm leading-ar text-muted">{withPassion(thanks.bodyAr)}</p>}
        {thanks.bodyEn && (
          <En as="p" caps={false} className="font-cairo-light text-sm leading-ui text-muted">
            {thanks.bodyEn}
          </En>
        )}

        {contacts.length > 0 && (
          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            {contacts.map((c) => (
              <li key={c.label}>
                {c.href ? (
                  <a href={c.href} className="glass inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm leading-ui text-fg hover:bg-white/10" rel="noopener noreferrer">
                    {c.icon}
                    <span dir={c.ltr ? 'ltr' : undefined}>{c.label}</span>
                  </a>
                ) : (
                  <span className="glass inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm leading-ui text-fg">
                    {c.icon}
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/classic"
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm leading-ui font-semibold text-muted transition-colors hover:text-fg"
        >
          <ScrollText size={18} strokeWidth={1.75} aria-hidden="true" />
          {ar.menu.classic}
        </Link>
      </div>
    </footer>
  );
}
