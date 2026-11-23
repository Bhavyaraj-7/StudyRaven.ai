# Phase 0a recon report (23 Nov 2026)
Read-only: no product code, schema or setting was changed. Screenshots in `rebuild/baseline/` (git-ignored). Production DB not queried; schema read from `supabase/migrations/`.

## 1. Stack
- Next.js **14.2.13** App Router, React 18, TS strict, Tailwind **3.4.11**. View Transitions need Next 15+, so M14 is skipped (no upgrade).
- Tokens: RGB triplets in `app/globals.css`. Dark mode = `[data-theme="dark"]` set by `ThemeScope` inside `AppLayout` only, so the landing page is always light. Choice is saved in `localStorage` (`sr-theme`).
- **No `next/font` anywhere.** Inter is never loaded, so Android users see Roboto.
- `framer-motion` 11 is used only in the app (PricingModal, Flashcards, SlideDeck). No tests, analytics or error monitoring. Only security header: HSTS.
- Vercel, functions in **iad1 (US East)**. Vercel plan, Supabase plan and region are unknown → founder (§Q).

## 2. Data (20 tables, all with RLS enabled)
- Owner-only CRUD (`auth.uid() = user_id`): subjects, tasks, mock_tests, mock_attempts, college_profiles, competitions*, user_papers, ai_papers, flashcards, notes, topics, drills, mistakes, college_chats, college_applications. profiles: select/insert/update own (no delete).
- Service-role only (RLS on, no policies): generation_usage, google_access_requests. waitlist: anyone can insert, nobody can read.
- Storage: private bucket `papers`, path `<uid>/…`, owner policies.
- 🔴 **subscriptions has own_insert/own_update/own_delete.** `isProUser()` trusts `plan='pro' AND status='active'`, so any logged-in user can grant themselves Pro from the browser console. Fixing this means dropping 3 policies → needs your separate yes.
- *Name clash: a per-user `competitions` table already exists (Tavily results in the college guide). The §10.2 public radar needs a new name (e.g. `competition_listings`).
- profiles own_update also lets users edit `google_refresh_token`, `welcome_email_sent_at`, `limit_email_sent_on` (low risk).

## 3. Auth
- Supabase with `@supabase/ssr` (good); middleware calls `getUser()`. Providers in code: email + password, Google OAuth (default scopes). No OTP, magic link, CAPTCHA, onboarding consent, export or delete.
- 🔴 **Open redirects:** `/login?redirect=` goes to `router.push()` unchecked, and `/auth/callback?next=//evil.com` goes to `new URL(next)`, which leaves the site.
- Signup `emailRedirectTo` = `/onboarding`. Email templates, redirect allow-list and SMTP live in the dashboard, so I can't see them → founder.

## 4. AI
- **All LLM calls go through OpenRouter, not Groq directly:** `meta-llama/llama-3.3-70b-instruct`, `provider.sort=throughput` (any provider). One hard-coded model, no fallback model. Retries only on network errors (not 429/5xx). `JSON.parse` + regex salvage, no zod.
- 14 call sites: studio/generate, ai-paper, mocks/grade, drill (×2), tutor/chat, schedule, study-plan, mark-scheme-guide, stats/weakest, college/{essay, profile ×2, scholarships, chat}. Tavily ("advanced" = 2 credits per search) in college/{chat, profile, opportunities, scholarships} and weekly-digest.
- Limits: only studio and ai-paper count toward the 5/day free limit. tutor/chat and college/chat check Pro server-side. **college/profile, opportunities, scholarships and essay are Pro-gated in the UI only, with no server check or rate limit** (Tavily and LLM spend risk). mocks/grade, drill, schedule, study-plan, mark-scheme-guide and weakest have no limit.
- 🔴 `college/essay` returns `rewrites[].suggestion`, rewritten sentences of the student's essay. This breaks §1.3.
- **Mark schemes are AI-generated** by ai-paper together with the questions. No UCLES text in the repo (good). This means the claim "graded against real mark schemes" is false. User-uploaded PDFs (up to 18k chars) feed generation.
- Cost per call: unknown. The order of magnitude is ₹0.1–0.5 per mock grade; the real figure is on the OpenRouter activity page → founder.

## 5. Payments (read-only, untouched)
- Files: `lib/razorpay.ts`, `api/{create,verify,cancel}-subscription`, `api/razorpay-webhook`, `PricingModal.tsx`. These are **recurring Razorpay Subscriptions** (₹299/mo ×60, ₹2,499/yr ×10). Signatures are HMAC-verified. Cancel = at cycle end, so "cancel anytime" is true and "Save 30% yearly" is true (30.4%). Pro = `subscriptions.plan/status`. `current_period_end` is not checked.

## 6. Claims vs code
| Claim (site / email) | Reality |
|---|---|
| "Join thousands of students" | false. LiveCounter.tsx (unused) fakes "247 joined this week" |
| "12k+ past papers … indexed" | false: links to 5 external sites, nothing indexed |
| "5 AI outputs", "<60s" | 5 Studio formats exist; "<60s" is unmeasured |
| "graded against real mark schemes" (landing + welcome email) | false: AI-written schemes |
| Free: "Gmail + Classroom sync" | beta by request (manual Google test-user list), not live |
| Pro: "Score predictor", "AI practice papers" | both are free (practice papers count toward the 5/day) |
| Pro: "Audio overview (podcast)" | removed in commit 91021b8 |
| Newsletter "written by students who got in", "issue #18" | AI + Tavily (weekly-digest edge function); the issue number is made up |
| Footer "All systems normal" green dot | hard-coded, no status page |
| Privacy/Terms → `#`; `/privacy` `/terms` `/college-guide` `/pricing` | all 404 |
| `metadataBase` = studyraven.ai | live domain is studyravenai.com; no OG image |
| Emails `FROM` fallback `onboarding@resend.dev` | Resend's test sender, delivers only to the account owner, unless `RESEND_FROM_EMAIL` is set |

## 7. Baseline (live site; Lighthouse 12.2.1, mobile, simulated Slow 4G)
| Page | Perf | LCP | TBT | CLS | A11y | BP | SEO | Weight |
|---|---|---|---|---|---|---|---|---|
| `/` | 95 | 1.5 s | 250 ms | 0 | 95 | 96 | 100 | 1,387 KiB (1.2 MB video) |
| `/login` | 100 | 1.7 s | 30 ms | 0 | 96 | 96 | 100 | 186 KiB |
| `/signup` | 100 | 1.4 s | 30 ms | 0 | 96 | 96 | 100 | 184 KiB |
- A11y fails on all pages: colour contrast (`--graymute` #8A8A8A = 3.4:1). TTFB about 0.25–0.45 s from this container.
- First-load JS (gzip, from the build): `/` 103 KB, `/login` 161 KB, `/mocks` 309 KB, `/studio` 389 KB. Home height: **8,402 px @375**, **5,506 px @1440**. The mobile nav CTA wraps and collides with ".ai" (confirmed).
- Logged-in pages: not measured. I need a test account (§Q).
- Hero video: 1280×720, 5 s loop, H.264, no poster, **"runway" watermark bottom-right** (confirmed from a frame).

## Q. Founder decisions needed before Phase 0b (I've stopped here)
1. **Security fixes in 0b?** (a) drop the user insert/update/delete policies on `subscriptions`; (b) validate `redirect`/`next` as same-origin paths; (c) add the server-side Pro check to college/{profile, opportunities, scholarships, essay}; (d) remove `rewrites` from essay feedback (§1.3).
2. **Contact address** that really receives mail (e.g. support@studyravenai.com)? **Legal operator** for Terms/Privacy and the Razorpay account holder (a parent or a company?), plus the grievance contact.
3. **Team size** for the Remotion licence (the site lists 4, so a paid licence is likely). Nothing is installed until you confirm.
4. Vercel plan (Hobby isn't allowed for paid products), Supabase plan + region, auth SMTP (built-in or custom), is `RESEND_FROM_EMAIL` set, are the 4 edge functions scheduled? Canonical domain: studyravenai.com?
5. A **test account** (email + password) on production, or a staging Supabase project, so I can measure logged-in pages.
6. OpenRouter privacy setting: is "providers that may train on inputs" turned off? Essays and answers go to whichever provider is fastest.
