import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAccessState, requireTier } from "@/lib/access";
import { db } from "@/lib/db";
import PortalNav from "@/components/PortalNav";

export default async function SummariesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id;
  const access = await getAccessState(userId);
  const gate = await requireTier(userId, "basic");

  const summaries = gate.ok
    ? await db.summary.findMany({
        where: { status: "approved" },
        include: { course: { select: { code: true, title: true } } },
      })
    : [];

  return (
    <div>
      <PortalNav tier={access.active ? access.tier : null} />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="font-mono-brand text-xs uppercase tracking-widest mb-2" style={{ color: "#8C6D1F" }}>Library</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-8 tracking-tight">Course summaries</h1>
        {!gate.ok && (
          <p className="text-sm text-coral mb-6">
            Summaries require an active subscription ({gate.reason}).
          </p>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          {summaries.map((s) => (
            <div key={s.id} className="card-hover bg-white border border-line rounded-2xl p-6">
              <p className="font-mono-brand text-xs text-muted mb-1">{s.course.code}</p>
              <p className="font-display font-semibold text-lg mb-2">{s.title}</p>
              <p className="text-xs text-muted">{s.topicCount} topics · {s.pageCount} pages</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}