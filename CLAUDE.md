# LUPO interactive menu: guide for agents

Full brief: `docs/BRIEF.md` (authoritative). Brand tokens: `docs/brand-tokens.md`. Also read `AGENTS.md`.

## Stack
- Next.js 16 (App Router, `src/`, Turbopack, `cacheComponents`), React 19, TypeScript strict, Node 24.
- Tailwind CSS v4 (CSS-first `@theme` in `src/app/globals.css`), `motion` (`motion/react`), lucide-react + @lucide/lab.
- Firebase: Firestore + Auth (custom claims `role: owner|staff`) + Storage. The **Admin SDK is used on the server only**.
  The client SDK is loaded **only under `/admin`**.
- zod v4 shared schemas (`src/schemas/`), react-hook-form, libphonenumber-js (region JO, E.164), sharp.
- Tests: Vitest (unit), `@firebase/rules-unit-testing` (rules), Playwright (e2e, mobile + desktop) on emulators.

## Commands
- `npm run dev`: Next dev server (expects emulators running via `npm run emulators`).
- `npm run emulators`: Firebase Emulator Suite (project `demo-lupo`). It needs Java 21; scripts look for
  `%LOCALAPPDATA%\lupo-tools\jdk21` when `JAVA_HOME` is unset.
- `npm run seed`: imports `scripts/seed/lupo-menu.json` into the emulators (idempotent).
- `npm run typecheck && npm run lint && npm test` must pass after every phase. Also `npm run test:rules` and `npm run test:e2e`.
- `npm run set-role -- --email <e> --role owner|staff|none`.

## Conventions
- Arabic-first RTL: `<html lang="ar" dir="rtl">`. Use **logical utilities only** (`ms-/me-/ps-/pe-/start-/end-`).
  Never use `ml-/mr-/left-/right-` for layout.
- English text goes in `<span lang="en">`, uppercased via CSS, tracked 0.06–0.12em. **Never letter-space Arabic.**
- Western digits: `Intl` with `ar-u-nu-latn`. Prices are `2.75 JD` inside `dir="ltr"`. Money is stored as integer fils.
- Small typed components, no `any`. Every server-only module starts with `import 'server-only'`.
- All menu content comes from Firestore. `src/i18n/ar.ts` holds UI microcopy only. App code never imports `scripts/seed`.
- Mutations go Server Action / Route Handler → `requireStaff()`/`requireOwner()` → zod → Admin SDK → `auditLog` →
  `updateTag`. Firestore/Storage rules deny all client writes.
- Firestore Timestamps become ISO strings at the repo boundary (`src/server/repos/`).
- Motion tokens: ease `[0.16,1,0.3,1]`, springs `{420,32}` / `{140,20}`, durations 180/320/600ms.
  Animate transform/opacity only, and respect `MotionConfig reducedMotion="user"`.
- Commits use Conventional Commits, one per phase step.

## Guardrails (non-negotiable)
- **Font: Cairo only.** Use the provided files in `src/fonts/cairo/` (woff2) and `assets/fonts/cairo/` (ttf, for `next/og`).
  The only weights are 200/300/400/600/700/900; never 500 or 800. No other font family anywhere, including the admin.
- Cairo has **no glyphs for ★ ☆ → ← ↓ ✓ ✕**. Never type them; use icons.
- **No emoji anywhere** (UI, seed, toasts, metadata, owner content). Use icons from `src/components/icons/registry.tsx`.
  Firestore stores only the `IconKey`. Only customer comments are shown verbatim.
- Icons use `strokeWidth={1.75}` (2 at ≤ 16px). Directional icons mirror in RTL; object icons never do.
- Never show invented descriptions, ingredients or calories (allergy risk). If a field is empty, it's not rendered.
- Hidden items/sections are invisible everywhere. Unavailable items stay visible but can't be rated (UI + server).
- **Emulators by default.** Never write to the production Firebase project unless the user explicitly says so.
- No secrets in git (`.env*` except `.env.example`, and no service-account JSON).
- Next 16 APIs differ from training data. Read `node_modules/next/dist/docs/` before using proxy, caching,
  intercepting routes, Server Actions or `next/font/local`.
- Starter-kit files stay where they are: `src/fonts/cairo/*`, `assets/fonts/cairo/*`,
  `src/components/icons/custom-icons.ts`, `assets/icons/custom/*`, `reference/{inspiration,design}/*`.
- Visual QA: after each UI phase, run `npx tsx scripts/reference/capture.ts <url> <dir>` (390x844 + 1440x900),
  review the screenshots critically, and compare them with `reference/`.
