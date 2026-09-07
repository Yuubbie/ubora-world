# Ubora World — Handover / Status Document

**Last updated:** 3 September 2026
**Purpose:** single source of truth for what's built, what's live, and what's still open. Check this anytime you need to know where things stand.

---

## 1. Big Picture Status

Ubora World is **ready for pilot launch**, scoped to the Criminology and Security Studies department.

- First semester Criminology: **10 of 10 courses live and approved**
- Second semester Criminology: **7 of 8 courses live and approved** (CSS136 outstanding)
- Faculty/department structure: **5 faculties, 39 departments live**, with GST courses automatically visible to every one of them
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

**Important note on GST auto-coverage:** GST courses use `isGST: true` with no `departmentId`, so they appear automatically for *every* department that exists — no manual linking needed. This means all 39 departments above already show GST101/102/103/105/107 to their students, even though none of them (besides Criminology) have any department-specific courses built yet. This was the "every department has a course at launch" milestone reached on 3 Sep 2026.

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

1. **CSS136** — last course needed to complete second-semester Criminology (waiting on Eunice)
2. **Switch Paystack from test to live keys** — currently no real payments can be processed
3. **Migrate to a custom domain** — currently on default Vercel domain
4. **Confirm/wire the subscription-expiry cron job** (`npm run db:expire-subscriptions`)
5. **Test PWA install** on real Android + iPhone devices
6. **Delete or archive the stale `origin/dev` branch**
7. **Decide next department to build real course content for**, beyond GSTs (Danielson's call — Management Sciences, Sciences, Computing, and Education are the agreed "major" faculties to prioritize; others are minors, built on demand)

---

## 10. Session Log (chronological, this document's update history)

- **29 Aug 2026:** Original Phase 1/2 handover — auth, payments, CBT engine, admin approval, PWA, first-semester Criminology courses (CSS111/121/133, GST101/103/105/107, POL111) built.
- **2 Sep 2026:** ECO121 and PCR111 built and cross-listed, completing first-semester Criminology (10/10). CIT104 built for Computer Science, cross-listed into Criminology (first course built for the then-unnamed Computing side of Faculty of Sciences).
- **2–3 Sep 2026:** CSS112, CSS132, CSS134 built (all owned directly by Criminology). Discovered and corrected the requirement to run `crosslist-courses.js` even for directly-owned courses.
- **3 Sep 2026:** POL126 and PCR114 built and cross-listed, bringing second-semester Criminology to 7/8. Faculty of Computing, Faculty of Management Sciences, and Faculty of Education created; 24 new departments added; Computer Science department corrected from Faculty of Sciences to Faculty of Computing. Team briefed; pilot declared ready.
