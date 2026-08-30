import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAccessState } from "@/lib/access";
import { db } from "@/lib/db";
import PortalNav from "@/components/PortalNav";

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
      OR: [{ departmentId: department.id }, { isGST: true }],
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
        <div className="max-w-4xl mx-auto px-6 py-14">
          <Link
            href={`/cbt/browse/${facultyId}`}
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
            Choose a <span className="italic font-medium text-gold">course</span>.
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

          {levels.length === 0 ? (
            <p className="text-sm text-muted">No courses available yet for this department.</p>
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
                      <div className="grid sm:grid-cols-2 gap-4">
                        {bySemester.get(sem)!.map((c) => {
                          const ready = c.questionBanks.length > 0;
                          return (
                            <div key={c.id} className="card-premium flex items-center justify-between p-5">
                              <div>
                                <p className="eyebrow text-muted mb-1">
                                  {c.code}
                                  {c.isGST ? " · GST" : ""}
                                </p>
                                <p className="font-display font-semibold tracking-tight">{c.title}</p>
                              </div>
                              {!qualifies ? (
                                <span className="eyebrow rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[10px] text-golddeep">
                                  Standard+
                                </span>
                              ) : ready ? (
                                <Link href={`/cbt/${c.id}`} className="btn-gold group text-sm py-2 px-4">
                                  <span>Start</span>
                                  <span className="ml-1.5 transition-transform duration-200 group-hover:translate-x-1">
                                    →
                                  </span>
                                </Link>
                              ) : (
                                <span className="eyebrow rounded-full border border-line bg-paper px-2.5 py-1 text-[10px] text-muted">
                                  Soon
                                </span>
                              )}
                            </div>
                          );
                        })}
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
