import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SITE_URL, courseSlug } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

type Params = { code: string };

async function getCourse(code: string) {
  const slug = courseSlug(code);
  const courses = await db.course.findMany({
    where: { questionBanks: { some: { status: "approved" } } },
    select: {
      code: true,
      title: true,
      isGST: true,
      level: true,
      semester: true,
      department: { select: { name: true, faculty: { select: { name: true } } } },
      questionBanks: {
        where: { status: "approved" },
        select: { _count: { select: { questions: true } } },
        take: 1,
      },
      summaries: {
        where: { status: "approved" },
        select: { id: true, pageCount: true },
        take: 1,
      },
    },
  });
  return courses.find((c) => courseSlug(c.code) === slug) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { code } = await params;
  const course = await getCourse(code);
  if (!course) return { title: "NOUN course" };
  const slug = courseSlug(course.code);
  const title = `${course.code} ${course.title} — NOUN CBT practice`;
  const description = `Practice ${course.code} ${course.title} CBT questions and course summaries on Ubora World. National Open University of Nigeria exam prep. 24-hour free trial.`;
  return {
    title,
    description,
    alternates: { canonical: `/noun/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/noun/${slug}`,
    },
  };
}

export default async function NounCoursePage({ params }: { params: Promise<Params> }) {
  const { code } = await params;
  const course = await getCourse(code);
  if (!course) notFound();

  const slug = courseSlug(course.code);
  const questionCount = course.questionBanks[0]?._count.questions ?? 0;
  const summary = course.summaries[0];
  const owner = course.isGST ? "GST · all departments" : course.department?.name ?? "NOUN";
  const faculty = course.department?.faculty?.name;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        name: `${course.code} ${course.title}`,
        description: `NOUN CBT practice and course summary for ${course.code} ${course.title} on Ubora World.`,
        url: `${SITE_URL}/noun/${slug}`,
        provider: { "@type": "Organization", name: "Ubora World", url: SITE_URL },
        educationalLevel: `${course.level} Level`,
        isAccessibleForFree: false,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "NOUN courses", item: `${SITE_URL}/noun` },
          { "@type": "ListItem", position: 3, name: `${course.code} ${course.title}`, item: `${SITE_URL}/noun/${slug}` },
        ],
      },
    ],
  };

  return (
    <div className="min-h-[100dvh] bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="border-b border-line/80 bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/brand/ubora-logo.jpeg" alt="Ubora World" className="h-9 w-9 rounded-xl object-cover" />
            <span className="font-display text-lg font-semibold tracking-tight">Ubora World</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost btn-sm">Log in</Link>
            <Link href="/signup" className="btn-gold btn-sm">Free 24-hour trial</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
        <p className="eyebrow text-golddeep">
          <Link href="/noun" className="hover:text-ink">NOUN courses</Link>
          {" · "}
          {owner}
        </p>
        <h1 className="type-page-title mt-3">
          {course.code} {course.title}
        </h1>
        <p className="mt-4 text-muted">
          CBT practice and course summary for National Open University of Nigeria students. {course.level} level, {String(course.semester).toLowerCase()} semester{faculty ? ` · ${faculty}` : ""}.
        </p>

        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="card-static p-5">
            <dt className="font-mono-brand text-[11px] uppercase tracking-[0.16em] text-muted">Practice items</dt>
            <dd className="mt-2 font-display text-2xl font-bold text-golddeep">{questionCount.toLocaleString("en-NG")}</dd>
          </div>
          <div className="card-static p-5">
            <dt className="font-mono-brand text-[11px] uppercase tracking-[0.16em] text-muted">Summary</dt>
            <dd className="mt-2 font-display text-2xl font-bold text-golddeep">{summary ? `${summary.pageCount} pages` : "Pending"}</dd>
          </div>
          <div className="card-static p-5">
            <dt className="font-mono-brand text-[11px] uppercase tracking-[0.16em] text-muted">Access</dt>
            <dd className="mt-2 font-display text-2xl font-bold text-golddeep">24-hour trial</dd>
          </div>
        </dl>

        <div className="mt-10 space-y-4 text-muted">
          <p>
            Sit timed {course.code} CBT sets on Ubora World. Questions are organised by module. Sign in to start a set, then use Ask the Tutor on the course page if you get stuck.
          </p>
          <p>
            Official school fees, course registration and TMAs are not on Ubora. Use{" "}
            <a href="https://www.nouonline.nou.edu.ng/" className="font-semibold text-ink underline" target="_blank" rel="noopener noreferrer">nouonline.nou.edu.ng</a>
            {" "}and{" "}
            <a href="https://elearn.nou.edu.ng/" className="font-semibold text-ink underline" target="_blank" rel="noopener noreferrer">elearn.nou.edu.ng</a>.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/signup" className="btn-gold">Start 24-hour free trial</Link>
          <Link href="/login" className="btn-primary">Log in to sit CBT</Link>
          <Link href="/noun" className="btn-ghost">All NOUN courses</Link>
        </div>
      </main>
    </div>
  );
}
