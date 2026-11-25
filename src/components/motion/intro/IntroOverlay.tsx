'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ar } from '@/i18n/ar';
import { INTRO_DURATION, INTRO_ID, type IntroMode } from './boot';
import { ParticleField } from './particles';
import './intro.css';

type IntroOverlayProps = {
  logoUrl: string;
  brandName: string;
  taglineEn: string;
  subtaglineAr: string;
};

const IMPACT_MS = 650;
const FLIGHT_MS = 1900;

/** Milliseconds since the overlay's CSS timeline started (its failsafe animation starts at first paint). */
function clockOf(el: HTMLElement): () => number {
  const anim = el.getAnimations().find((a) => a instanceof CSSAnimation);
  const start = performance.now() - (typeof anim?.currentTime === 'number' ? anim.currentTime : 0);
  return () => performance.now() - start;
}

/**
 * "THE SMASH" intro. Server-rendered as a static black layer with the logo; the inline boot script
 * picks the mode before first paint and CSS runs the timeline. This component adds the sparks,
 * the tap/key fast-forward (to the end in 250 ms) and the logo's flight to its hero position.
 */
export function IntroOverlay({ logoUrl, brandName, taglineEn, subtaglineAr }: IntroOverlayProps) {
  // On client-side navigations the SSR markup is absent: the intro never replays.
  const [gone, setGone] = useState(() => typeof document !== 'undefined' && !document.getElementById(INTRO_ID));
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = document.getElementById(INTRO_ID);
    if (!el) return;
    const mode = (el.dataset.mode as IntroMode | undefined) ?? 'full';
    const timers: number[] = [];
    let field: ParticleField | null = null;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      field?.stop();
      setGone(true);
    };

    if (mode === 'none') {
      finish();
      return;
    }

    const now = clockOf(el);
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, Math.max(0, ms - now())));

    if (mode === 'full' && canvasRef.current) {
      try {
        field = new ParticleField(canvasRef.current);
        field.start();
        at(IMPACT_MS, () => {
          const ball = el.querySelector('.lupo-intro__logo-box')?.getBoundingClientRect();
          if (ball && field) field.burst(ball.left + ball.width / 2, ball.top + ball.height / 2, 28);
        });
        at(1500, () => field && (field.embersOn = false));
      } catch {
        field = null;
      }

      // Logo flight: FLIP from the overlay logo to the hero logo (only when the hero is on screen).
      at(FLIGHT_MS, () => {
        const from = el.querySelector<HTMLElement>('.lupo-intro__logo-box');
        const hero = document.getElementById('hero-logo');
        if (!from || !hero) return;
        const a = from.getBoundingClientRect();
        const b = hero.getBoundingClientRect();
        if (b.bottom < 0 || b.top > window.innerHeight || b.width === 0) return;
        from.style.animation = 'none';
        from.animate(
          [
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            {
              transform: `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(${b.width / a.width})`,
              opacity: 1,
            },
          ],
          { duration: 480, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' },
        );
      });
    }

    at(INTRO_DURATION[mode] + 60, finish);

    // Tap, click or any key: fast-forward everything that remains into 250 ms.
    const skip = () => {
      const remaining = INTRO_DURATION[mode] - now();
      if (remaining <= 260) return;
      const rate = remaining / 250;
      const targets = [el, document.getElementById('hero-logo'), ...document.querySelectorAll<HTMLElement>('[data-stagger]')];
      for (const t of targets) t?.getAnimations({ subtree: t === el }).forEach((anim) => anim.updatePlaybackRate(rate));
      timers.forEach((t) => window.clearTimeout(t));
      field?.stop();
      timers.push(window.setTimeout(finish, 280));
    };
    window.addEventListener('pointerdown', skip, { once: true });
    window.addEventListener('keydown', skip, { once: true });
    const onResize = () => field?.resize();
    window.addEventListener('resize', onResize);

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('resize', onResize);
      field?.stop();
    };
  }, []);

  if (gone) return null;

  const words = taglineEn.split(/\s+/).filter(Boolean);
  const maskStyle = logoUrl.startsWith('/') ? ({ '--logo-mask': `url(${logoUrl})` } as CSSProperties) : undefined;

  return (
    <div id={INTRO_ID} className="lupo-intro" aria-hidden="true" suppressHydrationWarning>
      <div className="lupo-intro__bg" />
      <canvas ref={canvasRef} className="lupo-intro__canvas" />
      <div className="lupo-intro__stage">
        <div className="lupo-intro__logo-box">
          <div className="lupo-intro__flash" />
          <div className="lupo-intro__ring" />
          <div className="lupo-intro__drop">
            <svg className="lupo-intro__ball" viewBox="0 0 64 64" aria-hidden="true">
              <defs>
                <radialGradient id="lupo-patty" cx="38%" cy="32%" r="70%">
                  <stop offset="0%" stopColor="#FFC23D" />
                  <stop offset="28%" stopColor="#EF8715" />
                  <stop offset="62%" stopColor="#C15E11" />
                  <stop offset="100%" stopColor="#4A2108" />
                </radialGradient>
              </defs>
              <circle cx="32" cy="32" r="30" fill="url(#lupo-patty)" />
            </svg>
          </div>
          <div className="lupo-intro__logo-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element -- same vector as the hero (cached) */}
            <img className="lupo-intro__logo" src={logoUrl} alt={brandName} width={1376} height={404} fetchPriority="high" />
            {maskStyle && <span className="lupo-intro__sweep" style={maskStyle} />}
          </div>
        </div>
        <div className="lupo-intro__copy">
          {words.length > 0 && (
            <p className="lupo-intro__tagline" lang="en" dir="ltr">
              {words.map((w, i) => (
                <span key={`${w}-${i}`} className="lupo-intro__word" style={{ '--i': i } as CSSProperties}>
                  {w}
                </span>
              ))}
            </p>
          )}
          {subtaglineAr && <p className="lupo-intro__sub">{subtaglineAr}</p>}
        </div>
      </div>
      <span className="lupo-intro__hint">{ar.intro.skipHint}</span>
    </div>
  );
}
