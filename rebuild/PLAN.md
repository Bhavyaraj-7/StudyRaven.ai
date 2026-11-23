# Rebuild plan (master prompt v2, 23 Nov 2026)

Phases 0a and 0b are done (draft PR #1). v2 adds full colour, the Ink Crew, the welcome film, motion M17–M27 and the §5.7 "not AI-ish" standard. Phase 1a alone is several thousand lines, so it ships as stacked PRs of about 600 lines or fewer, each finished on its own.

**Branches.** Each 1a part gets its own branch under `rebuild/marked-paper` (the branch the master prompt names), stacked on PR #1's branch. Then every PR shows only its own diff.

## Phase 1a: design system + Ink Crew (6 PRs, one 🛑 at the end)

| PR | Scope | Proves it |
|---|---|---|
| 1a.1 Foundations | Tokens from Appendix A, including the 7 area colours (deep/bright/tint/dark) and `data-area` theming. Tailwind mapping. Bricolage + Inter via `next/font`. Dark mode moves from the app-only `[data-theme]` to `class="dark"` on `<html>`, set by a head script before paint. Motion tokens. Vitest + Playwright setup. | Contrast unit test over every pair in §5.2 (light + dark). Font bytes measured (budget ≤ 120 KB on `/`). |
| 1a.2 Guardrails | `scripts/lint-copy.ts` (banned words, emoji, ALL-CAPS, em-dashes) and the style lint (hex colours, gradients, off-scale values, single icon set). GitHub Actions CI. `?grid=1` overlay. Visual-regression baselines at 360/1440 × light/dark. | CI red on a planted violation, green on the repo |
| 1a.3 Components | Button, Input, Chip, Tabs (M2), Card (M19), Sheet (M4), Toast, Skeleton, Countdown chip, Progress (M20), `<Stroke>` tick/circle/underline, Mark bracket, Empty state (M25), Error (M24). `/dev/components` shows every state. | Keyboard + reduced-motion checks; axe clean |
| 1a.4 Brand + icons | 3 raven-from-one-tick logo options. Favicon set, apple-touch-icon, manifest, `theme-color`. About 24 pen-stroke icons. `/dev/brand`. | You pick a logo; the icons sit next to Lucide at the same stroke |
| 1a.5 Ink Crew | Rook, Bolt, Sprout, Quill, Spark, Nova, Wing. 7 poses each, plus `celebrate-big` for Rook and Nova. `<Crew>` + `<CrewBubble>`, `content/crew-lines.json`. Idle animations pause off-screen. Settings toggles: "Show the Ink Crew" and "Celebrations". `/dev/crew` cast sheet. | ≤ 6 KB gzip per character; INP with the Crew on |
| 1a.6 Motion reel | Component-level M1–M3, M17, M18, M21–M23, M26 and M27 (the rest land with their screens). Canvas paper-confetti (M22, ≤ 5 KB, no library). | Frame strips; reduced motion = end states |

**🛑 1a checkpoint:**
- before/after of 5 screens, each with its §5.7 scorecard and side-by-side reference shots (kept local)
- the 3 logo options, the icon set, and the cast sheet (light + dark)
- the motion reel
- font bytes, the JS delta and INP

Dev pages (`/dev/*`) return 404 in production.

## After 1a (unchanged order, v2 additions in bold)
- **1b** Sign-in (Google + One Tap, email code, password fallback, in-app-browser and school-account handling). **Rook-hosted onboarding (M26).** Parental consent + `parental_consents` migration. Export/delete. **Welcome film as the WAAPI/SVG `WelcomeSequence`.** The Remotion Player replaces it only after the licence is confirmed.
- **1c** Landing: self-marking paper hero, **with Rook on the paper, the area-tint mesh and the spectrum ribbon**. Try-a-question, how marking works, parents, pricing from `lib/pricing-copy.ts`, SEO pages.
- **1d** Mocks + results (M6, M7, **M21**), Fix it, eval set, `lib/ai/models.ts`, zod, rate limits.
- **1e** App shell (**area colour flood M18**), Today with Rook's greeting, parent report (Wing).
- **2a** Profile + activities (Sprout) · **2b** Radar · **3** Essay coach + EC Help (Quill) · **4** Compete (Bolt) · **5** Pitch (Spark) + Remotion clips if licensed.

## Decisions waiting on the founder
1. **Remotion licence** (team of 4, so it's likely paid). The welcome film doesn't wait for it; the WAAPI version ships first either way.
2. **Logo pick** at the 1a checkpoint. The chosen mark becomes Rook's body.
3. **Crew art.** Claude draws all seven in code. An illustrator can replace them later without changing the `<Crew>` API.
4. Still open from 0b: legal operator, SMTP, Vercel region/plan, Supabase plan, OpenRouter privacy setting, a test account (see `FOUNDER-CHECKLIST-0b.md`).
