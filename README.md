# Ubora World — Phase 1

This is Phase 1 of the build, exactly as scoped in the Master Build Specification
(Section 12): **Auth + Subscription (schema only, no live payment yet) + one
faculty's content (Summaries + Past Questions) + CBT engine.**

Every business rule in this code is implemented exactly as written in the
spec's Section 6 — see the comments in `lib/config.ts`, `lib/access.ts`, and
the API routes for the exact spec section each rule maps to.

## What's real vs. what's next

**Working now:**
- Real signup/login (passwords hashed, sessions via NextAuth)
- Real PostgreSQL database via Prisma
- Server-side tier gating (a student can't reach premium content by guessing a URL)
- A real CBT engine: randomized question/option order, server-side scoring
  (the client never computes its own score), immutable attempts, config-driven
  grade bands
- Content approval workflow enforced at the data level (`status: draft` is
  never served to a student)
- Course summaries and past questions, gated by subscription tier

**Deliberately not built yet (per the spec's phase order):**
- Real payments (Paystack) — subscriptions are currently created manually via
  the seed script. Phase 2.
- Admin CMS UI for approving content — right now you approve content by
  editing the database directly (via `npx prisma studio`) or extending the
  seed script. Phase 2.
- Agent portal, tutorials, admissions requests, result checker — Phases 3–6.

## Local setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Get a PostgreSQL database.** Fastest options: [Neon](https://neon.tech),
   [Supabase](https://supabase.com), or [Railway](https://railway.app) all have
   free tiers and give you a connection string in under a minute. Or run
   Postgres locally if you already have it.

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in `DATABASE_URL` with your real connection string, and generate a
   `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

4. **Create the database tables**
   ```bash
   npm run db:migrate
   ```
   This will prompt you to name the migration — call it `init`.

5. **Seed demo data** (one faculty, CSC 103, an approved question bank, a
   summary, a past question set, and a demo student with an active
   subscription)
   ```bash
   npm run db:seed
   ```

6. **Run the app**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000/login` and log in with:
   - Email: `demo.student@uboraworld.test`
   - Password: `Password123!`

7. **To inspect or edit data directly** (e.g. approve new content, create a
   new subscription):
   ```bash
   npm run db:studio
   ```
   This opens a browser-based database editor.

## What to build next

Follow the Master Build Specification's Section 12 phase order:
- **Phase 2**: wire Paystack into the `Subscription`/`Payment` models
  (schema already supports it), build the scheduled job for subscription
  expiry (Spec 6.1 rule 3), and build a real Admin CMS UI for the content
  approval workflow (Spec 4.9).
- **Phase 3**: Agent Portal (`Agent`, `Referral`, `Commission`, `Payout`
  models already exist in the schema, unused so far).

Come back to me with "build Phase 2" and we'll continue from exactly here.
 
Testing preview deploy workflow 
