# RESOLVO.AI — MASTER PROJECT BRIEF

## WHAT IS THIS
Resolvo.ai is an AI-powered SaaS study platform for IGCSE students in Grades 9-10.
The landing page is already built. Do not touch or redesign it.
Build everything else around it.

## TECH STACK — NEVER CHANGE THIS
- Next.js 14 App Router + TypeScript
- Tailwind CSS only (no custom CSS files)
- Supabase (database + auth)
- Groq API — model: llama-3.3-70b-versatile
- Tavily API (live web search for college guidance)
- Resend (automated emails)
- Razorpay (payments — monthly ₹299 + yearly ₹2499)
- ElevenLabs (audio overview — Pro feature)
- Framer Motion (animations)
- Lucide React (icons only — no other icon libraries)
- React Flow (mind maps)
- Recharts (stats charts)
- shadcn/ui (base components)

## API KEYS — ALL IN .env.local
Access via process.env — NEVER hardcode any key anywhere.

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENROUTER_API_KEY   ← all AI calls route through OpenRouter (lib/groq.ts)
TAVILY_API_KEY
RESEND_API_KEY
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_MONTHLY_PLAN_ID
RAZORPAY_YEARLY_PLAN_ID
RAZORPAY_WEBHOOK_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
ELEVENLABS_API_KEY
ELEVENLABS_VOICE_HOST
ELEVENLABS_VOICE_EXPERT
NEXT_PUBLIC_APP_URL

## COLORS — STRICT, DO NOT DEVIATE
- White: #FFFFFF
- Black: #0A0A0A
- Gray light: #F4F4F5
- Gray border: #E5E5E5
- Gray text: #4A4A4A
- Gray muted: #8A8A8A
- NO blue, NO rainbow, NO gradients, NO colored buttons

## TYPOGRAPHY
- Font: Inter (system fallback: -apple-system, sans-serif)
- Mono: JetBrains Mono or Courier New
- All text: sentence case only
- Hero: 80px weight 600
- H1: 56px, H2: 40px, Body: 17px

## FOLDER STRUCTURE
resolvo-ai/
├── app/
│   ├── page.tsx                  ← LANDING PAGE (already built, do not touch)
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── onboarding/page.tsx
│   ├── dashboard/page.tsx
│   ├── studio/page.tsx
│   ├── papers/page.tsx
│   ├── marks/page.tsx
│   ├── mocks/page.tsx
│   ├── stats/page.tsx
│   ├── college/page.tsx
│   ├── schedule/page.tsx
│   ├── settings/page.tsx
│   └── api/
│       ├── create-subscription/route.ts
│       ├── verify-subscription/route.ts
│       ├── razorpay-webhook/route.ts
│       ├── auth/google/route.ts
│       └── auth/google/callback/route.ts
├── components/
│   ├── ui/                       ← shadcn components
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── landing/                  ← landing page components (already built, do not touch)
│   ├── dashboard/
│   ├── studio/
│   ├── college/
│   └── shared/
│       └── PricingModal.tsx
├── lib/
│   ├── supabase.ts
│   ├── groq.ts
│   ├── tavily.ts
│   ├── resend.ts
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useProfile.ts
│   └── useTasks.ts
├── types/
│   └── index.ts
├── public/
│   └── hero-bg.mp4
├── supabase/
│   └── functions/
│       ├── deadline-reminder/
│       ├── exam-reminder/
│       └── weekly-digest/
├── middleware.ts
├── .env.local
└── CLAUDE.md

## DATABASE TABLES (Supabase)
profiles, subjects, tasks, mock_tests, college_profiles,
competitions, subscriptions, user_papers, ai_papers,
flashcards, notes, waitlist

All tables need Row Level Security.
Users can only read/write their own data.
Service role has full access.

## FEATURES

### FREE TIER
- AI study planner (Groq)
- Deadline reminders (email)
- Past papers (links to external sources — no hosting)
- Mark schemes (links to external sources)
- Basic mock tests
- Gmail + Classroom sync
- Studio: slide deck, summary, study guide, flashcards, mind map

### PRO TIER (₹299/month or ₹2,499/year)
- Score predictor on mocks
- Audio overview (ElevenLabs — 2 voices, podcast style)
- College guidance (Groq + Tavily)
- Weekly college newsletter (Resend)
- AI-generated practice papers + mark schemes
- Unlimited generations (free = 5/day)

## APP PAGES

### /dashboard
- Greeting: "Hey [name], how's it going?"
- 4 cards: Connect Gmail, Connect Classroom, Upcoming Deadlines, Exam Countdown
- Subject chips row
- Groq-generated 7-day study plan (3 tasks per day)

### /studio (called "Resolvo Studio")
- Subject picker chips
- File upload (PDF, image, DOCX)
- 6 generate buttons: slide deck, summary, study guide, flashcards, mind map, audio overview (Pro)
- Output renders in page with download + save buttons

### /papers
- Tab 1 Browse: search (subject, year, paper type) → 5 external source cards
  Sources: GCE Guide, Papa Cambridge, Xtremepapers, Dynamic Papers, Save My Exams
  No hosting of papers. Links only.
- Tab 2 My Library: user uploads their own PDFs
- Tab 3 AI Practice (Pro): Groq generates original papers + mark schemes

### /marks
- Same as papers but for mark schemes

### /mocks
- Timer (1 hour default)
- Type answers
- Groq grades against mark scheme
- Returns: score, predicted grade, topic breakdown
- Saves to mock_tests table

### /stats
- 4 stat cards: avg score, predicted grade, streak, tasks completed
- Recharts line chart (mock scores over time)
- Subject progress bars (grayscale)
- Weakest topics card (Groq analysis)

### /college (Pro only)
- Gate: check subscriptions table → if Free show upgrade modal
- First visit: onboarding form (target country, universities, interests, ECs)
- Groq generates: readiness score, strengths, gaps, university matches, 6-month action plan
- Tavily searches: competitions, bootcamps, courses, summer programs
- Weekly email newsletter (Resend every Sunday)

### /schedule
- Generate study schedule button (Groq)
- Generate deadline reminders button
- Send to email button (Resend)

### /settings
- Edit profile
- Subscription info + cancel button
- Notification preferences
- Delete account

## EMAIL AUTOMATION (Supabase Edge Functions + Resend)
1. deadline-reminder — daily 7AM IST: tasks due in 2 days
2. exam-reminder — daily 8AM IST: exams in 7, 3, 1 days
3. weekly-digest — Sunday 6PM IST: progress recap + opportunities (Pro: Tavily results)

All emails: white/black HTML template, Resolvo logo, unsubscribe footer.
Groq personalizes content for every email.

## PAYMENTS (Razorpay)
- Monthly: ₹299/month → RAZORPAY_MONTHLY_PLAN_ID
- Yearly: ₹2,499/year → RAZORPAY_YEARLY_PLAN_ID (show "Save 30%" badge)
- On success: update subscriptions table, confetti animation, redirect to /college
- Webhook handles renewals, cancellations, expirations

## RULES — ALWAYS FOLLOW
1. TypeScript only — no .js files in app/ or components/
2. Tailwind only — never write custom CSS
3. Lucide React icons only
4. Every page mobile responsive (375px minimum)
5. Loading skeletons on every data-fetching page
6. Error boundaries on every page
7. Never use 'any' — type everything properly
8. Always handle Supabase errors before using data
9. Never log API keys to console
10. Never commit .env.local to git
11. Run npm run build after each phase to catch errors
12. DO NOT redesign or touch app/page.tsx (landing page)

## CURRENT STATUS
Landing page: ✅ DONE (do not touch)
Everything else: ⏳ BUILD THIS

## BUILD ORDER (follow strictly)
Phase 1: Supabase schema + migrations
Phase 2: Auth (signup, login, onboarding, middleware)
Phase 3: App layout + sidebar
Phase 4: Dashboard + AI sidekick
Phase 5: Resolvo Studio
Phase 6: Past papers + mark schemes + mocks
Phase 7: Stats page
Phase 8: College guidance (Pro)
Phase 9: Email automation (Edge Functions)
Phase 10: Razorpay payments
Phase 11: Polish (mobile, loading states, error handling)