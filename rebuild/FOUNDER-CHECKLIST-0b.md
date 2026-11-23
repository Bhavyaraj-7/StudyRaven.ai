# Founder checklist: Phase 0b

These are things only you can do (dashboards, decisions, people). Claude can't change any of them.

## A. Before merging the Phase 0b PR
1. **Name the legal operator.** In `lib/site.ts`, fill in `operator` (the person or company that holds the Razorpay merchant account) and `operatorCity` (used for governing law). Until then, the legal pages show "[to be confirmed]". Or just tell Claude the values.
2. **Get the four drafts reviewed** by a parent, and ideally a lawyer: `content/legal/privacy.md`, `terms.md`, `refunds.md`, `contact.md`. Each one says DRAFT at the top.
   - Check the two promises in the drafts: replying to privacy requests within 7 days, and deleting accounts within 30 days.
3. **Contact email.** It's still `bsingh10@jpischool.com`, as you chose. When a role address works (e.g. support@studyravenai.com), change `contactEmail` in `lib/site.ts`. That one line updates every page.
4. **Razorpay:** check whether your merchant account also needs a postal address and phone number on `/contact`.

## B. Custom email (SMTP): needed before Phase 1b sign-in work
Supabase's built-in email only sends a handful of emails an hour, and Resend's fallback sender only reaches your own inbox.
1. **Resend → Domains → Add domain:** `studyravenai.com`.
2. **Add the DNS records Resend shows you** (SPF and DKIM) wherever your domain's DNS is managed. Wait until the domain shows **Verified**.
3. **Add a DMARC record:** type `TXT`, name `_dmarc`, value `v=DMARC1; p=none; rua=mailto:<your email>`.
4. **Resend → API Keys → Create:** name `supabase-smtp`, permission *Sending access*, domain `studyravenai.com`.
5. **Supabase → Authentication → Emails → SMTP Settings → Enable custom SMTP** with these values:

   | Field | Value |
   |---|---|
   | Sender email | `no-reply@studyravenai.com` |
   | Sender name | `StudyRaven` |
   | Host | `smtp.resend.com` |
   | Port | `465` (if password-reset emails fail, try `587`) |
   | Username | `resend` |
   | Password | the API key from step 4 |

6. **Vercel → Settings → Environment Variables (Production):** set `RESEND_FROM_EMAIL` = `StudyRaven <no-reply@studyravenai.com>`, then redeploy.
7. **Supabase → Edge Functions → Secrets:** set the same `RESEND_FROM_EMAIL`.
8. **Test it:** sign up with a new email and check the inbox (and spam). Then try "Forgot password".

## C. Speed: 5 minutes
- **Vercel → Settings → Functions → Function Region → Tokyo, Japan (hnd1) → Save → Redeploy.** Your database is in Tokyo, but the server code runs in the US, so every database call crosses the Pacific.

## D. Answers Claude still needs
1. Are the 4 email jobs scheduled in Supabase (deadline, exam, abandoned-mock, weekly digest)? If yes, "email reminders" can go back into the landing copy.
2. **Vercel plan.** Hobby is for non-commercial use only, and StudyRaven takes payments. Pro costs about $20/month. Your call.
3. **Supabase plan.** The Free plan has no backups and can pause projects (you saw "paused" earlier). Pro costs about $25/month. Your call.
4. **Self-granted Pro check.** Run `select user_id, razorpay_id, current_period_end from subscriptions where plan = 'pro';` and compare it with Razorpay. Tell Claude about any fakes.
5. **Remotion licence:** how many people work on StudyRaven (4 are listed on the site)?
6. **OpenRouter → Settings → Privacy:** is "allow providers that may train on inputs" turned **off**?
7. **A test account** (email and password) so Claude can measure the logged-in pages.
