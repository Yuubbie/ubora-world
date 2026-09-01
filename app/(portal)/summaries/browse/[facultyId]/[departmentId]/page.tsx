import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAccessState, requireTier } from "@/lib/access";
import { db } from "@/lib/db";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";

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
        <div className="page-shell">
          <PageHeader
            back={{ href: `/summaries/browse/${facultyId}`, label: department.faculty.name }}
            eyebrow={department.name}
            title="Course summaries"
          />

          {!gate.ok && (
            <div className="notice notice-warn mb-8">
              <p className="notice-warn-text">
                Summaries require an active subscription ({gate.reason}).
              </p>
            </div>
          )}

          {gate.ok && levels.length === 0 ? (
            <p className="type-body text-muted">No summaries available yet for this department.</p>
          ) : (
            levels.map((level) => {
              const bySemester = grouped.get(level)!;
              const semesters = Array.from(bySemester.keys()).sort();
              return (
                <section key={level} className="mb-10">
                  <h2 className="type-section-title mb-4">{level} Level</h2>
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
                            className="card-premium group p-6 block"
                          >
                            <p className="tag mb-3">
                              {s.course.code}
                              {s.course.isGST ? " · GST" : ""}
                            </p>
                            <p className="type-card-title mb-2">{s.title}</p>
                            <p className="type-meta">
                              {s.topicCount} topics · {s.pageCount} pages
                            </p>
                            <p className="type-meta text-gold mt-3">
                              View summary
                              <span
                                aria-hidden="true"
                                className="ml-1.5 inline-block transition-transform duration-200 group-hover:translate-x-1"
                              >
                                →
                              </span>
                            </p>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
