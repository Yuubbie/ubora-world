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
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold mb-6">Choose a course</h1>
        {!access.active || access.tier === "basic" ? (
          <p className="text-sm text-coral mb-6">
            CBT practice requires a standard-tier subscription or higher.
          </p>
        ) : null}
        <div className="grid sm:grid-cols-2 gap-4">
          {courses.map((c) => {
            const ready = c.questionBanks.length > 0;
            return (
              <div key={c.id} className="bg-white border border-line rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-muted mb-1">{c.code}</p>
                  <p className="font-medium">{c.title}</p>
                </div>
                {ready ? (
                  <Link href={`/cbt/${c.id}`} className="bg-gold text-ink rounded-lg px-4 py-2 text-sm font-semibold">
                    Start
                  </Link>
                ) : (
                  <span className="text-xs font-mono text-muted">Soon</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
