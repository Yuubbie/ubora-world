import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getAccessState } from "@/lib/access";
import { db } from "@/lib/db";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";

export default async function SummariesFacultyPickerPage() {
  const session = await getServerSession(authOptions);
  const access = await getAccessState((session!.user as any).id);

  const faculties = await db.faculty.findMany({
    include: { departments: { select: { id: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="md:flex md:min-h-screen">
      <PortalNav tier={access.active ? access.tier : null} userName={session!.user?.name || undefined} />
      <div className="flex-1 bg-dot-grid min-h-screen">
        <div className="page-shell">
          <PageHeader
            back={{ href: "/dashboard", label: "Dashboard" }}
            eyebrow="Library"
            title="Choose a faculty"
          />

          {faculties.length === 0 ? (
            <p className="type-body text-muted">No faculties available yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
              {faculties.map((f) => (
                <Link
                  key={f.id}
                  href={`/summaries/browse/${f.id}`}
                  /* `group` is required for the arrow's group-hover to fire.
                     It was missing before, so the animation never ran. */
                  className="card-premium group flex items-center justify-between p-5"
                >
                  <div className="min-w-0">
                    <p className="type-card-title">{f.name}</p>
                    <p className="type-meta mt-1">
                      {f.departments.length} {f.departments.length === 1 ? "department" : "departments"}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="text-gold shrink-0 ml-3 transition-transform duration-200 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
