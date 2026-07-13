import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getAccessState } from "@/lib/access";
import { db } from "@/lib/db";
import PortalNav from "@/components/PortalNav";

export default async function CbtSelectPage() {
  const session = await getServerSession(authOptions);
  const access = await getAccessState((session!.user as any).id);

  const courses = await db.course.findMany({
    include: { questionBanks: { where: { status: "approved" }, select: { id: true } } },
  });

  return (
    <div>
      <PortalNav tier={access.active ? access.tier : null} />
      <div className="bg-dot-grid min-h-[calc(100vh-64px)]">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <p className="eyebrow text-golddeep mb-3 animate-fade-up" style={{ opacity: 0 }}>
            CBT Practice
          </p>
          <h1
            className="font-display text-3xl md:text-4xl font-bold mb-6 tracking-tight animate-fade-up"
            style={{ animationDelay: "0.05s", opacity: 0 }}
          >
            Choose a <span className="italic font-medium text-gold">course</span>.
          </h1>
          {!access.active || access.tier === "basic" ? (
            <div className="card-premium mb-8 px-5 py-4 border-coral/30 bg-coral/5">
              <p className="text-sm text-coral font-medium">
                CBT practice requires a standard-tier subscription or higher.
              </p>
            </div>
          ) : null}
          <div className="grid sm:grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
            {courses.map((c) => {
              const ready = c.questionBanks.length > 0;
              return (
                <div key={c.id} className="card-premium flex items-center justify-between p-5">
                  <div>
                    <p className="eyebrow text-muted mb-1">{c.code}</p>
                    <p className="font-display font-semibold tracking-tight">{c.title}</p>
                  </div>
                  {ready ? (
                    <Link href={`/cbt/${c.id}`} className="btn-gold group text-sm py-2 px-4">
                      <span>Start</span>
                      <span className="ml-1.5 transition-transform duration-200 group-hover:translate-x-1">→</span>
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
      </div>
    </div>
  );
}