# Ubora World

Live status: **Criminology and Security Studies is fully built for 100L (both
semesters bar one course) and has begun on 200L.** Five faculties and 39
departments exist in the live database, with GST courses automatically
visible to all of them. Pilot launch is scoped to Criminology.

**For the full, current status of every course, faculty, and open item,
see [`HANDOVER.md`](./HANDOVER.md) — that file is the living source of
truth and is kept up to date after every batch of work. This README covers
local setup and how the codebase fits together; it does not track
day-to-day course-building progress.**

## What's real right now

- Real signup/login (passwords hashed, sessions via NextAuth)
- Real PostgreSQL database via Prisma — **note: the live Neon database is
  the only database this project uses; there is no separate local/staging
  database. Running `npm run dev` locally with the project's `.env`
  connects directly to production data.**
- Server-side tier gating (a student can't reach premium content by
  guessing a URL) — see `lib/access.ts`, which re-checks subscription
  `endDate` live on every request rather than trusting a possibly-stale
  `status` field
- A real CBT engine: randomized question/option order, server-side scoring,
  immutable attempts, config-driven grade bands
- Content approval workflow, live and in active use at `/admin/content` —
  content is seeded in `draft` status and never served to students until
  explicitly approved there
- Course summaries stored as raw bytes in the database (`Summary.fileData`),
  served only through an authenticated, subscription-gated API route —
  never a public file path
- Multiple full course libraries built from real NOUN course guides for
  Criminology and Security Studies (both semesters of 100L, plus the start
  of 200L) — see HANDOVER.md for the complete course list
- A full faculty/department structure: 5 faculties, 39 departments, with
  GST courses (`isGST: true`) appearing automatically for every department
  with no manual linking required

## Deliberately not built yet

- **Live payments** — Paystack is still in test mode. No real money can be
  collected until the live secret key is wired in.
- **Custom domain** — still on the default Vercel domain.
- **Course-specific content for the four newer faculties** (Computing,
  Sciences, Management Sciences, Education) — their departments exist and
  automatically show GST courses, but no department-specific courses have
  been built for them yet.
- Agent portal, tutorials, admissions requests, result checker — schema
  models exist (`Agent`, `Referral`, `Commission`, `Payout`,
  `TutorialContent`, `AdmissionRequest`, `ResultCheckerToken`) but have no
  UI or routes built against them yet.

## Local setup

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Get the `.env` file** with the live `DATABASE_URL`, `NEXTAUTH_SECRET`,
   `NEXTAUTH_URL`, and `PAYSTACK_SECRET_KEY` from whoever last had it —
   **do not paste these values into any chat tool or public location**, the
   Neon database password has been exposed once already this project and
   should be treated as sensitive.
3. **Run the app**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000/login` and log in with:
   - Student: `demo.student@uboraworld.test` / `Password123!`
   - Admin: `demo.admin@uboraworld.test` / `Admin123!`
4. **To inspect or edit data directly** (e.g. check content approval
   status, look up a department ID before writing a script):
   ```bash
   npm run db:studio
   ```
   This opens a browser-based database editor. Remember: this points at
   the same live database as everything else — there is no sandbox copy.

## Course-building pattern

Every course added to this project follows the same repeatable pattern —
see any `seed-<code>.js` file in `prisma/seed-data/` for a working example:

1. Look up the owning department by its **confirmed live ID** (never by
   name, and never auto-create the department) — this avoids the
   duplicate-department bug documented in `seed-css133.js`'s comments.
2. Look up or create the `Course` row.
3. Look up or create a single `QuestionBank` in `draft` status
   (dedup-guarded — never creates a second bank for the same course).
4. Read CBT questions from CSVs named `<CODE>_CBT_Bank_Module<N>.csv` in
   the same folder, upserting `Question` rows.
5. A matching `add-<code>-summary.js` script (in the project root) reads a
   summary PDF from the git-ignored `private-uploads/` folder and stores
   its raw bytes in `Summary.fileData`.
6. **After seeding any course — even one owned directly by its home
   department — run `node crosslist-courses.js`.** This backfills the
   `CourseDepartment` join table, which is what actually makes a course
   appear in the app. Skipping this step is a documented mistake that has
   happened before; the course will silently not show up without it.
7. If the course is a service course taught outside its owning department
   (e.g. ECO121 taught to Criminology students), add it to the
   `CROSS_LISTINGS` array in `crosslist-courses.js` before running step 6.
8. Approve the new `QuestionBank` and `Summary` at `/admin/content`.

## What to build next

See HANDOVER.md's "What's Still Open" section for the current priority
list. In short: more course content (CSS136 and further 200L Criminology
courses are the immediate priority), then live Paystack keys, then a
custom domain, then course content for the other four faculties.
