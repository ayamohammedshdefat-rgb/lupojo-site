import Image from 'next/image';
import { AppIcon } from '@/components/icons/AppIcon';
import { ICON_KEYS, ICON_REGISTRY } from '@/components/icons/registry';
import { En } from '@/components/ui/En';

/** Phase 1 placeholder: brand + design-system smoke test. Replaced by the Firestore menu in Phase 3. */
export default function Home() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-4 py-16">
      <Image src="/brand/lupo-logo.svg" alt="LUPO" width={1376} height={404} priority className="h-auto w-80" />
      <En as="p" className="text-center text-2xl font-black leading-display">
        Simple ingredients. Smashing taste.
      </En>
      <p className="text-center text-lg font-semibold text-muted">طازج، غني بالنكهة، ويُحضّر عند الطلب.</p>
      <ul className="grid grid-cols-4 gap-3 sm:grid-cols-5">
        {ICON_KEYS.map((key) => (
          <li key={key} className="glass flex flex-col items-center gap-2 rounded-chip p-4">
            <AppIcon name={key} size={28} className="text-fg" />
            <span className="text-xs font-semibold leading-ui text-muted">{ICON_REGISTRY[key].labelAr}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
