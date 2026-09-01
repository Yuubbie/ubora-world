# Ubora World — Handover / Project Status

Last updated: 2026-09-01

This file is the source of truth for where the project actually stands.
The root `README.md` describes Phase 1 only and is out of date — don't
follow its "what to build next" section, follow this file instead.

## Stack

- **Framework**: Next.js 16 (App Router), React 19
- **Auth**: NextAuth 4 (credentials provider, bcrypt-hashed passwords)
- **DB**: PostgreSQL via Prisma 5
- **Payments**: Paystack (test mode wired up, live keys not yet added)
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Deploy**: Vercel (main branch auto-deploys; a `dev` branch also exists
  remotely but has no unmerged commits — safe to ignore or delete)

## Actual current status (not what the README says)

The README describes "Phase 1" (auth + schema-only subscriptions + one
faculty's content). That's stale. Phase 2 has already been built and merged
in (see `PHASE2_INSTRUCTIONS.md` for what it added). Real status:

**Built and working:**
- Auth (signup/login, NextAuth sessions, bcrypt passwords)
- Real Paystack payments (test mode) — initialize, verify, webhook routes
  all exist under `app/api/payments/`
- Subscription tier gating enforced server-side
- CBT engine: randomized question/option order, server-side scoring,
  immutable attempts, config-driven grade bands
- Admin content-approval queue at `/admin/content` (real UI, not just
  Prisma Studio)
- Course summaries served via authenticated API route reading from the DB
  (not public static files — this was a deliberate security fix, see
  commits `501ec81` and `24c0632`)
- Multiple courses fully seeded with content: GST101, GST102, GST103,
  GST105, GST107, CSS111, CSS121, CSS133 — each with a question bank and
  a course summary
- Faculty/department browsing for both CBT practice and summaries
- Waitlist signup flow

**Schema exists but NOT built out (no UI/routes yet):**
- `Agent`, `Referral`, `Commission`, `Payout` — Agent Portal (Phase 3 per
  original spec)
- `TutorialContent` — Tutorials feature
- `AdmissionRequest` — Admissions requests feature
- `ResultCheckerToken` — Result checker feature

These four are real Prisma models sitting unused. Don't recreate them —
extend them.

**Known-fixed issues worth knowing about (so they don't get reintroduced):**
- Summary PDFs were originally served from public static paths — this was
  a security hole (anyone with the URL could access paid content without
  auth). Fixed by moving to DB-stored `fileData` served through an
  authenticated route. If you ever add new content types, follow this
  pattern, not the old one.
- There was a caching bug that let unauthenticated users hit summary PDFs
  even after the auth fix — fixed in `24c0632`. Worth regression-testing
  after any changes to caching headers or route config on content routes.
- There was a separate caching bug on the admin content-approval page
  showing stale data — fixed in `bcf6d21`.

## Environment variables

See `.env.example` for the full list. Required:
- `DATABASE_URL` — Postgres connection string
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`
- `PAYSTACK_SECRET_KEY` — test key (`sk_test_...`) from the Paystack
  dashboard; needed for the subscribe flow to work at all

## Local setup

```bash
npm install
cp .env.example .env   # then fill in real values
npm run db:migrate
npm run db:seed
npm run dev
```

Demo logins (from seed data):
- Student: `demo.student@uboraworld.test` / `Password123!`
- Admin: `demo.admin@uboraworld.test` / `Admin123!`

## Content authoring pattern

Course content (summaries, question banks) has been added course-by-course
via one-off scripts at the repo root (`add-gst101-summary.js`,
`add-css111-summary.js`, etc.) and in `prisma/seed-data/`. These are ad hoc,
not a reusable pipeline — if more courses need to be added regularly, this
is a good candidate for consolidating into a single script or admin UI
rather than continuing to write a new one-off file per course.

## Subscription expiry

There's a scheduled-job script (`scripts/expireSubscriptions.ts`, run via
`npm run db:expire-subscriptions`) that handles subscription expiry per the
original spec's business rule. Confirm whether this is actually being run
on a schedule (e.g. a Vercel cron job or external scheduler) — a script
existing in the repo doesn't mean it's being executed anywhere.

## What's next (in rough priority order)

1. Decide whether Agent Portal, Tutorials, Admissions, or Result Checker
   is the next feature — schemas exist for all four but no routes/UI.
2. Move Paystack from test to live keys when ready to accept real payments.
3. Consider consolidating the course-content-authoring scripts into a
   single reusable tool if more courses are coming.
4. Confirm/set up the subscription-expiry cron job if not already running.
5. Delete or merge the stale `origin/dev` branch to reduce confusion.
