# Ubora World — Handover / Status Document

**Last updated:** 10 October 2026
**Purpose:** single source of truth for what's built, what's live, and what's still open. Check this anytime you need to know where things stand.

---

## 1. Big Picture Status

Ubora World is **ready for pilot launch**, scoped to the Criminology and Security Studies department.

- First semester Criminology: **10 of 10 courses live and approved**
- Second semester Criminology: **7 of 8 courses live and approved** (CSS136 outstanding)
- Faculty/department structure: **5 faculties, 39 departments live**, with GST courses automatically visible to every one of them once approved
- Payments: **still in Paystack TEST mode** — no real money can be collected yet
- Domain: **still on default Vercel domain**, not a custom domain yet

---

## 2. Courses — Criminology and Security Studies

### First Semester (100L) — 10 of 10 complete
| Code | Title | Owner Dept | Cross-listed? |
|---|---|---|---|
| GST101 | Use of English and Communication Skills I | GST (all depts) | auto |
| GST103 | (GST course) | GST (all depts) | auto |
| GST105 | History and Philosophy of Science | GST (all depts) | auto |
| GST107 | A Study Guide for the Distance Learner | GST (all depts) | auto |
| CSS111 | Introduction to Sociology | Criminology | owner |
| CSS121 | Introduction to Psychology | Criminology | owner |
| CSS133 | Introduction to Criminology I | Criminology | owner |
| POL111 | (Political Science course) | Political Science | cross-listed |
| ECO121 | Principles of Economics | Economics | cross-listed |
| PCR111 | Introduction to Peace Studies | Peace and Conflict Resolution | cross-listed |

### Second Semester (100L) — 7 of 8 complete
| Code | Title | Owner Dept | Cross-listed? | Status |
|---|---|---|---|---|
| GST102 | (GST course) | GST (all depts) | auto | ✅ live |
| CIT104 | Introduction to Computers | Computer Science (Faculty of Computing) | cross-listed | ✅ live |
| CSS112 | Sociology of Law | Criminology | owner | ✅ live |
| CSS132 | Ethnography of Nigeria | Criminology | owner | ✅ live |
| CSS134 | Geography of Nigeria | Criminology | owner | ✅ live |
| POL126 | Citizen and the State | Political Science | cross-listed | ✅ live |
| PCR114 | Introduction to Conflict Resolution Processes II | Peace and Conflict Resolution | cross-listed | ✅ live |
| **CSS136** | **(unknown — pending)** | Criminology | owner | ❌ **not yet built — waiting on Eunice** |

Each completed course has: a CBT question bank (draft → approved), a downloadable PDF summary (draft → approved), and — where owned by another department — a `CourseDepartment` cross-listing row into Criminology.

### GST203 — live (4 Oct 2026)

| Code | Title | Status |
|---|---|---|
| GST203 | Introduction to Philosophy and Logic | **approved** — 122 questions (5 modules), 5-page summary. `isGST: true`, no `departmentId`. Do **not** run `crosslist-courses.js`. |

Scripts: `prisma/seed-data/seed-gst203.js` + `GST203_CBT_Bank_Module1-5.csv`; `add-gst203-summary.js` (PDF in `private-uploads/gst203-summary.pdf`, gitignored). Visible to every department because it is GST.

### ENT101 — live (5 Oct 2026)

| Code | Title | Owner Dept | Status |
|---|---|---|---|
| ENT101 | Introduction to Entrepreneurship | Entrepreneurship (Faculty of Management Sciences) | **approved** — 98 questions (4 modules), 4-page summary. 100L first semester. Own-department `CourseDepartment` backfilled. Do **not** add to `CROSS_LISTINGS`. |

Scripts: `prisma/seed-data/seed-ent101.js` + `ENT101_CBT_Bank_Module1-4.csv`; `add-ent101-summary.js` (PDF in `private-uploads/ent101-summary.pdf`, gitignored). First department-owned course for Entrepreneurship. CSS136 is not in the current ZIP.

### BUS105 — live (6 Oct 2026)

| Code | Title | Owner Dept | Status |
|---|---|---|---|
| BUS105 | Element to Management 1 | Business Administration (Faculty of Management Sciences) | **approved** — 104 questions (4 modules), 4-page summary. 100L first semester. Own-department `CourseDepartment` backfilled. Do **not** add to `CROSS_LISTINGS`. |

Scripts: `prisma/seed-data/seed-bus105.js` + `BUS105_CBT_Bank_Module1-4.csv`; `add-bus105-summary.js` (PDF in `private-uploads/bus105-summary.pdf`, gitignored). First department-owned course for Business Administration.

### BUS106 — live (6 Oct 2026)

| Code | Title | Owner Dept | Status |
|---|---|---|---|
| BUS106 | Elements of Management II | Business Administration (Faculty of Management Sciences) | **approved** — 81 questions (3 modules), 3-page summary. 100L second semester. Own-department `CourseDepartment` backfilled. Do **not** add to `CROSS_LISTINGS`. |

Scripts: `prisma/seed-data/seed-bus106.js` + `BUS106_CBT_Bank_Module1-3.csv`; `add-bus106-summary.js` (PDF in `private-uploads/bus106-summary.pdf`, gitignored). Second department-owned course for Business Administration.

### BUS205 — live (6 Oct 2026; approved 6 Oct 2026)

| Code | Title | Owner Dept | Status |
|---|---|---|---|
| BUS205 | Introduction to Business | Business Administration (Faculty of Management Sciences) | **approved** — 78 questions (3 modules: 25/25/28), 4-page summary. 200L first semester. Own-department `CourseDepartment` backfilled. Do **not** add to `CROSS_LISTINGS`. |

Scripts: `prisma/seed-data/seed-bus205.js` + `BUS205_CBT_Bank_Module1-3.csv`; `add-bus205-summary.js` (PDF in `private-uploads/bus205-summary.pdf`, gitignored). Third department-owned course for Business Administration. Course guide: Koce Henry Diko, first printed 2009, ISBN 978-058-187-1, 16 units in 3 modules. Bank `cmux515980003f7t710woz6tx`; summary `cmux51zcs0001gkh4nt8hr1u4`.

### BUS207 — live (6 Oct 2026; approved 6 Oct 2026)

| Code | Title | Owner Dept | Status |
|---|---|---|---|
| BUS207 | Business Communication | Business Administration (Faculty of Management Sciences) | **approved** — 100 questions (4 modules: 25/25/25/25), 4-page summary. 200L second semester. Own-department `CourseDepartment` backfilled. Do **not** add to `CROSS_LISTINGS`. |

Scripts: `prisma/seed-data/seed-bus207.js` + `BUS207_CBT_Bank_Module1-4.csv`; `add-bus207-summary.js` (PDF in `private-uploads/bus207-summary.pdf`, gitignored). Fourth department-owned course for Business Administration. Course guide: Mrs. Eunice Adegbola, editor Dr. (Mrs) Rahila Gowon. Bank `cmux5e6vj0003vxn0pg11rofa`; summary `cmux5fx3l0001diy1alg2nv09`.

### ACC203 — live (6 Oct 2026; approved 6 Oct 2026)

| Code | Title | Owner Dept | Status |
|---|---|---|---|
| ACC203 | Introduction to Financial Accounting I | Accounting (Faculty of Management Sciences) | **approved** — 100 questions (4 modules: 25 each), 4-page summary. 200L first semester. Own-department `CourseDepartment` backfilled. Do **not** add to `CROSS_LISTINGS`. |

Scripts: `prisma/seed-data/seed-acc203.js` + `ACC203_CBT_Bank_Module1-4.csv`; `add-acc203-summary.js` (PDF in `private-uploads/acc203-summary.pdf`, gitignored). First department-owned course for Accounting. Writer Dr Onafowokan Oluyombo (FCA); editor Dr Chijioke Mgbame. 21 study units. Bank `cmux5nvvu0003qbewp16tp6vn`; summary `cmux5p00p00017eef7dk50srw`.

### ACC204 — live (7 Oct 2026; approved 10 Oct 2026)

| Code | Title | Owner Dept | Status |
|---|---|---|---|
| ACC204 | Introduction to Financial Accounting II | Accounting (Faculty of Management Sciences) | **approved** — 100 questions (4 modules: 25 each), 4-page summary. 200L second semester. Own-department `CourseDepartment` backfilled. Do **not** add to `CROSS_LISTINGS`. |

Scripts: `prisma/seed-data/seed-acc204.js` + `ACC204_CBT_Bank_Module1-4.csv`; `add-acc204-summary.js` (PDF in `private-uploads/acc204-summary.pdf`, gitignored). Second Accounting-owned course. Writer Dr Osamuyimen Egbon (ACA); editor Dr Joshua Okpanachi. 21 study units grouped into 4 CBT modules. Bank `cmuye3t9s0003y9btoogqfoso`; summary `cmuye500r0001gwkcgodzy9zb`.

### BFN209 — live (8 Oct 2026; approved 10 Oct 2026)

| Code | Title | Owner Dept | Status |
|---|---|---|---|
| BFN209 | Introduction to Finance | Banking and Finance (Faculty of Management Sciences) | **approved** — 100 questions (3 modules: 33/32/35), 4-page summary. 100L first semester. Own-department `CourseDepartment` backfilled. Do **not** add to `CROSS_LISTINGS`. |

Scripts: `prisma/seed-data/seed-bfn209.js` + `BFN209_CBT_Bank_Module1-3.csv`; `add-bfn209-summary.js` (PDF in `private-uploads/bfn209-summary.pdf`, gitignored). First Banking and Finance-owned course. Editor Dr. I.D. Idrisu; coordinator Mrs. Kunbi Lawal. 15 study units in 3 modules. Bank `cmuzqxrfd00032dy1s19kf4km`; summary `cmuzqyu2s0001x1ecxd9yseep`.

### CRD204 — live (8 Oct 2026; approved 10 Oct 2026)

| Code | Title | Owner Dept | Status |
|---|---|---|---|
| CRD204 | Man & His Environment | Cooperative and Rural Development (Faculty of Management Sciences) | **approved** — 100 questions (3 modules: 33/32/35), 4-page summary. 200L second semester. Own-department `CourseDepartment` backfilled. Do **not** add to `CROSS_LISTINGS`. |

Scripts: `prisma/seed-data/seed-crd204.js` + `CRD204_CBT_Bank_Module1-3.csv`; `add-crd204-summary.js` (PDF in `private-uploads/crd204-summary.pdf`, gitignored). First Cooperative and Rural Development-owned course. Writer Dr. Ogunlana, F.O. (LASU); editor Prof. Grace Joktang. 15 study units in 3 modules. Bank `cmuzs4xm00003s7yodentpxo0`; summary `cmuzs5z740001me6q8i88e1iw`.

### CRD208 — live (10 Oct 2026; approved 10 Oct 2026)

| Code | Title | Owner Dept | Status |
|---|---|---|---|
| CRD208 | Nigerian & International Cooperatives | Cooperative and Rural Development (Faculty of Management Sciences) | **approved** — 100 questions (3 modules: 33/32/35), 4-page summary. 200L second semester. Own-department `CourseDepartment` backfilled. Do **not** add to `CROSS_LISTINGS`. |

Scripts: `prisma/seed-data/seed-crd208.js` + `CRD208_CBT_Bank_Module1-3.csv`; `add-crd208-summary.js` (PDF in `private-uploads/crd208-summary.pdf`, gitignored). Second Cooperative and Rural Development-owned course. Writer Lawal Kamaldeen, A. A. Ph.D (NOUN Entrepreneurship); editor Prof. J.O.Y Aihonsu (OOU). 16 study units in 3 modules. Bank `cmv1ufy130003dbspgx8ctowu`; summary `cmv1uhj1w0001h2lvwt63otvd`.

---

## 3. Faculty / Department Structure

As of 3 Sep 2026, **5 faculties and 39 departments** exist in the live database.

| Faculty | # Depts | Departments |
|---|---|---|
| **Faculty of Social Science** | 8 | Criminology and Security Studies, Economics, Political Science, International Relations and Diplomacy, Mass Communication, Peace and Conflict Resolution, Tourism, Development Studies |
| **Faculty of Computing** | 3 | Computer Science, Information Technology, Cybersecurity |
| **Faculty of Sciences** | 6 | Biology, Chemistry, Environmental Science and Resource Management, Mathematics, Maths and Computer Science, Physics |
| **Faculty of Management Sciences** | 7 | Accounting, Banking and Finance, Business Administration, Cooperative and Rural Development, Entrepreneurship, Marketing, Public Administration |
| **Faculty of Education** | 15 | B.A.(ED) Early Childhood Education, B.A.(ED) English, B.A.(ED) French, B.A.(ED) Primary Education, B.LIS Library and Information Science, B.Sc.(ED) Agricultural Science, B.Sc.(ED) Biology, B.Sc.(ED) Business Education, B.Sc.(ED) Chemistry, B.Sc.(ED) Computer Science, B.Sc.(ED) Health Education, B.Sc.(ED) Human Kinetics, B.Sc.(ED) Integrated Science, B.Sc.(ED) Mathematics, B.Sc.(ED) Physics |

**Important note on GST auto-coverage:** GST courses use `isGST: true` with no `departmentId`, so they appear automatically for *every* department that exists — no manual linking needed. Live/approved GSTs shown to all departments: GST101/102/103/105/107, GST202 (if already approved), and GST203 (approved 4 Oct 2026).

**Structural fix made this session:** the original "Computer Science" department (created in Phase 1, holding CIT104 and the demo course CSC103, plus 18 real recorded student attempts) was originally mis-attached to "Faculty of Sciences". This was corrected — the department was re-parented to the new "Faculty of Computing" without touching its id, its courses, or any student data.

**Confirmed department/faculty IDs** (for scripting, avoid recreating duplicates):
```
CRIMINOLOGY:        cms7arwzd0002sgbyyjev2dn1
ECONOMICS:          cms7arxjf0004sgbyb4vqx8et
POLITICAL_SCIENCE:  cms7arxwt0006sgbyf5hcu000
IRD:                cms7arya80008sgby1960omt7
MASS_COMM:          cms7arynn000asgby18h13uty
PCR:                cms7arz16000csgby9l8g60gw
TOURISM:            cms7arzef000esgby3zl6aotz
DEV_STUDIES:        cms7arzrt000gsgbybgjlmkqc
COMPUTER_SCIENCE:   cmrcnngy20002100ylo7snl5m  (dept, now under Faculty of Computing)
FACULTY_OF_SCIENCES: cmrcnnf7s0000100yyz1y2dw2 (faculty id)
```
Faculty of Computing, Faculty of Management Sciences, and Faculty of Education were created fresh this session — their ids are in the live DB but not hardcoded anywhere; look them up via `prisma.faculty.findUnique({ where: { name: '...' } })` if needed.

---

## 4. Key Scripts (all in project root or `prisma/seed-data/`)

- **`crosslist-courses.js`** — backfills each course's own-department link, plus cross-lists service courses (POL111, ECO121, PCR111, CIT104, POL126, PCR114 → Criminology) into Criminology. **Must be run after seeding any new course**, even ones owned directly by Criminology — this is not optional, it's how courses actually become visible in the app. Always supports `--dry-run`.
- **`setup-faculties-computing-sciences-mgmt-education.js`** — one-time setup script (already run) that created the 3 new faculties, re-parented Computer Science, and created all 39 departments' Department rows. Safe to re-run (idempotent) if ever needed.
- **`seed-<code>.js`** (in `prisma/seed-data/`) — one per course, seeds CBT questions from CSVs. Pattern: look up department by confirmed ID (never auto-create), look up/create Course, look up/create one QuestionBank (dedup-guarded), upsert Questions from CSV.
- **`add-<code>-summary.js`** (in project root) — one per course, reads a summary PDF from `private-uploads/` and stores its raw bytes in `Summary.fileData` (never a public file path — served only via the authenticated `/api/summaries/[id]` route).

---

## 5. Known-Fixed Security Issues (carried over from Phase 1/2)
- Summaries served via authenticated API, not public paths — commits `501ec81`, `24c0632`
- Stale cache on admin approval page — commit `bcf6d21`

## 6. Env Vars Required
`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `PAYSTACK_SECRET_KEY`

**⚠️ Security note:** the live `DATABASE_URL` (Neon Postgres) and a Paystack key were pasted into a chat session on 2 Sep 2026. Recommended: rotate the Neon database password and regenerate the Paystack key from their respective dashboards, even though the Paystack key was test-mode.

## 7. Demo Logins
- Student: `demo.student@uboraworld.test` / `Password123!`
- Admin: `demo.admin@uboraworld.test` / `Admin123!`

## 8. Database
Live Neon Postgres instance (`ep-old-king-as9a3w8y.c-4.eu-central-1.aws.neon.tech`). **Your local `.env` points directly at this live database** — running `npm run dev` locally and using `/admin/content` on `localhost:3000` edits production data directly. There is no separate local/staging database.

---

## 9. What's Still Open Before Full Pilot Launch

1. Inquiry inbox is at `/admin/inquiries` (WhatsApp not wired yet). Content queue is empty — no remaining drafts.
2. **CSS136** — last course needed to complete second-semester Criminology (waiting on Eunice; not in the current ZIP)
3. **Switch Paystack from test to live keys** — currently no real payments can be processed
4. **Migrate to a custom domain** — currently on default Vercel domain
5. **Confirm/wire the subscription-expiry cron job** (`npm run db:expire-subscriptions`)
6. **Test PWA install** on real Android + iPhone devices
7. **Delete or archive the stale `origin/dev` branch**
8. **Decide next department to build real course content for**, beyond GSTs (Danielson's call — Management Sciences, Sciences, Computing, and Education are the agreed "major" faculties to prioritize; others are minors, built on demand)

---

## 10. Session Log (chronological, this document's update history)

- **29 Aug 2026:** Original Phase 1/2 handover — auth, payments, CBT engine, admin approval, PWA, first-semester Criminology courses (CSS111/121/133, GST101/103/105/107, POL111) built.
- **2 Sep 2026:** ECO121 and PCR111 built and cross-listed, completing first-semester Criminology (10/10). CIT104 built for Computer Science, cross-listed into Criminology (first course built for the then-unnamed Computing side of Faculty of Sciences).
- **2–3 Sep 2026:** CSS112, CSS132, CSS134 built (all owned directly by Criminology). Discovered and corrected the requirement to run `crosslist-courses.js` even for directly-owned courses.
- **3 Sep 2026:** POL126 and PCR114 built and cross-listed, bringing second-semester Criminology to 7/8. Faculty of Computing, Faculty of Management Sciences, and Faculty of Education created; 24 new departments added; Computer Science department corrected from Faculty of Sciences to Faculty of Computing. Team briefed; pilot declared ready.
- **4 Oct 2026:** GST203 (Introduction to Philosophy and Logic) seeded and approved: 122 CBT questions across 5 modules, 5-page private summary. `isGST: true`, no departmentId, no crosslist. Branch `261004-feat-gst203-from-zip`.
- **4 Oct 2026:** Launch 30-day Premium trial on public signup (`TRIAL_LENGTH_DAYS` / `TRIAL_TIER` in `lib/config.ts`). New students get CBT, summaries, and Ask the Tutor with no payment row. Landing walkthrough starts at `/signup`. Paid semester prices unchanged. No confirmation email (NextAuth credentials, not Supabase).
- **4 Oct 2026:** ENT101 (Introduction to Entrepreneurship) seeded from the 2017 course guide / ZIP PDF: 98 CBT questions across 4 modules, 4-page private summary. Owned by Entrepreneurship (`cmtlzb39l000spalnd9pg5fob`), 100L first semester. Own-department CourseDepartment backfilled. Not GST. Not cross-listed into Criminology.
- **5 Oct 2026:** ENT101 bank and summary approved in the live DB. First department-owned Management Sciences course is live.
- **6 Oct 2026:** BUS105 (Element to Management 1) seeded from the 2006/2007 course guide / ZIP PDF: 104 CBT questions across 4 modules, 4-page private summary. Owned by Business Administration (`cmtlzb2go000opaln531hcxou`), 100L first semester. Own-department CourseDepartment backfilled. Not GST. Not cross-listed into Criminology. Bank and summary later approved in the live DB.
- **6 Oct 2026:** BUS106 (Elements of Management II) seeded from the 2010 course guide / ZIP PDF: 81 CBT questions across 3 modules, 3-page private summary. Owned by Business Administration (`cmtlzb2go000opaln531hcxou`), 100L second semester. Own-department CourseDepartment backfilled. Not GST. Not cross-listed into Criminology. Later **approved** in the live DB.
- **6 Oct 2026:** BUS205 (Introduction to Business) seeded as draft from the 2009 course guide / ZIP PDF: 78 CBT questions across 3 modules (25/25/28), 4-page private summary. Owned by Business Administration (`cmtlzb2go000opaln531hcxou`), 200L first semester. Own-department CourseDepartment backfilled. Not GST. Not cross-listed into Criminology. Not approved.
- **6 Oct 2026:** BUS207 (Business Communication) seeded as draft from the course guide / ZIP PDF: 100 CBT questions across 4 modules (25 each), 4-page private summary. Owned by Business Administration (`cmtlzb2go000opaln531hcxou`), 200L second semester. Own-department CourseDepartment backfilled. Not GST. Not cross-listed into Criminology. Not approved. Writer Mrs. Eunice Adegbola.
- **6 Oct 2026:** ACC203 (Introduction to Financial Accounting I) seeded as draft from the course guide / ZIP PDF: 100 CBT questions across 4 modules (25 each), 4-page private summary. Owned by Accounting (`cmtlzb1lr000kpalnut4k8vzy`), 200L first semester. Own-department CourseDepartment backfilled. Not GST. Not cross-listed into Criminology. Not approved. First Accounting-owned course. Writer Dr Onafowokan Oluyombo.
- **7 Oct 2026:** ACC204 (Introduction to Financial Accounting II) seeded as draft from the ZIP PDF: 100 CBT questions across 4 modules (25 each), 4-page private summary. Owned by Accounting (`cmtlzb1lr000kpalnut4k8vzy`), 200L second semester. Own-department CourseDepartment backfilled. Not GST. Not cross-listed into Criminology. Not approved. Writer Dr Osamuyimen Egbon (ACA). Bank `cmuye3t9s0003y9btoogqfoso`; summary `cmuye500r0001gwkcgodzy9zb`.
- **8 Oct 2026:** BFN209 (Introduction to Finance) seeded as draft from the ZIP PDF: 100 CBT questions across 3 modules (33/32/35), 4-page private summary. Owned by Banking and Finance (`cmtlzb26v000mpalnvmwd4kb2`), 100L first semester. Own-department CourseDepartment backfilled. Not GST. Not cross-listed into Criminology. Not approved. First Banking and Finance-owned course. Editor Dr. I.D. Idrisu; coordinator Mrs. Kunbi Lawal. Bank `cmuzqxrfd00032dy1s19kf4km`; summary `cmuzqyu2s0001x1ecxd9yseep`.
- **8 Oct 2026:** CRD204 (Man & His Environment) seeded as draft from the ZIP PDF: 100 CBT questions across 3 modules (33/32/35), 4-page private summary. Owned by Cooperative and Rural Development (`cmtlzb2zz000qpalnbe9v2yg0`), 200L second semester. Own-department CourseDepartment backfilled. Not GST. Not cross-listed into Criminology. Not approved. First CRD-owned course. Writer Dr. Ogunlana, F.O.; editor Prof. Grace Joktang. Bank `cmuzs4xm00003s7yodentpxo0`; summary `cmuzs5z740001me6q8i88e1iw`.
- **10 Oct 2026:** CRD208 (Nigerian & International Cooperatives) seeded as draft from the ZIP PDF: 100 CBT questions across 3 modules (33/32/35), 4-page private summary. Owned by Cooperative and Rural Development (`cmtlzb2zz000qpalnbe9v2yg0`), 200L second semester. Own-department CourseDepartment backfilled. Not GST. Not cross-listed into Criminology. Second CRD-owned course. Writer Lawal Kamaldeen, A. A. Ph.D; editor Prof. J.O.Y Aihonsu. Bank `cmv1ufy130003dbspgx8ctowu`; summary `cmv1uhj1w0001h2lvwt63otvd`. 31 owning-dept courses; 40 `CourseDepartment` rows.
- **10 Oct 2026:** Admin approved remaining drafts at `/admin/content`. Now **approved**: ACC204, BFN209, CRD204, CRD208 (plus BUS205, BUS207, ACC203 already approved 6 Oct). Content queue empty.
- **7 Oct 2026:** Landing page no longer treats Ubora as eLearn. Official NOUN split: `nouonline.nou.edu.ng` for school fees/registration and other student admin; `elearn.nou.edu.ng` for TMAs/tests. Walkthrough is a tap-through demo (signup → login → CBT). Inquiry chat widget on landing + student UI; admin inbox at `/admin/inquiries`. WhatsApp button deferred.
