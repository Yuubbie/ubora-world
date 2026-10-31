import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { TIER_PRICES_KOBO, ENQUIRY_NUMBER } from "@/lib/config";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, courseSlug } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: { absolute: "Ubora World | NOUN CBT Practice, Past Questions & Summaries" },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

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

  const cleanPhone = ENQUIRY_NUMBER.replace(/\s+/g, "");
  const whatsappUrl = `https://wa.me/234${cleanPhone.startsWith("0") ? cleanPhone.slice(1) : cleanPhone}?text=Hello,%20I%20need%20help%20with%20Ubora%20World,%20Admission,%20TMA,%20Project,%20or%20IT/SIWES.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/brand/ubora-logo.jpeg`,
        telephone: "+2348100133673",
        sameAs: [whatsappUrl],
      },
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        publisher: { "@type": "Organization", name: SITE_NAME },
      },
      {
        "@type": "EducationalOrganization",
        name: SITE_NAME,
        url: SITE_URL,
        description: "CBT practice and course summaries for National Open University of Nigeria (NOUN) students.",
        areaServed: "NG",
      },
    ],
  };

  return (
    <div className="min-h-[100dvh] bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/brand/ubora-logo.jpeg" alt="Ubora World" className="h-9 w-9 rounded-xl object-cover" />
            <span className="font-display text-lg font-semibold tracking-tight">Ubora World</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
            <a href="#walkthrough" className="hover:text-ink">Walkthrough</a>
            <a href="#noun" className="hover:text-ink">NOUN portals</a>
            <Link href="/noun" className="hover:text-ink">NOUN courses</Link>
            <a href="#courses" className="hover:text-ink">Courses</a>
            <a href="#pricing" className="hover:text-ink">Pricing</a>
            <Link href="/refer" className="hover:text-ink">Refer and earn</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost btn-sm">Log in</Link>
            <Link href="/signup" className="btn-gold btn-sm hidden sm:inline-flex">Free 24-hour trial</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grain" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-2 md:px-8 md:py-20">
          <div>
            <p className="eyebrow text-golddeep mb-4">NOUN CBT · past questions · summaries</p>
            <h1 className="font-display text-4xl font-bold leading-[1.12] tracking-tight md:text-6xl">
              NOUN CBT practice for the paper you sit next.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted md:text-lg">
              Past questions, timed CBT sets, and course summaries for National Open University of Nigeria students — organised by faculty, department, course, level and semester. One pass. Your phone.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-gold">Start 24-hour free trial</Link>
              <Link href="/login" className="btn-primary">Log in</Link>
              <Link href="/cbt" className="btn-ghost">Sit CBT</Link>
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
            <p className="eyebrow text-golddeep">Live walkthrough · 90 seconds</p>
            <p className="mt-3 font-display text-2xl font-bold">Watch the path, then walk it.</p>
            <p className="mt-2 text-sm text-muted">Tap each step. Set up your personal account, pick your faculty, and test your knowledge.</p>
            <div className="mt-6 space-y-3">
              {[
                { n: "01", t: "Create account", d: "Name, email, password. No card required. 24 hours of trial access starts immediately.", href: "/signup" },
                { n: "02", t: "Log in", d: "Sign in securely with the email and password you just created.", href: "/login" },
                { n: "03", t: "Pick a paper", d: "Faculty → department → course. Sit 30 questions. Ask the Tutor on that page.", href: "/cbt" },
              ].map((step) => (
                <Link key={step.n} href={step.href} className="flex items-start gap-3 rounded-2xl bg-paper px-4 py-3 text-sm no-underline hover:bg-white">
                  <span className="font-mono-brand text-golddeep">{step.n}</span>
                  <span>
                    <span className="font-semibold">{step.t}.</span> {step.d}
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-gold btn-sm">Sign up free</Link>
              <Link href="/login" className="btn-ghost btn-sm">Student login</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Direct WhatsApp Support, Admissions & Project Help Banner */}
      <section className="mx-auto max-w-6xl px-5 py-4 pb-28 md:px-8">
        <div className="card-premium p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-paper to-white border-gold/40">
          <div>
            <span className="tag-gold mb-2 inline-block">Direct Help Desk</span>
            <h3 className="font-display text-xl font-bold tracking-tight">Need Help with Ubora World, Admissions, Projects, or TMAs?</h3>
            <p className="text-muted text-sm mt-1">Chat directly with us on WhatsApp for immediate support across all your inquiries.</p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold shrink-0"
          >
            Chat on WhatsApp ({ENQUIRY_NUMBER})
          </a>
        </div>
      </section>

      <section id="walkthrough" className="mx-auto max-w-6xl px-5 py-14 md:px-8">
        <p className="eyebrow text-golddeep">Platform guide</p>
        <h2 className="type-page-title mt-3">Sign up once. 24 hours of everything free.</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Create your personal account for a 24-hour free trial (CBT, summaries, Ask the Tutor). School fees, registration and official TMAs stay on NOUN — two portals, two jobs.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {([
            { n: "01", t: "Sign up", d: "Open Create account. Full name, email, password (8+). Matric is optional. Tap Start 24-hour free trial. You land on login — no card, no Paystack.", href: "/signup" },
            { n: "02", t: "Log in", d: "Use the email and password you just set during your account creation.", href: "/login" },
            { n: "03", t: "Sit CBT", d: "Dashboard → Start CBT Practice. Faculty, then department, then the 30-question set. Ask the Tutor lives on that course page.", href: "/cbt" },
            { n: "04", t: "Read summaries", d: "Same faculty path under Course summaries. Cram notes for the paper you are sitting.", href: "/summaries" },
            { n: "05", t: "Ask the Tutor", d: "From any CBT course page, open Ask. Grounded in that course bank. Trial unlocks it.", href: "/cbt" },
            { n: "06", t: "Support & Help", d: "Need quick help? Use the in-app chat widget or reach out directly via our WhatsApp support line above for Ubora World, admissions, and project inquiries.", href: "#noun" },
          ] as const).map((step) => (
            <Link key={step.t} href={step.href} className="card-premium p-6 no-underline">
              <p className="font-mono-brand text-golddeep">{step.n}</p>
              <h3 className="type-card-title mt-2">{step.t}</h3>
              <p className="mt-3 type-body text-muted">{step.d}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="noun" className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        <p className="eyebrow text-golddeep">Official NOUN · not Ubora</p>
        <h2 className="type-page-title mt-3">Two NOUN sites. Two jobs. Bookmark both.</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Ubora is CBT practice and summaries. Fees, course registration and TMAs never run here — they stay on NOUN.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <a href="https://www.nouonline.nou.edu.ng/" target="_blank" rel="noopener noreferrer" className="card-premium p-6 no-underline">
            <p className="font-mono-brand text-golddeep">01</p>
            <h3 className="type-card-title mt-2">www.nouonline.nou.edu.ng</h3>
            <p className="mt-3 type-body text-muted">School fees, course registration, and every other student admin activity on the NOUN portal.</p>
            <p className="mt-4 text-sm font-semibold">Open student portal ↗</p>
          </a>
          <a href="https://elearn.nou.edu.ng/" target="_blank" rel="noopener noreferrer" className="card-premium p-6 no-underline">
            <p className="font-mono-brand text-golddeep">02</p>
            <h3 className="type-card-title mt-2">elearn.nou.edu.ng</h3>
            <p className="mt-3 type-body text-muted">Official TMAs and tests. Courseware and facilitation stay on NOUN eLearn — not on Ubora.</p>
            <p className="mt-4 text-sm font-semibold">Open eLearn for TMAs ↗</p>
          </a>
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
            ["24-hour trial, then a pass", "Sign up unlocks access for 24 hours free. After that: choose Monthly or Semester billing. Paystack. Manual renew.", "/signup"],
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
          <Link href="/noun" className="btn-ghost btn-sm">NOUN course pages</Link>
        </div>
        <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-white">
          {liveCourses.map((c) => (
            <Link
              key={c.code}
              href={`/noun/${courseSlug(c.code)}`}
              className="grid grid-cols-2 items-center gap-3 border-b border-line px-5 py-3.5 last:border-0 no-underline md:grid-cols-5 hover:bg-paper"
            >
              <p className="font-mono-brand text-golddeep">{c.code}</p>
              <p className="col-span-2 text-sm">{c.title}</p>
              <p className="hidden text-sm text-muted md:block">{c.isGST ? "GST · all depts" : c.department?.name}</p>
              <p className="text-right font-mono-brand text-[11px] uppercase tracking-[0.14em] text-green">
                {c.level}L · {c.semester}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-5 py-14 md:px-8">
        <p className="eyebrow text-golddeep">Flexible pricing</p>
        <h2 className="type-page-title mt-3">24 hours free. Then choose monthly or semester.</h2>
        <p className="mt-3 max-w-xl text-muted">New accounts get full platform access for 24 hours. After that, choose the plan that fits your budget. Renews manually.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {TIERS.map((t) => (
            <article key={t.id} className={`card-static flex flex-col p-7 ${t.highlight ? "border-2 border-gold shadow-cardHover" : ""}`}>
              {t.highlight && <span className="tag-gold self-start mb-3">Most Popular</span>}
              <h3 className="font-display text-xl font-bold mb-4">{t.label}</h3>
              
              <div className="mb-3 pb-3 border-b border-line flex items-center justify-between">
                <span className="text-sm text-muted">Per month (30 days)</span>
                <span className="font-mono-brand font-semibold text-lg">
                  ₦{naira(TIER_PRICES_KOBO[t.id].monthly)}
                </span>
              </div>

              <div className="mb-6 flex items-center justify-between">
                <span className="text-sm font-medium text-ink">Per semester (90 days)</span>
                <span className="font-mono-brand font-bold text-xl text-golddeep">
                  ₦{naira(TIER_PRICES_KOBO[t.id].semester)}
                </span>
              </div>

              <ul className="mb-8 flex-1 space-y-2.5 text-sm text-muted">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-green mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={t.highlight ? "btn-gold text-center" : "btn-primary text-center"}>
                Start free trial
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <div className="rounded-3xl bg-ink px-8 py-12 text-center text-white">
          <h2 className="font-display text-3xl font-bold md:text-5xl">Sit the paper on your phone tonight.</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Sign up, get 24 hours free, log in, pick your faculty, run a module. Ask the Tutor lives on every CBT course page.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="btn-gold">Start 24-hour free trial</Link>
            <Link href="/login" className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 font-semibold text-white hover:border-gold">
              Log in
            </Link>
            <Link href="/cbt" className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 font-semibold text-white hover:border-gold">
              Open CBT
            </Link>
            <a href="https://www.nouonline.nou.edu.ng/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 font-semibold text-white hover:border-gold">
              Fees and registration
            </a>
            <a href="https://elearn.nou.edu.ng/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 font-semibold text-white hover:border-gold">
              TMAs on eLearn
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-paper pb-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-8">
          <p>Ubora World — NOUN CBT practice. Not the official NOUN portal.</p>
          <nav className="flex flex-wrap gap-4">
            <Link href="/noun" className="hover:text-ink">NOUN courses</Link>
            <Link href="/refer" className="hover:text-ink">Refer and earn</Link>
            <Link href="/signup" className="hover:text-ink">Free trial</Link>
            <a href="https://www.nouonline.nou.edu.ng/" target="_blank" rel="noopener noreferrer" className="hover:text-ink">NOUN portal</a>
            <a href="https://elearn.nou.edu.ng/" target="_blank" rel="noopener noreferrer" className="hover:text-ink">eLearn TMAs</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}