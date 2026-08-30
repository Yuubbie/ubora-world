import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getAccessState } from "@/lib/access";
import { db } from "@/lib/db";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";

export default async function CbtFacultyPickerPage() {
  const session = await getServerSession(authOptions);
  const access = await getAccessState((session!.user as any).id);
  const qualifies = access.active && access.tier !== "basic";

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
            eyebrow="CBT Practice"
            title="Choose a"
            accent="faculty"
            trailing="."
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

          {faculties.length === 0 ? (
            <p className="text-sm text-muted">No faculties available yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
              {faculties.map((f) => (
                <Link
                  key={f.id}
                  href={`/cbt/browse/${f.id}`}
                  /* `group` is required for the arrow's group-hover to fire.
                     It was missing before, so the animation never ran. */
                  className="card-premium group flex items-center justify-between p-5"
                >
                  <div className="min-w-0">
                    <p className="font-display font-semibold tracking-tight">{f.name}</p>
                    <p className="text-xs font-mono-brand text-muted mt-1">
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
