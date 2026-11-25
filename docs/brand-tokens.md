# LUPO brand tokens

Source of truth for colors and brand assets. These were extracted on 2026-11-25 from the live site
(https://lupojo.netlify.app/, `styles.css`) and from pixel sampling of the original logo
(`scripts/brand/analyze-logo.ts`). They are implemented as Tailwind v4 `@theme` tokens in `src/app/globals.css`.

## Logo

- The logo reads **"Lupo"**, with **SMASH BURGERS** beneath it. It shows a wolf head in warm white with orange accents (eye, collar, crescent).
  There is no brand ambiguity. The original file name `dr_burger_logo.png` and the "DR." alt texts are leftovers and are not used anywhere in this project.
- The original is a 530x150 RGB PNG with **no alpha**, on a dark textured background (avg `#050504`).
- **Master: `public/brand/lupo-logo.svg`.** It's a two-layer potrace vector (warm white `#F6F1E9` + accent `#E36F12`),
  traced at 3x and about 36 KB. The trace came out clean, so the intro uses the real vector. No mask fallback is needed.
- Rasters are rendered from the SVG: `lupo-logo.png` / `.webp` (1600w), plus the wolf emblem `lupo-mark.svg` / `.png`
  (512²), which is used for icons, the favicon and the manifest. Regenerate them with `npx tsx scripts/brand/logo.ts`.

## Colors

| Token | Value | Origin | Use |
|---|---|---|---|
| `canvas` | `#0B0B0B` | live `--black` / theme-color | page background |
| `surface-1` | `#121212` | brief | cards, rails |
| `surface-2` | `#1A1A1A` | brief | raised surfaces, inputs |
| `surface-3` | `#242424` | derived | hover / pressed |
| `accent` | **`#E36F12`** | **logo core tone** (962 px with s > .75, v > .75); live CSS used `#E86F13` | brand accent, glow, active states, prices |
| `accent-hi` | `#EF8715` | logo highlight (hue 30–40°) | glow center, sparks, gradients |
| `accent-deep` | `#C15E11` | logo dominant average (hue 20–30°, 90.5% of chromatic px) | glow falloff, patty gradient |
| `gold` | `#FFC23D` | brief | active stars, flame badge |
| `text` | `#F6F1E9` | brief (live `#F4EFE8`) | primary text |
| `muted` | `#A8A29A` | brief (live `#C2BBB3`) | secondary text |
| `line` | `rgb(255 255 255 / .08)` | brief (live `.12`) | hairline borders |
| `glass` | `rgb(255 255 255 / .05)` + `blur(16px)` | brief | glass panels |

The logo is not monochrome, so the ember fallback (`#FF6A13`) is **not** used.

### Contrast (WCAG 2.x)

| Foreground | on `#0B0B0B` | on `#121212` | on `#1A1A1A` | on `#242424` |
|---|---|---|---|---|
| text `#F6F1E9` | 17.51 | 16.66 | 15.48 | 13.81 |
| muted `#A8A29A` | 7.78 | 7.40 | 6.88 | 6.14 |
| accent `#E36F12` | 6.14 | 5.84 | 5.43 | 4.84 |
| accent-hi `#EF8715` | 7.64 | 7.27 | 6.75 | 6.02 |
| gold `#FFC23D` | 12.22 | 11.63 | 10.80 | 9.64 |

All text pairs pass 4.5:1. **On accent fills, text is `#0B0B0B` (6.14:1).** Warm white on accent is only 2.85:1,
so it is never used for text, only for icons at ≥ 24px and decoration.

## Type

**Cairo only** (v2.009, SIL OFL 1.1). Two `next/font/local` instances:
`cairo` (400/600/700/900, preloaded) and `cairoThin` (200/300, not preloaded).
`--font-weight-medium` is remapped to 600 and `--font-weight-extrabold` to 900. Line-heights are: Arabic body 1.65,
UI 1.35, headings 1.25, display 1.1. Tracking is applied only to uppercase English (0.06–0.12em).

## Radii, spacing, effects

- Radii: cards 28px · chips 18px · pills fully rounded. Spacing uses an 8px grid.
- Accent radial glow (`accent-hi` center → `accent-deep` → transparent) that breathes behind food.
- Film grain is SVG noise at ~4% opacity.
- Deep drop-shadows sit under floating food, and on desktop a pointer spotlight follows card borders.

## Motion

| Token | Value |
|---|---|
| Ease | `cubic-bezier(0.16, 1, 0.3, 1)` (`--ease-lupo`) |
| Springs | UI `{ stiffness: 420, damping: 32 }` · soft `{ stiffness: 140, damping: 20 }` |
| Durations | 180 / 320 / 600 ms |
| Properties | transform and opacity only. The single exception is the sliding chip/rail pill, which also animates the width of one small out-of-flow element. |

**Intro "THE SMASH"** (`src/components/motion/intro/`) runs as a pure-CSS timeline that starts at first paint:
- The ball drops and squashes, with a 3px shake, a shockwave and 20–30 sparks.
- A circular mask reveals the logo (1.08 → 1), followed by a diagonal sweep.
- The tagline words stagger in, then the logo flies to the hero.

An inline boot script picks the mode before paint:
- **full**: first visit ever, about 2.4 s.
- **pulse**: later sessions, 500 ms.
- **reduced**: 200 ms fade.
- **none**: already seen this session.

Tap or any key fast-forwards the intro to its end in 250 ms. A CSS failsafe hides everything by 2.6 s.

**Card → detail** uses a shared-element flight: a FLIP "ghost" clone driven by the Web Animations API, so no container can clip it. It flies back into the card on close.

**Scroll** effects are CSS view timelines (no JS, never hidden without support):
- staggered card reveal
- title mask slide-up
- distribution bars
- hero-logo exit
- kinetic mission words

The giant outlined section words are a rAF marquee whose speed follows scroll velocity. Header docking is driven by one `--dock` CSS variable.

**Why so little JS:** the public first-load budget is ≤ 180 KB gzip. Motion's runtime (about 46 KB) is kept off the public critical path; `/` ships **165.6 KB** (`node scripts/perf/measure-js.mjs`). The `motion` library is reserved for the lazily loaded surfaces: the rating sheet and the admin.

## Live-site vs. Appendix A: differences found (live site wins)

1. **Mission title**: the live page renders "رغبتك." (small accent line) followed by "مهمتنا." (large heading).
   So `mission.titleAr` is stored as `"رغبتك.\nمهمتنا."`, and both lines are rendered.
2. **Big Fries** is named "BIG FRIES" in the heading, but the image alt says "Large Fries" (file `large_fries.jpg`).
   The name "Big Fries" / "بطاطا كبيرة" is kept.
3. **Small Fries and Big Fries use byte-identical photos** (`small_fries.jpg` = `large_fries.jpg`, same MD5).
   This is imported as-is. The owner should upload a distinct Big Fries photo from the dashboard.
4. **Hero order**: the live CSS has a client note ("Requested LUPO order: copy -> large logo -> category buttons").
   So the hero keeps the taglines **above** the large logo, followed by the section chips.
5. The original also used a wood-grain background photo (`wood_background.jpg`). The brief fixes the canvas at `#0B0B0B`;
   the warmth comes back through the accent glow and grain instead.
6. All names, prices, taglines and the thank-you text match Appendix A exactly.
