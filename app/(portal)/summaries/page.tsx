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
      <div className="bg-dot-grid min-h-[calc(100vh-64px)]">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <p className="eyebrow text-golddeep mb-3 animate-fade-up" style={{ opacity: 0 }}>
            Library
          </p>
          <h1
            className="font-display text-3xl md:text-4xl font-bold mb-8 tracking-tight animate-fade-up"
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
          <div className="grid sm:grid-cols-2 gap-5 animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
            {summaries.map((s) => (
              <div key={s.id} className="card-premium p-6">
                <p className="eyebrow inline-block rounded-full border border-line bg-paper px-2.5 py-1 text-[10px] text-muted mb-3">
                  {s.course.code}
                </p>
                <p className="font-display font-bold text-lg mb-2 tracking-tight">{s.title}</p>
                <p className="text-xs font-mono-brand text-muted">{s.topicCount} topics · {s.pageCount} pages</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}