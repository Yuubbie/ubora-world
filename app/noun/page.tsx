import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { SITE_URL, courseSlug } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "NOUN CBT Practice & Past Questions",
  description:
    "Practice NOUN CBT, past questions and course summaries on Ubora World. GST, Criminology, Economics, Political Science and more for National Open University of Nigeria students. 10-day free trial.",
  alternates: { canonical: "/noun" },
  openGraph: {
    title: "NOUN CBT Practice & Past Questions | Ubora World",
    description:
      "CBT practice and course summaries for National Open University of Nigeria students. Official fees and TMAs stay on nouonline and eLearn.",
    url: `${SITE_URL}/noun`,
  },
};

export default async function NounHubPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does Ubora World host official NOUN TMAs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Official TMAs stay on elearn.nou.edu.ng. Ubora World is timed CBT practice and course summaries for National Open University of Nigeria students.",
        },
      },
      {
        "@type": "Question",
        name: "Where do I pay NOUN school fees?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pay school fees and complete course registration on www.nouonline.nou.edu.ng. Ubora subscriptions only unlock practice on uboraworld.com.ng.",
        },
      },
      {
        "@type": "Question",
        name: "How do I practise NOUN CBT on Ubora World?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Create a free account for a 10-day trial, then pick your faculty, department and course to sit a timed 30-question set.",
        },
      },
    ],
  };

  const courses = await db.course.findMany({
    where: { questionBanks: { some: { status: "approved" } } },
    select: { code: true, title: true, isGST: true, level: true, semester: true, department: { select: { name: true } } },
    orderBy: { code: "asc" },
  });

  return (
    <div className="min-h-[100dvh] bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <header className="border-b border-line/80 bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/brand/ubora-logo.jpeg" alt="Ubora World" className="h-9 w-9 rounded-xl object-cover" />
            <span className="font-display text-lg font-semibold tracking-tight">Ubora World</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost btn-sm">Log in</Link>
            <Link href="/signup" className="btn-gold btn-sm">Free 10-day trial</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <p className="eyebrow text-golddeep">National Open University of Nigeria</p>
        <h1 className="type-page-title mt-3 max-w-3xl">
          NOUN CBT practice, past questions and course summaries.
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Ubora World is exam practice for NOUN students. Sit timed CBT sets, read cram summaries, and ask a tutor grounded in the course bank. School fees, course registration and official TMAs stay on the NOUN portals.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className="btn-gold">Start 10-day free trial</Link>
          <Link href="/" className="btn-ghost">Back to home</Link>
        </div>

        <section className="mt-14">
          <h2 className="type-section-title">Official NOUN portals</h2>
          <p className="mt-2 max-w-2xl text-muted">
            Bookmark both. Ubora does not collect school fees or host official TMAs.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <a href="https://www.nouonline.nou.edu.ng/" target="_blank" rel="noopener noreferrer" className="card-premium p-6 no-underline">
              <h3 className="type-card-title">www.nouonline.nou.edu.ng</h3>
              <p className="mt-3 type-body text-muted">School fees, course registration, and student admin on the NOUN portal.</p>
            </a>
            <a href="https://elearn.nou.edu.ng/" target="_blank" rel="noopener noreferrer" className="card-premium p-6 no-underline">
              <h3 className="type-card-title">elearn.nou.edu.ng</h3>
              <p className="mt-3 type-body text-muted">Official TMAs, tests, courseware and facilitation on NOUN eLearn.</p>
            </a>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="type-section-title">NOUN CBT, TMAs and fees</h2>
          <dl className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="card-static p-6">
              <dt className="type-card-title">Does Ubora World host official NOUN TMAs?</dt>
              <dd className="mt-3 type-body text-muted">No. Official TMAs stay on elearn.nou.edu.ng. Ubora is timed CBT practice and summaries for the papers you sit.</dd>
            </div>
            <div className="card-static p-6">
              <dt className="type-card-title">Where do I pay NOUN school fees?</dt>
              <dd className="mt-3 type-body text-muted">www.nouonline.nou.edu.ng. Ubora subscriptions only unlock practice on this site.</dd>
            </div>
            <div className="card-static p-6">
              <dt className="type-card-title">Which NOUN courses can I practise?</dt>
              <dd className="mt-3 type-body text-muted">GST, Criminology, Economics, Political Science, Peace Studies, Entrepreneurship, Business, Accounting and more — listed below as they are approved.</dd>
            </div>
            <div className="card-static p-6">
              <dt className="type-card-title">How do I start?</dt>
              <dd className="mt-3 type-body text-muted">Create an account for a 10-day free trial. No card. Then pick a faculty and sit a 30-question set on your phone.</dd>
            </div>
          </dl>
        </section>

        <section className="mt-14">
          <h2 className="type-section-title">Live NOUN courses on Ubora</h2>
          <p className="mt-2 max-w-2xl text-muted">
            Approved banks only. Open a course page for what we cover, then start a free trial to sit the CBT.
          </p>
          <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-white">
            {courses.map((c) => (
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
      </main>
    </div>
  );
}
