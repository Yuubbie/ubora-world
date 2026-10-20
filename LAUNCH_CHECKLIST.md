# Launch Checklist — 18 October 2026

Status snapshot taken from the live database and a clean production build.

## Content readiness (done)

| Item | Status |
|---|---|
| Courses live | 52 |
| CBT questions | 5,348 |
| Summaries | 52 (51 approved, 1 draft) |
| Question banks not approved | 0 |
| Courses with no question bank | 0 |
| Typecheck (`npx tsc --noEmit`) | clean |
| Production build (`npm run build`) | compiled successfully |

Courses built from the 36-guide ZIP: all 36. Nothing from that upload is outstanding.

---

## P0 — must happen before launch

### 1. Paystack is still in test mode
`.env` has an `sk_test` secret key in use. No real card will be charged.

- [ ] Paystack dashboard → Settings → API Keys & Webhooks → copy **live** secret and public keys
- [ ] Paystack dashboard → set Webhook URL to `https://<your-domain>/api/payments/webhook`
- [ ] Set `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY` in Vercel → Project → Settings → Environment Variables (Production)
- [ ] Redeploy so the new env vars take effect
- [ ] Run one real low-value transaction end to end and confirm `/dashboard` unlocks

The webhook rejects unsigned calls (`app/api/payments/webhook/route.ts`), so a wrong
secret key means payments succeed at Paystack but no subscription is ever created.

### 2. `NEXTAUTH_URL` must be the production URL
`.env` currently points `NEXTAUTH_URL` at localhost. Payment callbacks are built from
it (`app/api/payments/initialize/route.ts`), so a localhost value sends paying users to
a dead page after checkout.

- [ ] Set `NEXTAUTH_URL=https://<your-domain>` in Vercel Production env
- [ ] Confirm `NEXTAUTH_SECRET` is set in Vercel Production env
- [ ] Log out and back in on the deployed site to confirm sessions work

### 3. Approve the new CSC 103 summary
Created as a draft today: summary id `cmvea7h9q0001x676eimfxmbr` (2 pages, 5,267 bytes).

- [ ] `/admin/content` → approve the CSC 103 summary
- [ ] Spot-check that the PDF downloads and renders

### 4. CSC 103 is a stub course — decide before launch
It is the only course without a full bank: 5 questions, stored in three duplicate
approved banks, with no module numbers and no explanations. The CBT route serves the
first approved bank, so a student who opens CSC 103 gets **5 questions**. No CSC 103
course guide exists in the workspace, so a proper 100-question bank cannot be grounded
in source material yet.

Pick one:
- [ ] (a) Send the CSC 103 course guide and I build the full 100-question bank, or
- [ ] (b) I unlink CSC 103 from the Computer Science listing so students do not see it
      until the guide arrives (no data deleted, easily re-linked), or
- [ ] (c) Launch as-is knowing CSC 103 offers only 5 questions

### 5. Subscription expiry — job run; cron still needs CRON_SECRET on Vercel
Ran `npm run db:expire-subscriptions` on 19 Oct 2026: **9 past-due subscriptions
marked expired**. 6 remain genuinely active. No remaining active-but-past-endDate
rows.

Wired:
- `lib/expireSubscriptions.ts` — shared helper
- `GET/POST /api/cron/expire-subscriptions` — Bearer `CRON_SECRET` required
- `vercel.json` cron at `0 1 * * *` (01:00 UTC daily)

Still needed before the schedule actually fires in production:
- [x] Run once now: `npm run db:expire-subscriptions` (done, 9 expired)
- [ ] Set `CRON_SECRET` in Vercel Production env (any long random string)
- [ ] Redeploy so `vercel.json` cron and the new route are live
- [ ] Confirm Vercel Cron hits `/api/cron/expire-subscriptions` with Authorization: Bearer <CRON_SECRET>

---

## P1 — do this week, not launch-day

- [ ] **CSS136** — the only missing second-semester Criminology course. Never in any
      supplied batch. Second-semester Criminology is 7 of 8 without it.
- [ ] **Custom domain** — still on the default `*.vercel.app` URL. Buying and pointing
      the domain is faster before launch than after, because payment webhooks and
      `NEXTAUTH_URL` both need to be updated when the domain changes.
- [ ] **PWA install test** on a real Android and iOS device (add to home screen, launch,
      log in, take a CBT test).
- [ ] **Inquiry inbox** — `/admin/inquiries` works, WhatsApp is not wired.
- [ ] **Content sign-off** — spot-check two or three approved courses as a student
      account: bank loads, timer works, explanations show, summary downloads.

---

## P2 — after launch

- [ ] Push the backup scripts for the last 13 courses to `upstream/main` (currently
      uncommitted: ECO153/154/231/232/247/253/255/256, ENT204, PCR113, PCR211, POL223,
      CSC103 summary scripts and CSVs). Content itself is already live in the database;
      this is repo backup only.
- [ ] Rotate the Neon database password and the Paystack key that were pasted into a
      chat on 2 Sep 2026.
- [ ] Review the duplicate CSC 103 banks once the guide arrives and consolidate them.

---

## Verified launch metrics

- 52 courses, 45 department-owned across 12 departments, 7 GST
- 5,348 questions, 52 summaries
- 7 user accounts (1 admin, 6 students)
- 6 genuinely active subscriptions; 9 expired by the 19 Oct 2026 job
- 48 CBT attempts recorded
