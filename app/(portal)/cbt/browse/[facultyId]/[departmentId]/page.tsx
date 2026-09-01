import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAccessState } from "@/lib/access";
import { db } from "@/lib/db";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";

const SEMESTER_LABEL: Record<string, string> = {
  first: "1st Semester",
  second: "2nd Semester",
};

export default async function DepartmentCourseListPage({
  params,
}: {
  params: Promise<{ facultyId: string; departmentId: string }>;
}) {
  const { facultyId, departmentId } = await params;
  const session = await getServerSession(authOptions);
  const access = await getAccessState((session!.user as any).id);
  const qualifies = access.active && access.tier !== "basic";

  const department = await db.department.findUnique({
    where: { id: departmentId },
    include: { faculty: true },
  });

  if (!department || department.facultyId !== facultyId) {
    notFound();
  }

  const courses = await db.course.findMany({
    where: {
      OR: [
        // GST courses appear in every department automatically.
        { isGST: true },
        // Cross-listed courses: a course owned by one department but taught
        // to another (e.g. POL111 is owned by Political Science and taught
        // to Criminology) appears in every department linked to it.
        { departments: { some: { departmentId: department.id } } },
      ],
    },
    include: {
      questionBanks: { where: { status: "approved" }, select: { id: true } },
    },
    orderBy: [{ level: "asc" }, { semester: "asc" }, { code: "asc" }],
  });

  // Group by level, then by semester
  const grouped = new Map<number, Map<string, typeof courses>>();
  for (const c of courses) {
    if (!grouped.has(c.level)) grouped.set(c.level, new Map());
    const bySemester = grouped.get(c.level)!;
    if (!bySemester.has(c.semester)) bySemester.set(c.semester, []);
    bySemester.get(c.semester)!.push(c);
  }
  const levels = Array.from(grouped.keys()).sort((a, b) => a - b);

  return (
    <div className="md:flex md:min-h-screen">
      <PortalNav tier={access.active ? access.tier : null} userName={session!.user?.name || undefined} />
      <div className="flex-1 bg-dot-grid min-h-screen">
        <div className="page-shell">
          <PageHeader
            back={{ href: `/cbt/browse/${facultyId}`, label: department.faculty.name }}
            eyebrow={department.name}
            title="Choose a course"
          />

          {!qualifies ? (
            <div className="notice notice-warn mb-8">
              <p className="notice-warn-text">
                CBT practice requires a standard-tier subscription or higher.
              </p>
              <Link href="/subscribe" className="btn-gold btn-sm shrink-0">
                Upgrade plan
              </Link>
            </div>
          ) : null}

          {levels.length === 0 ? (
            <p className="type-body text-muted">No courses available yet for this department.</p>
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
                      <div className="grid sm:grid-cols-2 gap-4">
                        {bySemester.get(sem)!.map((c) => {
                          const ready = c.questionBanks.length > 0;
                          return (
                            <div key={c.id} className="card-static flex items-center justify-between p-5">
                              <div className="min-w-0">
                                <p className="eyebrow text-muted mb-1">
                                  {c.code}
                                  {c.isGST ? " · GST" : ""}
                                </p>
                                <p className="type-card-title">{c.title}</p>
                              </div>
                              {!qualifies ? (
                                <span className="tag-gold shrink-0 ml-3">Standard+</span>
                              ) : ready ? (
                                <Link href={`/cbt/${c.id}`} className="btn-gold btn-sm group shrink-0 ml-3">
                                  <span>Start</span>
                                  <span
                                    aria-hidden="true"
                                    className="ml-1.5 transition-transform duration-200 group-hover:translate-x-1"
                                  >
                                    →
                                  </span>
                                </Link>
                              ) : (
                                <span className="tag shrink-0 ml-3">Soon</span>
                              )}
                            </div>
                          );
                        })}
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
