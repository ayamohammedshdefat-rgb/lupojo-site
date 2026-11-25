/**
 * Intro mode decision, shared by the inline boot script (runs before first paint) and the client.
 *  - 'none'    already seen in this session (sessionStorage)
 *  - 'reduced' prefers-reduced-motion: 200 ms fade, no shake, no particles
 *  - 'pulse'   a later session (localStorage): 500 ms logo glow pulse
 *  - 'full'    first visit ever: "THE SMASH" (~2.4 s)
 */
export const INTRO_ID = 'lupo-intro';
export const SESSION_KEY = 'lupo:intro';
export const EVER_KEY = 'lupo:intro:ever';

export type IntroMode = 'full' | 'pulse' | 'reduced' | 'none';

export const INTRO_DURATION: Record<IntroMode, number> = { full: 2400, pulse: 600, reduced: 220, none: 0 };

/**
 * Inline script placed right after the overlay markup. It only sets `data-mode` on the overlay
 * (never removes React-owned nodes), so hydration stays intact. Its sha256 goes into the CSP.
 */
export const INTRO_BOOT_SCRIPT = `(function(){var e=document.getElementById('${INTRO_ID}');if(!e)return;var m='full';try{if(sessionStorage.getItem('${SESSION_KEY}'))m='none';else if(matchMedia('(prefers-reduced-motion: reduce)').matches)m='reduced';else if(localStorage.getItem('${EVER_KEY}'))m='pulse';sessionStorage.setItem('${SESSION_KEY}','seen');localStorage.setItem('${EVER_KEY}','1')}catch(x){}e.setAttribute('data-mode',m)})();`;
