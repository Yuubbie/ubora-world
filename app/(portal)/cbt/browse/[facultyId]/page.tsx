import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAccessState } from "@/lib/access";
import { db } from "@/lib/db";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";

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
        // Count via the cross-listing table, not department.courses.
        // department.courses only counts courses this department OWNS, so
        // after cross-listing it under-reported: Criminology showed 3 when
        // it actually offers 4 (POL111 is owned by Political Science).
        include: { _count: { select: { crossListedCourses: true } } },
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
        <div className="page-shell">
          <PageHeader
            back={{ href: "/cbt", label: "Faculties" }}
            eyebrow={faculty.name}
            title="Choose a department"
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

          {faculty.departments.length === 0 ? (
            <p className="type-body text-muted">No departments available yet under this faculty.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
              {faculty.departments.map((d) => {
                const count = d._count.crossListedCourses;
                return (
                  <Link
                    key={d.id}
                    href={`/cbt/browse/${faculty.id}/${d.id}`}
                    /* `group` is required for the arrow's group-hover to fire.
                       It was missing before, so the animation never ran. */
                    className="card-premium group flex items-center justify-between p-5"
                  >
                    <div className="min-w-0">
                      <p className="type-card-title">{d.name}</p>
                      <p className="type-meta mt-1">
                        {count} {count === 1 ? "course" : "courses"} + shared GST
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="text-gold shrink-0 ml-3 transition-transform duration-200 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
