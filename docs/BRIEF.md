# LUPO — Interactive Smash Menu · Build Brief for Claude Code

> **Your role:** lead full-stack engineer **and** motion designer on this project.
> **Mission:** turn LUPO's static, paper-like menu into a premium, Arabic-first (RTL) interactive menu with per-item ratings and moderated comments, plus a secure owner dashboard.
> **Quality bar:** it must feel like opening a top-tier food app, not reading a PDF. Every interaction should feel like a sizzle: fast, warm, satisfying.

---

## 0. How you work (read first)

> **Starter kit: already in this folder. Keep every file exactly where it is.**
> - `src/fonts/cairo/Cairo-{ExtraLight,Light,Regular,SemiBold,Bold,Black}.woff2` + `FONT-LICENSE.md`: the client's font, and the only font allowed.
> - `assets/fonts/cairo/*.ttf`: the same six weights as TTF, for `next/og`.
> - `src/components/icons/custom-icons.ts`: LUPO custom icons (`fries`, `sauceBottle`) as Lucide icon nodes. Source SVGs are in `assets/icons/custom/`.
> - `reference/inspiration/burger-app-ui.png` (design inspiration) and `reference/design/icon-set-preview.png` (the intended icon look).
> - This brief.
>
> `create-next-app` refuses non-empty folders, so scaffold in a temp folder and then merge into this one without deleting or moving these files.

1. **Start in plan mode.** Read this whole brief, inspect the live site (https://lupojo.netlify.app/), then write a short plan (file tree, phases, risks). Save this brief as `docs/BRIEF.md` and create `CLAUDE.md` (≤ 80 lines: stack, commands, conventions, and the guardrails in this section, including the font and no-emoji rules).
2. **Work phase by phase** (§14). After each phase: `npm run typecheck && npm run lint && npm test` (+ e2e when relevant), fix everything, commit (Conventional Commits), then give a 5-line summary.
3. **One planned stop:** after Phase 4 (home + item detail + intro working on seeded data), show me screenshots at 390×844 and 1440×900 plus `docs/brand-tokens.md`, and wait for my OK on the look. Otherwise keep going on your own.
4. **Ask me only for:** Firebase credentials, any action on the production Firebase project, or a real brand ambiguity (e.g. the logo doesn't say LUPO). Decide everything else from this brief.
5. **Your training data may be older than the installed versions.** Before using Next.js APIs (proxy, caching, intercepting routes, Server Actions, `next/font/local`), read the docs bundled with the installed version in `node_modules/next/dist/docs/`. Do the same for Tailwind v4, Motion and Firebase.
6. **Emulators by default.** All development and tests run on the Firebase Emulator Suite. Never write to production unless I explicitly say so.
7. **No secrets in git** (`.env*` except `.env.example`, service-account JSON). Strict TypeScript, no `any`, small typed components. Every server-only module starts with `import 'server-only'`.
8. **Visual QA loop:** after each UI phase, run the app, take Playwright screenshots (390×844, 1440×900), look at them critically, and polish until it looks premium. Compare with `reference/`.
9. You may use subagents for independent work (e.g. tests, rules), but one owner keeps the design system consistent.

---

## 1. Context

- **Client:** LUPO, a smash-burger and chicken place in Amman, Jordan. Current site: https://lupojo.netlify.app/. It's a static, dark (`#0b0b0b`), bilingual one-page menu (Arabic plus uppercase English) that reads like paper:
  - logo and taglines
  - 3 anchor-linked sections (`#burgers`, `#sides`, `#extras`), each headed by an emoji
  - item photos with "ساندويش / SANDWICH" and "وجبة / MEAL" price rows in JD
  - a mission block and a thank-you note
- **Goal:** keep that identity and make it fully interactive, with ratings and comments per item and an owner dashboard. **All content lives in Firestore.**
- **Design inspiration:** `reference/inspiration/burger-app-ui.png`. If it's missing, use this description:
  - dark charcoal app UI with very rounded, glassy cards and hairline borders
  - a soft colored radial glow behind content
  - category chips: rounded squares with a food visual and a label
  - a 2-column product grid where cut-out food floats above each card, with name, a short subtitle with a flame mark, a star row and the price
  - a detail screen with a huge floating burger, a glass "calories" badge overlapping it, and a bottom panel holding title, description, rating (4.5 stars with a count) and a **curved arc carousel** of related items
- **Design rule: evolve, don't replace.**
  - **Keep** LUPO's identity: dark `#0b0b0b` canvas, logo, bilingual Arabic + uppercase English headings, section anchors, Sandwich/Meal price pairs, mission and thank-you blocks, and the taglines.
  - **Borrow** the reference's app feel and interaction patterns, not its colors. The glow uses LUPO's accent, not green.
  - **Leave out** the cart, quantity stepper and delivery time (see §16).
  - **Client rules (non-negotiable):**
    - The only font is **Cairo** (the provided files, §4).
    - There is **no emoji anywhere**. The original section emojis, and every other emoji, become icons (§4.1).

---

## 2. Stack & architecture (final decisions)

| Area | Decision |
|---|---|
| Framework | **Next.js 16.x**, latest patched release (App Router, `src/`, Turbopack), React 19, TypeScript strict. Check nextjs.org/blog for the latest security release before installing. `npm audit` must show no high or critical issues. |
| "Node.js" | Node 24 LTS (Next 16 requires ≥ 20.9). The backend is Next.js on Node: **Server Actions + Route Handlers using `firebase-admin`**. No separate Express server. Scripts run with `tsx`. |
| Styling | **Tailwind CSS v4** with CSS-first `@theme` tokens in `globals.css`. Use logical utilities only (`ms-/me-/ps-/pe-/start-/end-`) so RTL works. |
| Fonts | **Cairo only**: the client's six weights, loaded through `next/font/local` from `src/fonts/cairo/` (§4). |
| Icons | `lucide-react`, the same set shadcn/ui uses, so the site and dashboard share one visual language. Plus `@lucide/lab` and the LUPO custom icons in `src/components/icons/custom-icons.ts`. **No emoji anywhere** (§4.1). |
| Motion | `motion` (import from `motion/react`) with `<MotionConfig reducedMotion="user">` and `LazyMotion` where it pays off. Particles use a small custom `<canvas>`. **No GSAP, no three.js, no Lenis.** |
| Backend | **Firestore**, **Firebase Auth** (email/password + custom claims), **Cloud Storage** for images. |
| Public reads | Server Components read through the Admin SDK inside `'use cache'` functions tagged with `cacheTag` (enable `cacheComponents`). Mutations invalidate with `updateTag` (Server Actions) or `revalidateTag(tag, 'max')` (Route Handlers). Owner edits must show on the public menu within seconds. Convert Firestore Timestamps to ISO strings at the repo boundary. |
| Writes | **Server-only.** Firestore and Storage rules deny all client writes. Every mutation goes Server Action/Route Handler → auth and role check → zod validation → Admin SDK. |
| Firebase client SDK | Loaded **only** under `/admin` (auth + live listeners), never on public pages. |
| Forms | react-hook-form + zod v4 with **shared schemas** on client and server. |
| Phone | `libphonenumber-js` (max metadata), default region `JO`, stored as E.164. |
| Admin UI | shadcn/ui (Tailwind v4, lucide icons), TanStack Table, dnd-kit (reorder), Recharts. |
| Anti-spam | Honeypot field, server rate limits (Firestore counters), and Cloudflare Turnstile (switches on automatically when its keys exist). |
| Tests | Vitest (unit), `@firebase/rules-unit-testing` (rules), Playwright (e2e, mobile and desktop projects) against emulators via `firebase emulators:exec`. |
| Deploy | **Vercel**, with Firebase as the backend. Firestore location `eur3` and Vercel function region `fra1`. Keep the code platform-agnostic. |

---

## 3. Phase 0: archive the original and extract the brand

1. **Archive the original as a visual reference:**
   - Take Playwright full-page screenshots at 390×844 and 1440×900 → `reference/original/screenshots/`.
   - Save the HTML and all assets (logo `assets/dr_burger_logo.png` and item photos) → `reference/original/site/`.
2. Check every text and price against **Appendix A**. The live site wins any conflict; report the differences.
3. **Check the logo.**
   - Confirm it reads **LUPO**. The file name `dr_burger…` and the "DR." image alt texts are leftovers. If the logo shows another brand, stop and ask me.
   - Vectorize it to SVG (`potrace` or a manual trace) for the intro. If the trace looks poor, keep a high-res PNG/WebP and build the intro with masks.
4. **Extract brand tokens:**
   - colors computed from the live CSS (the font is already decided: Cairo, §4)
   - the logo's dominant non-neutral color(s), by sampling pixels
   
   Write them to `docs/brand-tokens.md`. **Accent = the logo's dominant brand color.**
5. Our project must use clean naming: LUPO alt texts and file names, no "DR." anywhere.

---

## 4. Visual design system

- **Canvas and surfaces:**
  - Canvas `#0b0b0b` (from the current site). Surfaces `#121212` and `#1a1a1a`.
  - Glass = `rgb(255 255 255 / .05)` + `backdrop-blur(16px)` + a 1px border `rgb(255 255 255 / .08)` + a subtle top inner highlight.
- **Colors:**
  - Accent comes from the logo (Phase 0). Only if the logo is monochrome, fall back to ember `#FF6A13`.
  - Stars/gold `#FFC23D`. Text `#F6F1E9`, muted `#A8A29A`. All text must reach at least 4.5:1 contrast.
- **Signature effects:**
  - an accent radial glow behind food that slowly "breathes"
  - global film grain (SVG noise, ~4%, `pointer-events:none`)
  - deep drop-shadows under floating food
  - a pointer-following spotlight on card borders (desktop only)
- **Radii and spacing:** cards 28px, chips 18px, pills fully rounded. Generous spacing on an 8px grid.
- **Type: Cairo only.** The client chose Cairo (v2.009, SIL OFL 1.1). Arabic and English both use it, since its Latin is built in. No other font family anywhere, the admin included.
  - **Loading:** from `src/fonts/cairo/` with `next/font/local`, as two instances so only the core weights are preloaded:
    - `cairo`: weights 400, 600, 700, 900; `preload: true`; `variable: '--font-cairo'`. This is the default sans font for the whole app.
    - `cairoThin`: weights 200, 300; `preload: false`; `variable: '--font-cairo-thin'`. Use it only through `font-cairo-light` and `font-cairo-extralight` utilities.
  - **Weights:** only these six exist. Never use 500 or 800. In `@theme`, remap `--font-weight-medium: 600` and `--font-weight-extrabold: 900` so stray classes can't trigger fallback or faux bold.

    | Weight | Use |
    |---|---|
    | 900 Black | intro and hero taglines, section titles, the giant outlined English marquee words |
    | 700 Bold | item names, headings, prices |
    | 600 SemiBold | buttons, chips, labels, price pills, table headers |
    | 400 Regular | body text, descriptions, comments, form inputs |
    | 300 Light | secondary meta: English sublabels, timestamps, counts |
    | 200 ExtraLight | oversized numerals only (≥ 40px), e.g. the big average rating in the detail view |

  - **Vertical metrics:** Cairo v2 is tall and asymmetric (ascent 1303 / descent 571 per 1000 UPM), so `line-height: normal` ≈ 1.87 and glyphs sit low.
    - Always set explicit line-heights: Arabic body 1.65, UI controls 1.35, headings 1.25, display 1.1.
    - Make sure dots and tashkeel never clip.
    - On zoomed screenshots, check that Arabic labels are optically centered in buttons, chips and pills. If they sit low, tune `ascent-override` / `descent-override` via the `next/font/local` `declarations` option (Arabic first), then re-check the English uppercase labels.
  - **Spacing and markup:** never letter-space Arabic. Tracking (0.06–0.12em) goes only on uppercase English, uppercased with CSS. Wrap English in `lang="en"` spans.
  - **Missing glyphs:** Cairo has **no glyphs for ★ ☆ → ← ↓ ✓ ✕**. Never type these characters in the UI; use icons (§4.1).
  - **OG image:** `next/og` (Satori) can't read WOFF2 and doesn't shape Arabic reliably. The OG image loads the TTFs from `assets/fonts/cairo/` and uses Latin text plus the logo only.
  - **License:** keep `FONT-LICENSE.md` and add the full OFL 1.1 text as `src/fonts/cairo/OFL.txt`.
- **Numbers:** Western digits everywhere, as on the current site, using the `ar-u-nu-latn` locale with `Intl`. Cairo's digits are already equal-width, so count-up animations don't jitter. Prices render as `2.75 JD`, wrapped in `dir="ltr"`.
- **Items without photos** (drinks/extras) get an icon tile: their icon (§4.1) in warm white over the accent glow on a glass tile. Never show a broken image.
- **Photo vs. cutout:** each item can have an optional transparent `cutout` image.
  - With a cutout: render it floating, reference-style.
  - With a photo only: show a rounded, masked image with a vignette.
  - Both must look intentional.

### 4.1 Icons: no emoji anywhere

- **Icon set:**
  - `lucide-react` + `@lucide/lab` + the LUPO custom icons in `src/components/icons/custom-icons.ts` (`fries`, `sauceBottle`, drawn on Lucide's 24px grid).
  - Lab and custom icons render through lucide-react's `<Icon iconNode={…} />`.
  - `reference/design/icon-set-preview.png` shows the intended look.
- **Style:**
  - `strokeWidth={1.75}` everywhere (2 at ≤ 16px); color via `currentColor`.
  - Active rating stars and the flame badge use the filled form (`fill="currentColor"`) in gold `#FFC23D`. Inactive stars are outlined and muted.
  - Icon tiles (section chips, items without photos, empty states) show a warm-white icon over a soft accent radial glow inside a glass tile.
- **Registry:**
  - `src/components/icons/registry.tsx` maps an `IconKey` to its component plus an Arabic label for the owner's icon picker.
  - Firestore stores **only the key** (e.g. `icon: 'hamburger'`). Unknown keys fall back to `utensils`.
  - Every key below is verified to exist in lucide-react 1.80 / @lucide/lab 0.17:

  | Key | Source | Arabic label |
  |---|---|---|
  | `hamburger` | lucide `Hamburger` | برجر |
  | `drumstick` | lucide `Drumstick` | دجاج |
  | `beef` | lucide `Beef` | لحم |
  | `sandwich` | lucide `Sandwich` | ساندويش |
  | `fries` | custom `fries` | بطاطا |
  | `cup-soda` | lucide `CupSoda` | مشروب |
  | `can-soda` | lucide `CanSoda` | مشروب غازي |
  | `glass-water` | lucide `GlassWater` | ماء |
  | `coffee` | lucide `Coffee` | قهوة |
  | `sauce-bottle` | custom `sauceBottle` | صوص |
  | `pepper-chilli` | @lucide/lab `pepperChilli` | حار |
  | `salad` | lucide `Salad` | سلطة |
  | `soup` | lucide `Soup` | شوربة |
  | `pizza` | lucide `Pizza` | بيتزا |
  | `popcorn` | lucide `Popcorn` | تسالي |
  | `ice-cream-cone` | lucide `IceCreamCone` | آيس كريم |
  | `cookie` | lucide `Cookie` | حلويات |
  | `chef-hat` | lucide `ChefHat` | طبق الشيف |
  | `flame` | lucide `Flame` | مميز |
  | `utensils` | lucide `Utensils` | عام (fallback) |

- **LUPO mapping:**
  - Sections: burgers → `hamburger`, sides → `fries`, extras → `cup-soda`.
  - Items: Single/Double Smash → `hamburger`; Nashville/Crispy Chicken → `drumstick`; Loaded/Small/Big Fries → `fries`; Matrix → `can-soda`; Sauce → `sauce-bottle`; Jalapeño → `pepper-chilli`.
- **Badges:** new → `Sparkles`, bestseller → `Flame`, spicy → `pepper-chilli`, computed "الأعلى تقييمًا" → `Award`.
- **UI glyphs are icons too:**
  - Stars (`Star`), arrows and chevrons, check, close, search, share (`Share2`), back to top (`ArrowUp`), the scroll cue (`ChevronDown`), toast status icons, and admin affordances (`GripVertical`, `EyeOff`, `QrCode`).
  - Directional icons (chevrons, arrows, back/next) mirror in RTL. Object icons (burger, star) never mirror.
- **No emoji anywhere:**
  - Covers UI copy, seed data, toasts, empty states, error pages and metadata.
  - Covers owner-managed Firestore content: admin forms reject emoji with the hint "استخدم أيقونة من القائمة بدل الإيموجي".
  - Only customer comments are shown exactly as written.

---

## 5. Motion spec

### 5.1 Intro: "THE SMASH" (≈ 2.4 s, once per session)

| Time | Beat |
|---|---|
| 0–150 ms | Black canvas, grain, a few embers drifting up. |
| 150–650 ms | A glowing patty-ball (SVG, radial gradient from brown to ember) drops with gravity easing and stretches as it falls. |
| **650 ms: IMPACT** | It squashes into a wide disc (the *smash*). The screen shakes 3px for 120 ms, a shockwave ring expands, and 20–30 sizzle sparks burst out with gravity. |
| 800–1300 ms | The disc turns into a circular light mask that expands to reveal the **LUPO logo** (overshoot 1.08 → 1), then a diagonal light sweep crosses the logo. |
| 1300–1900 ms | "SIMPLE INGREDIENTS. SMASHING TASTE." (Cairo Black) staggers in word by word, and "طازج، غني بالنكهة، ويُحضّر عند الطلب." (Cairo SemiBold) fades up beneath it. |
| 1900–2400 ms | The logo flies (shared `layoutId`) to its hero position. The overlay dissolves (opacity + blur) and the menu staggers in. |

**Rules**
- **Skipping:** tap, click or any key fast-forwards to the end in 250 ms (show an "اضغط للتخطي" hint).
- **Frequency:** the full intro plays on the first visit per session (`sessionStorage`). Later sessions get a 500 ms logo glow pulse. The owner can turn the intro off in Settings.
- **Reduced motion:** `prefers-reduced-motion` gets a 200 ms fade with no shake and no particles.
- **No flash of content:**
  - The overlay is server-rendered as a static black layer with the logo.
  - A tiny inline boot script removes it before first paint when the intro shouldn't play.
  - A CSS keyframe hides it by 2.6 s even if JS fails.
  - The menu HTML always renders underneath, so SEO is unaffected.
  - The overlay also hides the Cairo font swap on first load.

### 5.2 Page and scroll
- **Hero:**
  - the big logo (landed from the intro) and the taglines
  - the featured item floating in its glow, with an idle float (±6px, 6 s) and a subtle pointer tilt (desktop)
  - ember particles, paused when off-screen or when the tab is hidden
  - a scroll cue: "تصفّح المنيو" with a gently bouncing `ChevronDown` icon
- **Header:** on scroll, the hero logo docks into a compact sticky header (scroll-linked scale and position).
- **Section headers:**
  - The section icon and Arabic title reveal with a mask slide-up.
  - Behind them, a giant outlined English word (BURGERS / SIDES / DRINKS & EXTRAS, in Cairo Black) runs as a marquee whose speed follows scroll velocity.
- **Cards:** staggered fade-up on enter (once). On hover or press, the image lifts and tilts, the glow intensifies, and the card scales to .97.
- **Mission and closing:** the mission block uses kinetic typography, with words scaling in as you scroll. The closing note gets a subtle flame flicker on the word "بشغف".

### 5.3 Transitions and micro-interactions
- **Card → detail:**
  - A shared-element transition (image + title via `layoutId`) carries the card into the modal or sheet, and reverses on close.
  - Wrap the `@modal` slot in a client `AnimatePresence` keyed by pathname so exit animations play.
  - Lock scroll while the modal is open and restore the scroll position on close.
- **Category chips:** the active pill slides between chips (`layoutId`), and the active chip auto-scrolls into view.
- **Stars (`Star` icons):**
  - Hover or drag previews the fill. In RTL, **star 1 is on the right**.
  - Selecting a star gives a spring pop.
  - The label morphs between: سيئ / مقبول / جيد / جيد جدًا / ممتاز!
- **Submit success:** the stars burst into sparks, a checkmark draws itself, then a toast appears.
- **Loading and numbers:** rating numbers count up when they come into view, distribution bars grow into view, and loading states use a skeleton shimmer.
- **Motion tokens:**
  - ease `[0.16, 1, 0.3, 1]`
  - UI spring `{ stiffness: 420, damping: 32 }`, soft spring `{ stiffness: 140, damping: 20 }`
  - durations 180 / 320 / 600 ms
  - animate transform and opacity only
- **Branded error pages:** the 404 and error pages get a playful "dropped burger" moment (the `Hamburger` icon tumbling).

---

## 6. Customer experience (public)

### 6.1 Routes
- `/` is the menu. Section anchors keep the original ids `#burgers`, `#sides`, `#extras`, so old links and QR codes keep working.
- `/item/[slug]` is the full-page item detail, for deep links, SEO and sharing.
- `@modal/(.)item/[slug]` is an intercepted route that opens the same detail as a modal from the menu.
  - Up to 768px wide it's a bottom sheet with drag-to-dismiss; from 768px up it's a centered dialog.
  - Back button, Esc or a backdrop click closes it.
- `/classic` renders the original paper-style layout from **live DB data**, is print-friendly (A4), and is linked in the footer as "المنيو الكلاسيكي". This is the living copy of the original design, with icons in place of the old emojis.

### 6.2 Navigation
- **Mobile:**
  - a compact sticky header (logo + search)
  - sticky, horizontally scrollable section chips (icon + Arabic + small English) with scroll-spy
  - a 2-column card grid and a floating "back to top" button (`ArrowUp`)
  - in the item detail, swipe to the next or previous item in the same section (RTL-aware)
- **Desktop (≥ 1024px):**
  - a sticky side rail (on the start side) listing sections with icons and item counts
  - a 3–4 column grid and ⌘/Ctrl+K search
  - in the item detail, the Left/Right keys move to the previous/next item (RTL-aware) and Esc closes
- **Search:** instant and client-side, over the visible items already rendered.
  - Normalize Arabic: strip tashkeel; map أ/إ/آ to ا, ة to ه, ى to ي; convert Arabic-Indic digits to Western.
  - Match Arabic and English names, tagline and ingredients.
  - Empty state: "لا توجد نتائج مطابقة."

### 6.3 Item card
Each card shows:
- **Image:** a cutout floating over the top edge, a photo, or an icon tile.
- **Names and tagline:** the Arabic name, the English name in small uppercase, and the optional tagline.
- **Rating chip:** a gold `Star` icon + `4.6 · 23`, or "جديد" with a `Sparkles` icon when the item has no ratings.
- **Price:** single, or both variants, e.g. `2.75 / 3.50 JD`.
- **Badges:** icon + label (§4.1), plus the computed "الأعلى تقييمًا" when avg ≥ 4.5 and count ≥ 10.

If the item is unavailable, the card turns grayscale with a "غير متوفر حاليًا" badge and **stays clickable**.

Every card is a real link (`<a href="/item/slug">`), so it works without JS.

### 6.4 Item detail (modal and page)
- **Hero:**
  - the image (or the item's icon tile) with the accent glow
  - a glass calories badge with a `Flame` icon if `calories` is set
  - an availability badge
- **Names and text:**
  - the Arabic name (large), the English name, and the tagline
  - description and ingredient chips **only if they exist**: no placeholders, no invented content
- **Prices:** variants shown as pills, e.g. `ساندويش 2.75 JD` · `وجبة 3.50 JD`. These are informational; there's no ordering.
- **Rating summary:**
  - the average to 1 decimal (Cairo ExtraLight at display size), `Star` icons, and the count
  - the count uses the correct Arabic plural via `Intl.PluralRules('ar')`: "لا توجد تقييمات" / "تقييم واحد" / "تقييمان" / "n تقييمات" (3–10) / "n تقييمًا" (11–99) / "n تقييم" (100+), with Western digits
  - 5-to-1 distribution bars with counts
- **"آراء الزبائن":**
  - approved comments only, newest first, 5 per page with "عرض المزيد"
  - each shows a masked name ("أحمد ع."), stars, relative time (`Intl.RelativeTimeFormat('ar-u-nu-latn')`) and the text, always as plain text, never HTML
- **Rate button:** "قيّم هذا الصنف" opens the rating sheet. For unavailable items it's disabled, with an explanation.
- **"قد يعجبك أيضًا":** a curved arc carousel (from the reference) of other visible items. Drag rotates it; a tap opens the item with a shared transition.
- **Share button:** `Share2` icon, using the Web Share API with a copy-link fallback.
- **Empty state:** "لا توجد تقييمات بعد — كن أول من يقيّم!"

### 6.5 Rating flow: per item only, never a restaurant-wide rating
Sheet title: "كيف كانت تجربتك مع {name}؟"

| Field | Rules |
|---|---|
| Stars | Required; integer 1–5. |
| الاسم | Required; 2–40 chars; letters only (`\p{L}\p{M}`) plus spaces, `'`, `-` and `.`; trimmed. |
| رقم الهاتف | Required. Normalize Arabic-Indic/Persian digits and spaces, then validate with libphonenumber-js (region JO; international numbers accepted) and store as E.164. Use `dir="ltr"`, `inputMode="tel"`, `autoComplete="tel"`, placeholder `07X XXX XXXX`. |
| التعليق (اختياري) | Optional; ≤ 500 chars; plain text; live counter; **no links**. Placeholder "احكِ لنا عن تجربتك…" |
| honeypot | Hidden field that must stay empty. |

- Under the phone field: "لن يظهر رقمك للعامة، ويُستخدم فقط للتواصل بخصوص تقييمك."
- Validate on the client (inline Arabic errors) **and** on the server, using the same zod schema.

**Server: `submitReview` Server Action**
1. Validation, in this order:
   - zod parse, then the honeypot check, then Turnstile (if enabled)
   - rate limits: per IP-hash 60/hour (restaurant Wi-Fi is shared, so keep it generous) and per phone-hash 30/day
2. Load the item. It must exist, be visible, sit in a visible section, and be available. Otherwise reject (404 / 409).
3. Review id = `HMAC_SHA256(REVIEW_HASH_SECRET, itemId + ":" + phoneE164)`. That gives **one review per phone per item**; submitting again updates the previous review.
4. In **one Firestore transaction**:
   - upsert `reviews/{id}` and `reviewContacts/{id}`
   - adjust `itemStats/{itemId}`: count, sum and distribution; on an update, remove the old rating and add the new one
5. Comment status:
   - With a comment: `commentStatus = 'pending'`, or `'approved'` if the owner enabled auto-approve.
   - Without one: `'none'`.
   - Stars count toward the stats immediately; comment text goes public **only after approval**.
6. Call `updateTag` for the item and menu tags, then return a typed result. On the client, update the summary numbers optimistically.

**Messages** (no emoji in any message; the success state shows the animated sparks and a `Flame` icon)
- Success with comment: "شكرًا لك! وصلنا تقييمك، وسيظهر تعليقك بعد مراجعة المطعم وموافقته."
- Success without comment: "شكرًا لك! أُضيف تقييمك إلى تقييم الصنف."
- Updated review: "حدّثنا تقييمك السابق لهذا الصنف."
- Errors:
  - "اختر عدد النجوم أولًا."
  - "يرجى إدخال اسم صحيح (حرفان على الأقل)."
  - "يرجى إدخال رقم هاتف صحيح، مثل 0791234567."
  - "التعليق طويل جدًا (500 حرف كحد أقصى)."
  - "الروابط غير مسموحة في التعليق."
  - "هذا الصنف غير متوفر حاليًا، لا يمكن تقييمه الآن."
  - "أرسلت تقييمات كثيرة خلال وقت قصير، حاول لاحقًا."
  - "حدث خطأ غير متوقع، حاول مرة أخرى."

### 6.6 Visibility and availability
- **`visibility: 'hidden'`** (on the item or its section) means the item is never exposed:
  - not rendered, and not in search, `/classic`, the sitemap, JSON-LD or the related carousel
  - `/item/[slug]` returns 404, and the review action rejects it
- **`availability: 'unavailable'`** means the item stays visible with a clear state:
  - a badge with a `Clock` icon, grayscale, and an optional owner note (e.g. "يعود قريبًا")
  - the detail still opens and existing approved comments still show
  - rating is disabled in the UI **and** rejected by the server
  - if ordering is ever added, it must respect the same flag

---

## 7. Data model (Firestore)

```ts
// settings/site: all brand content comes from here (no hard-coded copy in components)
{ brandName: 'LUPO', logo: ImageRef, metaTitle, metaDescription, themeColor,
  taglineEn, subtaglineAr, subtaglineEn,
  mission: { titleAr, titleEn, bodyAr, bodyEn },
  thanks:  { titleAr, titleEn, bodyAr, bodyEn },
  contact?: { phone?, whatsapp?, instagram?, address?, hours? },
  introEnabled: boolean, reviews: { autoApproveComments: boolean },
  updatedAt, updatedBy }

// sections/{id}
{ slug /* = anchor id */, nameAr, nameEn, icon /* IconKey, §4.1 */, order,
  visibility: 'visible' | 'hidden', createdAt, updatedAt }

// items/{id}
{ slug, sectionId, nameAr, nameEn, taglineAr?, taglineEn?, descriptionAr?, descriptionEn?,
  ingredients?: string[],
  prices: { labelAr?: string; labelEn?: string; amountFils: number }[],   // at least 1
  calories?: number, badges?: ('new' | 'bestseller' | 'spicy')[], icon /* IconKey, §4.1 */,
  image?: ImageRef, cutout?: ImageRef, featured?: boolean,
  visibility: 'visible' | 'hidden', availability: 'available' | 'unavailable', unavailableNote?: string,
  order, createdAt, updatedAt, updatedBy }
// ImageRef = { url, path, width, height, blurDataURL, alt }

// itemStats/{itemId}: written only by server transactions
{ count, sum, dist: { '1': n, '2': n, '3': n, '4': n, '5': n }, approvedComments, lastReviewAt }

// reviews/{hmacId}: public-safe fields only, NO phone
{ itemId, rating, comment?, displayName /* masked, e.g. "أحمد ع." */,
  commentStatus: 'none' | 'pending' | 'approved' | 'hidden',
  createdAt, updatedAt, moderatedBy?, moderatedAt? }

// reviewContacts/{hmacId}: owner-only personal data
{ fullName, phoneE164, createdAt }

// rateLimits/{key}: server-only
// auditLog/{id}: { actorUid, actorEmail, action, target, diff?, at }
```
- **Money** is stored as integer fils (1 JD = 1000 fils) and displayed as `2.75 JD` (2–3 decimals as needed).
- **Icons** are stored as `IconKey` strings validated against the §4.1 registry with zod. Never store emoji or raw SVG.
- **Indexes** (`firestore.indexes.json`):
  - reviews `(itemId, commentStatus, createdAt desc)`
  - reviews `(itemId, createdAt desc)`
  - reviews `(commentStatus, createdAt desc)`
  - reviews `(rating, createdAt desc)`
  - items `(sectionId, order)`
- **Filtering reviews by section** uses `itemId in [the section's items]` (≤ 30 values). Don't denormalize `sectionId` onto reviews.

---

## 8. Security

- **Firestore rules:**
  - Default deny, and **no client writes anywhere**.
  - Staff (`role in ['owner','staff']`) may read `sections`, `items`, `itemStats`, `reviews` and `settings` (for live dashboard listeners).
  - Only `owner` may read `reviewContacts` and `auditLog`.
  - The public never reads Firestore directly.
- **Storage rules:** public read for `public/**`; all writes denied, since uploads go through the server.
- **Auth:** Firebase email/password, with roles as custom claims `role: 'owner' | 'staff'`. Disable self sign-up in Auth settings if that option exists; either way, a user without a role is denied everywhere.
- **Login flow:**
  1. The client signs in and POSTs the ID token to `/api/auth/session`, protected by an Origin check and a CSRF double-submit token.
  2. The server verifies the token and requires a recent `auth_time` (≤ 5 min) and a role.
  3. The server calls `createSessionCookie` (5 days) and sets a `__session` cookie (httpOnly, secure, sameSite=strict, path=/).
  4. Logout clears the cookie and the client session and revokes refresh tokens.
- **`proxy.ts`** (Next 16's name for middleware) does an optimistic redirect for `/admin/**` (except login) when there's no cookie, and sets security headers. **Never rely on it alone:** call `requireStaff()` / `requireOwner()` (`verifySessionCookie` with `checkRevoked: true` plus a claim check) in the admin layout **and** inside every admin Server Action and Route Handler.
- **Permissions:**

  | Action | owner | staff |
  |---|---|---|
  | Toggle availability, moderate comments (approve / hide) | yes | yes |
  | Create/edit items & sections, images, reorder | yes | yes |
  | Delete items / sections / reviews | yes | no |
  | See phone numbers, export CSV | yes | no |
  | Team, settings, audit log | yes | no |

- **Headers:** HSTS, nosniff, `Referrer-Policy: strict-origin-when-cross-origin`, Permissions-Policy, and `frame-ancestors 'none'`.
  - `/admin/**` gets a nonce-based CSP.
  - If you add a CSP to public pages, allow the intro boot script by its sha256 hash.
- **Privacy:** hash IPs and phones with `REVIEW_HASH_SECRET` for rate-limit keys, and never log raw phone numbers.
- **Audit log:** write an `auditLog` entry for **every** admin mutation.
- **Uploads:**
  - Compress on the client to ≤ 4 MB (Vercel's request limit is 4.5 MB).
  - On the server, check the MIME type by magic bytes and re-encode with `sharp`, which also strips EXIF.

---

## 9. Owner dashboard (`/admin`, Arabic RTL, mobile-first)

The owner will mostly manage from a phone.
- **Navigation:** a bottom tab bar on mobile (الرئيسية · الأصناف · التقييمات · المزيد) and a side nav on desktop, with icons.
- **Look:** the same dark brand and the same Cairo + lucide system, more utilitarian.
- **Feedback:** a toast on every action, optimistic UI, and undo for hide and availability toggles.

1. **الرئيسية (overview)**
   - KPIs: weighted overall average, total ratings, ratings this week, pending comments (badge), unavailable count, hidden count
   - top-rated and needs-attention items (minimum 3 ratings)
   - a live feed of the latest reviews (staff listener)
2. **الأقسام**
   - drag-to-reorder list (`GripVertical` handle)
   - create/edit: Arabic name, English name, slug/anchor, icon (picker from the §4.1 registry), visibility
   - delete only when the section is empty (owner only)
3. **الأصناف**
   - **List:** filter by section, visibility and availability; search. **One-tap availability and visibility switches right in the list**, since that's the owner's most frequent action. Drag to reorder within a section.
   - **Create/edit form:** section, names, slug, tagline, description, ingredients (tags), price variants (at least 1, each with a label and a JD amount of ≤ 3 decimals), calories, badges, icon (picker from the §4.1 registry), featured, visibility, and availability with an optional note.
   - **Photo and optional cutout:** drag-drop, or the camera on mobile.
     1. Resize on the client to ≤ 2000px.
     2. Upload to `/api/admin/upload`, where `sharp` makes a WebP (1200w) and a blur placeholder.
     3. Store it under `public/items/...` in Storage and get its URL with `getDownloadURL`.
   - **Live preview** of the customer card and detail beside the form (a tab on mobile).
   - **Delete (owner only):** the confirm dialog spells out the consequences ("سيتم حذف 12 تقييمًا مرتبطًا بهذا الصنف"), then cascade-deletes reviews, contacts, stats and images.
4. **التقييمات (ratings dashboard)**
   - A table of items showing average, count, 5-to-1 distribution mini-bars, pending comments and last review date. Cards replace the table on mobile.
   - Sort by average, count, name or latest.
   - Filter by section, rating range, date range and "has pending".
   - **Item drill-down `/admin/ratings/[itemId]`:**
     - big average, distribution chart, and weekly-average trend
     - that item's reviews list, filterable by status, stars, has-comment and date
     - search by name (and by phone, for the owner)
     - per-review actions **موافقة / إخفاء / حذف**, plus bulk actions; deleting adjusts the stats in a transaction
5. **التعليقات (moderation queue)**
   - all pending comments across items, newest first, each row showing the item name and thumbnail or icon
   - bulk approve and hide
   - desktop keyboard shortcuts: A approves, H hides
6. **الفريق (owner)**
   - list users and change roles or disable accounts
   - add staff: Admin SDK `createUser` + role claim, then show a password-setup link to copy
7. **الإعدادات (owner)**
   - brand texts in Arabic and English (taglines, mission, thanks) and the logo
   - optional contact and social details, shown in the footer when set
   - intro on/off and auto-approve comments
   - CSV export of reviews including phones (audit-logged)
   - a **QR code generator** for the menu URL (PNG/SVG with the logo in the center)
8. **سجل العمليات (owner):** the audit log, filterable by user and action.

Dates use the `Asia/Amman` time zone and `Intl.DateTimeFormat('ar-JO-u-nu-latn')`.

---

## 10. Data import and seed

- `scripts/seed/lupo-menu.json` holds the data from **Appendix A**. `scripts/import-lupo.ts`:
  - downloads the images and logo from the live site and processes them with sharp
  - uploads them to Storage and upserts Firestore docs by slug (idempotent)
  - creates empty `itemStats`
  
  It targets the emulator by default; production only with `--project <id> --confirm`.
- **App code never imports the seed file.** Enforce it with an ESLint `no-restricted-imports` rule and a test that greps `src/`.
- **Don't invent descriptions, ingredients or calories** (allergy risk). Leave them empty for the owner to fill in.
- Bootstrap the first owner with `scripts/set-role.ts --email <e> --role owner|staff|none`.

---

## 11. Performance, accessibility, SEO

- **Budgets:**
  - first-load JS for `/` ≤ 180 KB gzip
  - LCP < 2.5 s on a mid-range phone over 4G **with the intro playing** (shorten the intro if needed)
  - CLS < 0.05, INP < 200 ms
  - Lighthouse mobile: performance ≥ 90; accessibility, best practices and SEO ≥ 95
  - fonts: only the 4 core Cairo weights preloaded (≈ 230 KB WOFF2 total)
- **Images:**
  - `next/image` with Storage `remotePatterns`, correct `sizes`, blur placeholders and fixed aspect ratios
  - for emulator image URLs in dev, check the Next 16 docs on local-IP image optimization (dev-only setting)
- **Icons:** import icons individually (tree-shaken) and don't ship the whole set.
- **Accessibility:**
  - the modal traps focus, returns focus on close, uses `aria-modal` and closes on Esc
  - the star input is a radio group with arrow keys (RTL-aware)
  - decorative icons are `aria-hidden`; icon-only buttons get an Arabic `aria-label`
  - visible focus rings and touch targets ≥ 44px
  - `<html lang="ar" dir="rtl">`, and the intro overlay is `aria-hidden`
- **SEO:**
  - metadata: title "LUPO | المنيو" and the existing meta description
  - a generated OG image (logo on dark, Latin text only, Cairo TTF; §4)
  - a `manifest` (installable PWA, theme `#0b0b0b`)
  - a `sitemap` of visible items only, and a `robots` file that disallows `/admin`
  - JSON-LD `Restaurant` + `Menu` / `MenuSection` / `MenuItem` with offers, and **no self-serving aggregateRating**

---

## 12. Tests (all must pass before "done")

**Unit (Vitest)**
- zod schemas, e.g. `0791234567`, `+962 79 123 4567` and `٠٧٩١٢٣٤٥٦٧` all become `+962791234567`, while `12345` is invalid
- Arabic search normalization
- stats math (add / update / delete)
- Arabic plural formatting
- fils → `2.75 JD`
- the icon registry resolves every key used in the seed

**Rules (emulator)**
- an unauthenticated client can't read or write anything
- staff can't read `reviewContacts`
- nobody can write from the client

**E2E (Playwright, emulators, seeded data, mobile 390×844 + desktop 1440×900)**
1. Loop over **every visible item read from the DB**:
   - clicking its card opens the detail with the correct name and price(s)
   - closing restores the URL
   - a direct visit to `/item/[slug]` renders the full page
2. Rate item A (4 stars, name, valid phone, comment):
   - the success message mentions approval
   - item A's count and average update
   - the comment is **not** visible publicly
3. The owner logs in:
   - the review appears under **item A** (stars = 4, pending) and **not** under item B
   - after approval, the comment shows on item A's page only
   - hiding it removes it; deleting it decrements the stats
4. Invalid inputs show Arabic errors, and the same invalid payloads sent straight to the server action are rejected.
5. A hidden item:
   - is absent from the DOM and from search
   - `/item/[slug]` returns 404, and the server rejects ratings for it
   - hiding a section hides its items
6. An unavailable item shows its badge, the rate button is disabled, and the server rejects ratings.
7. Access control:
   - `/admin` without a session redirects to login
   - a signed-in user without a role gets 403
   - staff see no delete buttons, and delete actions are rejected server-side
8. When the owner edits a price, the public menu shows it right after the action (cache invalidation works).
9. Reduced motion skips the intro. Otherwise the intro plays once per session and can be skipped.
10. Tapping a chip scrolls to its section, and scroll-spy highlights the right chip.
11. **Brand rules:**
    - On every route, the admin included, rendered text has no `\p{Extended_Pictographic}` characters outside customer comments. A unit test checks the same for `src/`, `src/i18n/ar.ts` and the seed.
    - Cairo is the only font family in computed styles, and every weight in use is one of 200 / 300 / 400 / 600 / 700 / 900.
    - The admin forms reject emoji in names and descriptions.

Also required: `npm run build` is clean, with no console errors, no hydration warnings, and no high/critical `npm audit` findings.

---

## 13. Project setup

```
src/app/            layout.tsx (RTL, Cairo, MotionConfig, intro overlay, @modal slot) · page.tsx
                    item/[slug] · @modal/(.)item/[slug] · @modal/default.tsx · classic
                    admin/login · admin/(protected)/… · api/auth/{session,logout}
                    api/admin/upload · api/items/[id]/reviews
                    opengraph-image · manifest · sitemap · robots · not-found · error
src/components/     menu/ item/ rating/ motion/ admin/ ui/
src/components/icons/  custom-icons.ts (provided) · registry.tsx · AppIcon.tsx
src/fonts/cairo/    6 × .woff2 · FONT-LICENSE.md (provided) · OFL.txt
src/server/         firebase-admin.ts · auth.ts · repos/ · actions/ · stats.ts · rate-limit.ts · images.ts
src/lib/            firebase-client.ts · format.ts · arabic.ts · phone.ts · fonts.ts
src/schemas/        shared zod schemas
src/i18n/ar.ts      UI microcopy only (content stays in Firestore)
assets/fonts/cairo/ 6 × .ttf for next/og (provided)
assets/icons/custom/ fries.svg · sauce-bottle.svg (provided)
proxy.ts · firebase.json · firestore.rules · firestore.indexes.json · storage.rules
scripts/            import-lupo.ts · set-role.ts · seed/lupo-menu.json
tests/              unit/ · rules/ · e2e/
reference/          original/ · inspiration/ (provided) · design/ (provided) · compare/
docs/               BRIEF.md · brand-tokens.md · OWNER_GUIDE_AR.md
.github/workflows/ci.yml   (typecheck, lint, unit, rules, e2e with emulators; Java 21)
```

npm scripts: `dev`, `build`, `start`, `typecheck`, `lint`, `test`, `test:rules`, `test:e2e`, `emulators`, `seed`, `seed:prod`, `set-role`, `deploy:rules`.

Key dependencies: `lucide-react`, `@lucide/lab`, `motion`, `firebase`, `firebase-admin`, `zod`, `react-hook-form`, `libphonenumber-js`, `sharp`.

`.env.example`:
```
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_USE_EMULATORS=true
FIREBASE_SERVICE_ACCOUNT_BASE64=   # server only
REVIEW_HASH_SECRET=                # long random string
NEXT_PUBLIC_TURNSTILE_SITE_KEY=    # optional
TURNSTILE_SECRET_KEY=              # optional
```

---

## 14. Phases

0. **Reference and brand:** §3, plus the plan and `CLAUDE.md`.
1. **Scaffold:**
   - Next 16, scaffolded in a temp folder and merged in, keeping the starter kit.
   - Tailwind v4 tokens and the Cairo setup (§4).
   - The icon registry and `AppIcon` (§4.1).
   - RTL base, lint/format, Vitest and Playwright setup, folder structure.
2. **Firebase:** emulators, rules and rules tests, indexes, Admin SDK singleton, repos, schemas, import/seed script, `set-role`.
3. **Public menu:** home, chips with scroll-spy, cards, intercepted modal and item page, search, visibility/availability states, `/classic`.
4. **Motion layer:** intro, transitions, scroll effects, micro-interactions. Then **CHECKPOINT** (screenshots + brand tokens) and wait for my OK.
5. **Ratings:** rating sheet, server action and transaction, approved comments with pagination, related-items arc.
6. **Admin:** auth and roles, overview, sections, items (upload, icon picker, live preview), ratings dashboard and drill-down, moderation queue, team, settings, audit log.
7. **Hardening and handover:**
   - the full test suite, an accessibility and Lighthouse pass, security headers, SEO and PWA
   - `README.md` covering setup, emulators, seed, roles and deploy
   - `docs/OWNER_GUIDE_AR.md`, a one-page Arabic guide for the restaurant owner
   - a before/after screenshot set in `reference/compare/` for the client presentation

---

## 15. Definition of Done

**Customer**
- [ ] Every visible item opens its details (modal and deep-link page) showing: name, image or icon tile, description and ingredients when present, price(s), average and count, approved comments, and a rate button.
- [ ] Ratings are per item only; there is no restaurant-wide rating anywhere.
- [ ] Rating requires stars, name and a valid phone; the comment is optional; validation runs on both client and server.
- [ ] A clear confirmation appears after submit and says the comment may need the owner's approval.
- [ ] Section navigation is easy on mobile and desktop: chips with scroll-spy, side rail, search, and swipe/arrow navigation between items.
- [ ] Hidden items and sections are invisible everywhere: UI, search, URLs, sitemap, JSON-LD and API.
- [ ] Unavailable items show a clear state, and rating them is blocked in the UI and on the server.
- [ ] LUPO's look is preserved and elevated; the original is archived in `reference/original/` and live at `/classic`.
- [ ] The "THE SMASH" intro, transitions and micro-interactions are done, reduced motion is respected, and the budgets are met.
- [ ] Cairo is the only font (all six weights wired, no 500/800 in use), and there is no emoji anywhere: icons only (§4.1).

**Owner**
- [ ] Login and roles work, and every admin route and action is protected server-side.
- [ ] Full CRUD for sections and items (name, description, price, image, icon), with reorder.
- [ ] Show/hide and temporarily-unavailable controls, one tap from the list.
- [ ] Per-item review management: approve, hide and delete comments.
- [ ] A ratings dashboard with per-item average, count, star distribution and comments, plus filters and sorting.

**Data and quality**
- [ ] All content is read from Firestore; no menu data is hard-coded in the UI.
- [ ] Every review is linked to the correct item, and stats stay consistent (transactions).
- [ ] Inputs are validated, and unauthorized edit, delete or admin access is impossible (rules + server checks).
- [ ] Every screen, the dashboard included, is responsive from 360px to 1920px.
- [ ] All tests in §12 pass, the build is clean, and the README and Arabic owner guide are delivered.

---

## 16. Non-goals
- no cart, ordering or payments
- no customer accounts and no SMS OTP
- no restaurant-wide rating
- no multi-branch support
- no hard-coded menu content in the UI
- no emoji and no fonts other than Cairo

---

## Appendix A: current content (extracted 2026-11-25; re-verify in Phase 0)

```json
{
  "site": {
    "brandName": "LUPO",
    "metaTitle": "LUPO | المنيو",
    "metaDescription": "منيو LUPO — برجر، إضافات، مشروبات وصوصات.",
    "themeColor": "#0b0b0b",
    "logoUrl": "https://lupojo.netlify.app/assets/dr_burger_logo.png",
    "taglineEn": "SIMPLE INGREDIENTS. SMASHING TASTE.",
    "subtaglineAr": "طازج، غني بالنكهة، ويُحضّر عند الطلب.",
    "subtaglineEn": "Fresh, bold and made to order.",
    "mission": {
      "titleAr": "رغبتك.",
      "titleEn": "YOUR CRAVING. OUR MISSION.",
      "bodyAr": "مكونات طازجة. سماش بإتقان.",
      "bodyEn": "Fresh ingredients. Perfectly smashed."
    },
    "thanks": {
      "titleAr": "شكرًا لكم",
      "titleEn": "THANK YOU FOR CHOOSING LUPO",
      "bodyAr": "شكرًا لاختياركم LUPO — صُنع بشغف.",
      "bodyEn": "Made with passion."
    },
    "_verify": [
      "mission.titleAr looks truncated (probably 'رغبتك. مهمتنا.') — copy the exact text from the live page",
      "exact line breaks of the mission and thank-you blocks"
    ]
  },
  "sections": [
    {
      "slug": "burgers", "icon": "hamburger", "nameAr": "البرجر", "nameEn": "Burgers", "order": 1,
      "items": [
        { "slug": "single-smash", "icon": "hamburger", "nameAr": "سنجل سماش", "nameEn": "Single Smash",
          "prices": [ { "labelAr": "ساندويش", "labelEn": "Sandwich", "amountFils": 2750 },
                      { "labelAr": "وجبة", "labelEn": "Meal", "amountFils": 3500 } ],
          "image": "https://lupojo.netlify.app/assets/dr_smash.jpg" },
        { "slug": "double-smash", "icon": "hamburger", "nameAr": "دبل سماش", "nameEn": "Double Smash", "featured": true,
          "prices": [ { "labelAr": "ساندويش", "labelEn": "Sandwich", "amountFils": 3250 },
                      { "labelAr": "وجبة", "labelEn": "Meal", "amountFils": 4000 } ],
          "image": "https://lupojo.netlify.app/assets/dr_double_smash.jpg" },
        { "slug": "nashville-chicken", "icon": "drumstick", "nameAr": "ناشفيل تشكن", "nameEn": "Nashville Chicken",
          "prices": [ { "labelAr": "ساندويش", "labelEn": "Sandwich", "amountFils": 3250 },
                      { "labelAr": "وجبة", "labelEn": "Meal", "amountFils": 4000 } ],
          "image": "https://lupojo.netlify.app/assets/dr_nashville.jpg" },
        { "slug": "crispy-chicken", "icon": "drumstick", "nameAr": "كرسبي تشكن", "nameEn": "Crispy Chicken",
          "prices": [ { "labelAr": "ساندويش", "labelEn": "Sandwich", "amountFils": 3250 },
                      { "labelAr": "وجبة", "labelEn": "Meal", "amountFils": 4000 } ],
          "image": "https://lupojo.netlify.app/assets/dr_crispy.jpg" }
      ]
    },
    {
      "slug": "sides", "icon": "fries", "nameAr": "الإضافات", "nameEn": "Sides", "order": 2,
      "items": [
        { "slug": "loaded-fries", "icon": "fries", "nameAr": "لودد فرايز", "nameEn": "Loaded Fries",
          "prices": [ { "amountFils": 2500 } ],
          "image": "https://lupojo.netlify.app/assets/loaded_fries.jpg" },
        { "slug": "small-fries", "icon": "fries", "nameAr": "بطاطا صغيرة", "nameEn": "Small Fries",
          "prices": [ { "amountFils": 600 } ],
          "image": "https://lupojo.netlify.app/assets/small_fries.jpg" },
        { "slug": "big-fries", "icon": "fries", "nameAr": "بطاطا كبيرة", "nameEn": "Big Fries",
          "prices": [ { "amountFils": 1000 } ],
          "image": "https://lupojo.netlify.app/assets/large_fries.jpg" }
      ]
    },
    {
      "slug": "extras", "icon": "cup-soda", "nameAr": "المشروبات والإضافات", "nameEn": "Drinks & Extras", "order": 3,
      "items": [
        { "slug": "matrix", "icon": "can-soda", "nameAr": "ماتركس", "nameEn": "Matrix",
          "prices": [ { "amountFils": 300 } ] },
        { "slug": "sauce", "icon": "sauce-bottle", "nameAr": "صوص", "nameEn": "Sauce",
          "prices": [ { "amountFils": 300 } ] },
        { "slug": "jalapeno", "icon": "pepper-chilli", "nameAr": "هالبينو", "nameEn": "Jalapeño",
          "prices": [ { "amountFils": 300 } ] }
      ]
    }
  ]
}
```
Notes:
- All items are visible and available. Descriptions, ingredients and calories don't exist yet; leave them empty.
- English names display in uppercase via CSS, matching the original.
- Image alt texts must be `"<nameAr> — <nameEn>"`, never "DR. …".
- The original site's emojis are intentionally replaced by the `icon` keys above (§4.1).

---

## Appendix B: original client brief (Arabic, authoritative if anything conflicts)

> انشئ موقع على Next.js + TypeScript + Node.js + Firebase + Tailwind CSS، فيه انميشن وانتقالات وشاشة بداية وانترو للشعار. معلومات الموقع والشعار من https://lupojo.netlify.app/ — بدي شي إبداعي جدًا وجميل ويرفع الراس.

طوّر المنيو الحالي من عرض ثابت يشبه الورقة إلى منيو تفاعلي بالكامل.

**تجربة العميل التفاعلية**
- اجعل كل صنف قابلًا للضغط. عند الضغط عليه، افتح صفحة تفاصيل أو نافذة واضحة تعرض:
  - اسم الصنف وصورته إن وجدت.
  - الوصف والمكونات، إذا كانت متوفرة.
  - السعر.
  - متوسط التقييم وعدد التقييمات.
  - التعليقات التي وافق المالك على نشرها.
  - زرًا لتقييم الصنف وكتابة تعليق.
- أضف لكل صنف تقييمًا مستقلًا بالنجوم وتعليقات مرتبطة به؛ لا تخلط تقييم صنف مع تقييم المطعم ككل.
- عند إرسال التقييم، اطلب من العميل اسمه ورقم هاتفه، مع جعل التعليق اختياريًا والتحقق من صحة المدخلات.
- اعرض رسالة تأكيد بعد إرسال التقييم، ووضّح أن التعليق قد يحتاج موافقة المالك قبل ظهوره.
- اجعل التنقل بين الأقسام والأصناف سهلًا على الجوال والكمبيوتر.
- الأصناف المخفية من المالك لا تظهر للعملاء، أما الأصناف غير المتاحة مؤقتًا فتظهر بحالة واضحة من دون السماح بتقييمها أو طلبها إذا لم تكن ميزة الطلب موجودة.
- حافظ على الشكل العام قدر الإمكان، ويمكن إبقاء نسخة من التصميم الأصلي كمرجع بصري.

**لوحة المالك**
- يستطيع المالك إضافة الأصناف والأقسام وتعديلها وحذفها، وإدارة الاسم والوصف والسعر والصورة.
- يستطيع إظهار الصنف أو إخفاءه أو تحديده كغير متاح مؤقتًا.
- يستطيع مراجعة تقييمات كل صنف على حدة، والموافقة على التعليقات أو إخفاؤها أو حذفها.
- اعرض لوحة تقييمات فيها متوسط التقييم لكل صنف، وعدد التقييمات، وتوزيع النجوم، والتعليقات، مع فلاتر وترتيب واضح.
- احمِ لوحة المالك وعمليات الإدارة بتسجيل دخول وصلاحيات مناسبة.

**البيانات والتنفيذ**
- خزّن الأقسام والأصناف وتقييماتها وتعليقاتها في قاعدة البيانات، واربط كل تقييم بالصنف الصحيح.
- لا تستخدم بيانات ثابتة داخل الواجهة بدل قاعدة البيانات.
- تحقّق من المدخلات، واحمِ عمليات التعديل والحذف والإدارة من الوصول غير المصرّح به.
- حافظ على تصميم المشروع الحالي وطوّره، واجعل جميع الواجهات متجاوبة وسهلة الاستخدام.
- اختبر أن الضغط على كل صنف يفتح تفاصيله، وأن تقييمه يظهر للمالك مرتبطًا بذلك الصنف، وأن التعليقات لا تظهر للعملاء إلا بعد موافقة المالك.

**إضافات العميل (25-11-2026)**
- الخط المعتمد هو Cairo فقط (الملفات المرفقة بأوزانها الستة: ExtraLight وLight وRegular وSemiBold وBold وBlack).
- بدون إيموجي نهائيًا؛ تُستخدم أيقونات بدلها في كل مكان.
