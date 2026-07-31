import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAccessState } from "@/lib/access";
import { db } from "@/lib/db";
import PortalNav from "@/components/PortalNav";

export default async function DepartmentPickerPage({
  params,
}: {
  params: Promise<{ facultyId: string }>;
}) {
  const { facultyId } = await params;
  const session = await getServerSession(authOptions);
  const access = await getAccessState((session!.user as any).id);
  const qualifies = access.active && access.tier !== "basic";

  const faculty = await db.faculty.findUnique({
    where: { id: facultyId },
    include: {
      departments: {
        include: { courses: { select: { id: true } } },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!faculty) {
    notFound();
  }

  return (
    <div className="md:flex md:min-h-screen">
      <PortalNav tier={access.active ? access.tier : null} userName={session!.user?.name || undefined} />
      <div className="flex-1 bg-dot-grid min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <Link href="/cbt" className="eyebrow text-muted hover:text-gold mb-3 inline-block transition-colors">
            ← Faculties
          </Link>
          <p className="eyebrow text-golddeep mb-3 animate-fade-up" style={{ opacity: 0 }}>
            {faculty.name}
          </p>
          <h1
            className="font-display text-3xl md:text-4xl font-bold mb-6 tracking-tight animate-fade-up"
            style={{ animationDelay: "0.05s", opacity: 0 }}
          >
            Choose a <span className="italic font-medium text-gold">department</span>.
          </h1>
          {!qualifies ? (
            <div className="card-premium mb-8 px-5 py-4 border-coral/30 bg-coral/5 flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-coral font-medium">
                CBT practice requires a standard-tier subscription or higher.
              </p>
              <Link href="/subscribe" className="btn-gold text-sm py-2 px-4 shrink-0">
                Upgrade plan
              </Link>
            </div>
          ) : null}
          <div className="grid sm:grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
            {faculty.departments.map((d) => (
              <Link
                key={d.id}
                href={`/cbt/browse/${faculty.id}/${d.id}`}
                className="card-premium flex items-center justify-between p-5 hover:border-gold/40 transition-colors"
              >
                <div>
                  <p className="font-display font-semibold tracking-tight">{d.name}</p>
                  <p className="text-xs font-mono-brand text-muted mt-1">
                    {d.courses.length} {d.courses.length === 1 ? "course" : "courses"} + shared GST
                  </p>
                </div>
                <span className="text-gold transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
          {faculty.departments.length === 0 ? (
            <p className="text-sm text-muted">No departments available yet under this faculty.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
