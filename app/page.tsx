import Link from "next/link";
import { db } from "@/lib/db";
import { TIER_PRICES_KOBO } from "@/lib/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function naira(kobo: number) {
  return (kobo / 100).toLocaleString("en-NG");
}

const TIERS: { id: "basic" | "standard" | "premium"; label: string; features: string[]; highlight?: boolean }[] = [
  { id: "basic", label: "Basic", features: ["Past questions", "Course summaries (view only)"] },
  { id: "standard", label: "Standard", features: ["Everything in Basic", "CBT practice engine"], highlight: true },
  { id: "premium", label: "Premium", features: ["Everything in Standard", "Video & audio tutorials", "Downloadable summaries"] },
];

export default async function HomePage() {
  const [liveCourseCount, questionCount, summaryCount, liveCourses] = await Promise.all([
    db.course.count({ where: { questionBanks: { some: { status: "approved" } } } }),
    db.question.count({ where: { questionBank: { status: "approved" } } }),
    db.summary.count({ where: { status: "approved" } }),
    db.course.findMany({
      where: { questionBanks: { some: { status: "approved" } } },
      select: { code: true, title: true, isGST: true, level: true, semester: true, department: { select: { name: true } } },
      orderBy: { code: "asc" },
    }),
  ]);

  return (
    <div className="min-h-[100dvh] bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/brand/ubora-logo.jpeg" alt="Ubora World" className="h-9 w-9 rounded-xl object-cover" />
            <span className="font-display text-lg font-semibold tracking-tight">Ubora World</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
            <a href="#walkthrough" className="hover:text-ink">Walkthrough</a>
            <a href="#courses" className="hover:text-ink">Courses</a>
            <a href="#pricing" className="hover:text-ink">Pricing</a>
            <a href="https://elearn.nou.edu.ng/" target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              NOUN eLearn
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost btn-sm">Log in</Link>
            <Link href="/signup" className="btn-gold btn-sm hidden sm:inline-flex">Free 30-day trial</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grain" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-2 md:px-8 md:py-20">
          <div>
            <p className="eyebrow text-golddeep mb-4">NOUN · WAEC · NECO · JAMB</p>
            <h1 className="font-display text-4xl font-bold leading-[1.12] tracking-tight md:text-6xl">
              Everything between you and your next result slip.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted md:text-lg">
              CBT practice, course summaries, and a tutor you can ask on the go — organised by faculty, department, course, level and semester. One pass. Your phone. The paper you actually sit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-gold">Start 30-day free trial</Link>
              <Link href="/login" className="btn-primary">Log in</Link>
              <Link href="/cbt" className="btn-ghost">Sit CBT</Link>
              <a href="https://elearn.nou.edu.ng/" target="_blank" rel="noopener noreferrer" className="btn-ghost">
                NOUN eLearn · TMAs
              </a>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {[
                [String(liveCourseCount), "live courses"],
                [questionCount.toLocaleString("en-NG"), "practice items"],
                [String(summaryCount), "summaries"],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="font-display text-3xl font-bold text-golddeep">{n}</p>
                  <p className="mt-1 font-mono-brand text-[11px] uppercase tracking-[0.16em] text-muted">{l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card-static overflow-hidden p-6 md:p-8">
            <p className="eyebrow text-golddeep">Exam ticket · live banks</p>
            <p className="mt-3 font-display text-2xl font-bold">Faculty. Department. Then the paper.</p>
            <p className="mt-2 text-sm text-muted">Same CBT you already know: 30-question module sets, server-side scoring, Ask the Tutor on the course page.</p>
            <div className="mt-6 space-y-3">
              {[
                "Sign up — 30 days of Premium, no card",
                "Log in, then faculty → department → course",
                "Sit a 30-question set. Then ask a follow-up.",
              ].map((line, i) => (
                <div key={line} className="flex items-start gap-3 rounded-2xl bg-paper px-4 py-3 text-sm">
                  <span className="font-mono-brand text-golddeep">0{i + 1}</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-gold btn-sm">Sign up free</Link>
              <Link href="/login" className="btn-ghost btn-sm">Student login</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="walkthrough" className="mx-auto max-w-6xl px-5 py-14 md:px-8">
        <p className="eyebrow text-golddeep">Live walkthrough</p>
        <h2 className="type-page-title mt-3">Sign up once. Thirty days of everything.</h2>
        <p className="mt-3 max-w-2xl text-muted">
          This is the real app, not a mock. Create your own account for a 30-day Premium trial (CBT, summaries, Ask the Tutor). Or use the demo student. Official TMAs and courseware stay on NOUN eLearn.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {([
            { n: "01", t: "Sign up", d: "Open Create account. Full name, email, password (8+). Matric is optional. Tap Start 30-day free trial. You are sent to login — no card, no Paystack.", href: "/signup", external: false },
            { n: "02", t: "Log in", d: "Use the email and password you just set. Demo if you only want a peek: demo.student@uboraworld.test / Password123!", href: "/login", external: false },
            { n: "03", t: "Sit CBT", d: "Dashboard → Start CBT Practice. Faculty, then department, then the 30-question set. Ask the Tutor lives on that course page.", href: "/cbt", external: false },
            { n: "04", t: "Read summaries", d: "Same faculty path under Course summaries. Cram notes for the paper you are sitting.", href: "/summaries", external: false },
            { n: "05", t: "Ask the Tutor", d: "From any CBT course page, open Ask. Grounded in that course bank. Same Premium trial unlocks it.", href: "/cbt", external: false },
            { n: "06", t: "NOUN eLearn", d: "Official LMS: TMAs, course materials, facilitation. Opens NOUN, not Ubora.", href: "https://elearn.nou.edu.ng/", external: true },
          ] as const).map((step) =>
            step.external ? (
              <a key={step.t} href={step.href} target="_blank" rel="noopener noreferrer" className="card-premium p-6 no-underline">
                <p className="font-mono-brand text-golddeep">{step.n}</p>
                <h3 className="type-card-title mt-2">{step.t}</h3>
                <p className="mt-3 type-body text-muted">{step.d}</p>
              </a>
            ) : (
              <Link key={step.t} href={step.href} className="card-premium p-6 no-underline">
                <p className="font-mono-brand text-golddeep">{step.n}</p>
                <h3 className="type-card-title mt-2">{step.t}</h3>
                <p className="mt-3 type-body text-muted">{step.d}</p>
              </Link>
            )
          )}
        </div>
      </section>

      <section id="product" className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        <p className="eyebrow text-golddeep">What you get</p>
        <h2 className="type-page-title mt-3">Built like the exam, not like a brochure.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ["CBT simulator", "Fixed 30-question sets per module so the full bank is covered across attempts.", "/cbt"],
            ["Course summaries", "Cram format, served only to logged-in subscribers. Never a public file.", "/summaries"],
            ["Ask the Tutor", "Stuck mid-revision? Ask from the course you are sitting. Grounded in that course bank.", "/cbt"],
            ["30-day trial, then a pass", "Sign up unlocks Premium for 30 days. After that: Basic, Standard or Premium. Paystack. Manual renew.", "/signup"],
          ].map(([t, d, href]) => (
            <Link key={t} href={href} className="card-premium p-6 no-underline">
              <h3 className="type-card-title">{t}</h3>
              <p className="mt-3 type-body text-muted">{d}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-golddeep">Live catalogue</p>
            <h2 className="type-page-title mt-3">Approved courses, served from the live bank.</h2>
          </div>
          <Link href="/cbt" className="btn-ghost btn-sm">Browse in CBT</Link>
        </div>
        <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-white">
          {liveCourses.map((c) => (
            <div key={c.code} className="grid grid-cols-2 items-center gap-3 border-b border-line px-5 py-3.5 last:border-0 md:grid-cols-5">
              <p className="font-mono-brand text-golddeep">{c.code}</p>
              <p className="col-span-2 text-sm">{c.title}</p>
              <p className="hidden text-sm text-muted md:block">{c.isGST ? "GST · all depts" : c.department?.name}</p>
              <p className="text-right font-mono-brand text-[11px] uppercase tracking-[0.14em] text-green">
                {c.level}L · {c.semester}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-5 py-14 md:px-8">
        <p className="eyebrow text-golddeep">Semester economics</p>
        <h2 className="type-page-title mt-3">Thirty days free. Then pay for the semester you are in.</h2>
        <p className="mt-3 max-w-xl text-muted">New accounts get Premium for 30 days — CBT, summaries, Ask the Tutor. After that, a 3-month pass at the prices below. Renews manually.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {TIERS.map((t) => (
            <article key={t.id} className={`card-static flex flex-col p-7 ${t.highlight ? "border-2 border-gold shadow-cardHover" : ""}`}>
              {t.highlight && <span className="tag-gold self-start mb-3">Most Popular</span>}
              <h3 className="font-display text-xl font-bold">{t.label}</h3>
              <p className="font-mono-brand mt-3 mb-5">
                <span className="text-sm text-muted mr-1">NGN</span>
                <span className="text-3xl font-semibold">{naira(TIER_PRICES_KOBO[t.id])}</span>
              </p>
              <ul className="mb-8 flex-1 space-y-2.5 text-sm text-muted">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-green mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={t.highlight ? "btn-gold" : "btn-primary"}>
                Start free, then {t.label}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <div className="rounded-3xl bg-ink px-8 py-12 text-center text-white">
          <h2 className="font-display text-3xl font-bold md:text-5xl">Sit the paper on your phone tonight.</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Sign up, get 30 days of Premium, log in, pick your faculty, run a module. Ask the Tutor lives on every CBT course page.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="btn-gold">Start 30-day free trial</Link>
            <Link href="/login" className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 font-semibold text-white hover:border-gold">
              Log in
            </Link>
            <Link href="/cbt" className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 font-semibold text-white hover:border-gold">
              Open CBT
            </Link>
            <a href="https://elearn.nou.edu.ng/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 font-semibold text-white hover:border-gold">
              NOUN eLearn
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
