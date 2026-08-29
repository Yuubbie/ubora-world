import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAccessState, requireTier } from "@/lib/access";
import { db } from "@/lib/db";
import PortalNav from "@/components/PortalNav";

const SEMESTER_LABEL: Record<string, string> = {
  first: "1st Semester",
  second: "2nd Semester",
};

export default async function SummariesDepartmentListPage({
  params,
}: {
  params: Promise<{ facultyId: string; departmentId: string }>;
}) {
  const { facultyId, departmentId } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id;
  const access = await getAccessState(userId);
  const gate = await requireTier(userId, "basic");

  const department = await db.department.findUnique({
    where: { id: departmentId },
    include: { faculty: true },
  });

  if (!department || department.facultyId !== facultyId) {
    notFound();
  }

  const summaries = gate.ok
    ? await db.summary.findMany({
        where: {
          status: "approved",
          course: {
            OR: [
              // GST courses appear in every department automatically.
              { isGST: true },
              // Cross-listed courses: a course owned by one department but
              // taught to another (e.g. POL111 is owned by Political Science
              // and taught to Criminology) appears in every linked department.
              { departments: { some: { departmentId: department.id } } },
            ],
          },
        },
        include: { course: { select: { code: true, title: true, level: true, semester: true, isGST: true } } },
        orderBy: [{ course: { level: "asc" } }, { course: { semester: "asc" } }, { course: { code: "asc" } }],
      })
    : [];

  // Group by level, then by semester
  const grouped = new Map<number, Map<string, typeof summaries>>();
  for (const s of summaries) {
    const level = s.course.level;
    const semester = s.course.semester;
    if (!grouped.has(level)) grouped.set(level, new Map());
    const bySemester = grouped.get(level)!;
    if (!bySemester.has(semester)) bySemester.set(semester, []);
    bySemester.get(semester)!.push(s);
  }
  const levels = Array.from(grouped.keys()).sort((a, b) => a - b);

  return (
    <div className="md:flex md:min-h-screen">
      <PortalNav tier={access.active ? access.tier : null} userName={session!.user?.name || undefined} />
      <div className="flex-1 bg-dot-grid min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <Link
            href={`/summaries/browse/${facultyId}`}
            className="eyebrow text-muted hover:text-gold mb-3 inline-block transition-colors"
          >
            ← {department.faculty.name}
          </Link>
          <p className="eyebrow text-golddeep mb-3 animate-fade-up" style={{ opacity: 0 }}>
            {department.name}
          </p>
          <h1
            className="font-display text-3xl md:text-4xl font-bold mb-6 tracking-tight animate-fade-up"
            style={{ animationDelay: "0.05s", opacity: 0 }}
          >
            Course <span className="italic font-medium text-gold">summaries</span>.
          </h1>
          {!gate.ok && (
            <div className="card-premium mb-8 px-5 py-4 border-coral/30 bg-coral/5">
              <p className="text-sm text-coral font-medium">
                Summaries require an active subscription ({gate.reason}).
              </p>
            </div>
          )}

          {gate.ok && levels.length === 0 ? (
            <p className="text-sm text-muted">No summaries available yet for this department.</p>
          ) : (
            levels.map((level) => {
              const bySemester = grouped.get(level)!;
              const semesters = Array.from(bySemester.keys()).sort();
              return (
                <div key={level} className="mb-10">
                  <h2 className="font-display text-xl font-bold mb-4 tracking-tight">{level} Level</h2>
                  {semesters.map((sem) => (
                    <div key={sem} className="mb-6">
                      <p className="eyebrow text-muted mb-3">{SEMESTER_LABEL[sem] || sem}</p>
                      <div className="grid sm:grid-cols-2 gap-5">
                        {bySemester.get(sem)!.map((s) => (
                          <a
                            key={s.id}
                            href={`/api/summaries/${s.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card-premium p-6 block hover:border-gold/40 transition-colors"
                          >
                            <p className="eyebrow inline-block rounded-full border border-line bg-paper px-2.5 py-1 text-[10px] text-muted mb-3">
                              {s.course.code}
                              {s.course.isGST ? " · GST" : ""}
                            </p>
                            <p className="font-display font-bold text-lg mb-2 tracking-tight">{s.title}</p>
                            <p className="text-xs font-mono-brand text-muted">
                              {s.topicCount} topics · {s.pageCount} pages
                            </p>
                            <p className="text-xs font-mono-brand text-gold mt-3">View summary →</p>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
