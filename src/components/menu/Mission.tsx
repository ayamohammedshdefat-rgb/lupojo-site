import type { CSSProperties } from 'react';
import { En } from '@/components/ui/En';
import type { BilingualBlock } from '@/types/menu';

/** Splits a line into words that scale in with the scroll (CSS view timeline, `.kinetic-word`). */
function Kinetic({ text, offset = 0 }: { text: string; offset?: number }) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => (
      <span key={`${w}-${i}`} className="kinetic-word" style={{ '--i': offset + i } as CSSProperties}>
        {w}{' '}
      </span>
    ));
}

/** "رغبتك. / مهمتنا." block. The first line is the small accent lead, the last line the big statement. */
export function Mission({ mission }: { mission: BilingualBlock }) {
  const lines = mission.titleAr
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const lead = lines.length > 1 ? lines.slice(0, -1) : [];
  const statement = lines.at(-1) ?? '';
  if (!statement && !mission.titleEn) return null;
  return (
    <section aria-label={mission.titleEn || statement} className="relative isolate overflow-hidden px-4 py-20 text-center lg:py-28">
      <div
        aria-hidden="true"
        className="glow-accent absolute inset-x-0 top-1/2 -z-10 mx-auto h-[420px] max-w-[640px] -translate-y-1/2 opacity-40 blur-3xl"
      />
      {lead.map((l) => (
        <p key={l} className="text-xl leading-heading font-black text-accent-hi sm:text-2xl">
          <Kinetic text={l} />
        </p>
      ))}
      <h2 className="mt-1 text-[56px] leading-display font-black text-fg sm:text-[80px]">
        <Kinetic text={statement} offset={1} />
      </h2>
      {mission.titleEn && (
        <En as="p" className="mt-4 text-sm leading-ui font-black tracking-en-wide text-fg/90 sm:text-base">
          {mission.titleEn}
        </En>
      )}
      {mission.bodyAr && <p className="mt-4 text-base leading-ar text-muted">{mission.bodyAr}</p>}
      {mission.bodyEn && (
        <En as="p" caps={false} className="font-cairo-light text-sm leading-ui text-muted">
          {mission.bodyEn}
        </En>
      )}
    </section>
  );
}
