# Rebuild plan (master prompt v3, 23 Nov 2026)

Phases 0a and 0b are done (draft PR #1). v3 keeps v2's design direction (full colour, Ink Crew, welcome film, §5.7 craft standard) and adds the **revenue engine (§10A)**: proven marking accuracy first, then Snap & Mark, the Mock Series and family checkout.

## The order in §13

| Phase | What | Notes |
|---|---|---|
| 1a | Design system + Ink Crew, as 6 stacked PRs of about 600 lines each (see below) | One 🛑 at the end |
| 1b | Sign-in, Rook-hosted onboarding, parental consent, welcome film (WAAPI first), export/delete | SMTP must be live first |
| 1c | Landing: self-marking hero, try-a-question, how marking works, pricing, SEO pages | Landing copy only claims what R0 proves |
| 1d | Mocks, results, Fix it, eval set, model config, zod, rate limits | |
| 1e | App shell, Today, parent report (with no study-time or activity data) | |
| **R0** | **Marking accuracy:** blind double-marking tool, metrics, public `/accuracy`, gating of predicted grades and percentiles per subject, monthly sampling | Needs teachers and 50 consented scripts from you |
| **R1** | **Snap & Mark** (vision provider needs your yes), **Mock Series** (Maths 0580, Physics 0625, Chemistry 0620; original papers; standing card; group codes), **family checkout plan + parent report** (payment changes need a separate yes) | Prices proposed, not set |
| 2a–5 | Profile · Radar · Essay coach + EC Help · Compete · Pitch + media | Unchanged |

New flags: `FLAG_ACCURACY_PAGE`, `FLAG_SNAP_MARK`, `FLAG_MOCK_SERIES`, `FLAG_FAMILY_CHECKOUT`. All new flags start off.

### Phase 1a split (unchanged from v2)
1. **1a.1 Foundations:** tokens, area colours, fonts, dark mode on `<html>`, motion tokens, Vitest + Playwright, contrast test.
2. **1a.2 Guardrails:** copy lint, style lint, CI, grid overlay, visual regression.
3. **1a.3 Components:** the full component set, shown on `/dev/components`.
4. **1a.4 Brand + icons:** 3 logo options, favicon/manifest, about 24 icons, `/dev/brand`.
5. **1a.5 Ink Crew:** 7 characters with all poses, `/dev/crew`.
6. **1a.6 Motion reel.**

## ⚖️ Where the three hats disagree (founder decides)
- **Design lead:** follow §13 as written. The whole 1a design system and the Crew come first, because every later screen is built from them.
- **CEO:** revenue is about ₹40K lifetime and v3 says trust (accuracy) is the binding constraint. Full 1a plus 1b–1e is several weeks of work before R0 starts. Alternative order:
  1. 1a.1–1a.3 (foundations, guardrails, components; every later screen needs them)
  2. R0 accuracy tooling, built while you run the §10A.8 test
  3. the rest of 1a (brand, Crew, motion), then 1b, and so on
- **Engineer:** either order works technically, because R0's tools only need 1a.1–1a.3.

## The 7-day test (§10A.8): you do this now, mostly without code
1. The team writes **one original Physics (0625-style) mock paper** plus its marking points, and a teacher checks both. Don't use past-paper content.
2. Post a "StudyRaven December Physics Mock" to existing users and school WhatsApp groups. Students download the PDF, sit it on paper and upload photos through a simple form. Optionally add a ₹199 "priority results + parent report" using a Razorpay **payment link**, which needs no code change.
3. A teacher blind-marks 30 of the scripts. Claude runs the AI marking on the same scripts and compares the two. That's your first real accuracy number.
4. Count sign-ups, completed papers, payments, parents who opened the report, and shares. **If fewer than about 40 students complete it, distribution is the problem, not features.**

What Claude can do for this test: a script that runs the existing marking on typed transcripts, and a comparison sheet. Claude does not write the paper or invent any results.

## Decisions waiting on you
1. Build order: §13 as written, or the CEO alternative above.
2. Predicted grades. v3 says none should go out before R0 measures accuracy, but today's app shows one on every mock. Choose one:
   - stop advertising them now and gate them in R0, or
   - hide them in the app now too, or
   - keep them as they are.
3. Remotion licence (team of 4). The welcome film ships as WAAPI first either way.
4. From 0b:
   - the legal operator for the Terms and Privacy pages
   - SMTP
   - Vercel region and plan
   - Supabase plan
   - OpenRouter privacy setting
   - a test account
5. For R0/R1, later: teacher reviewers, consent forms, the first 50 scripts, the vision provider and its cost, and Mock Season pricing.
