import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getAccessState } from "@/lib/access";
import PortalNav from "@/components/PortalNav";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const access = await getAccessState((session!.user as any).id);

  return (
    <div>
      <PortalNav tier={access.active ? access.tier : null} />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="font-mono-brand text-xs uppercase tracking-widest mb-2" style={{ color: "#8C6D1F" }}>Dashboard</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2 tracking-tight">
          Welcome back, {session!.user?.name}.
        </h1>
        <p className="text-muted mb-10">
          {access.active
            ? `Your ${access.tier} subscription is active until ${access.endDate.toLocaleDateString("en-GB")}.`
            : "You don't have an active subscription yet — subscribe to unlock content."}
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/cbt" className="card-hover block bg-white border border-line rounded-2xl p-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: "#F3F5F4" }}>
              <span className="font-display text-lg">✓</span>
            </div>
            <h3 className="font-display font-semibold text-lg mb-1">CBT Practice</h3>
            <p className="text-sm text-muted">Timed simulations, graded instantly. Requires standard tier.</p>
          </Link>
          <Link href="/summaries" className="card-hover block bg-white border border-line rounded-2xl p-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: "#F3F5F4" }}>
              <span className="font-display text-lg">▤</span>
            </div>
            <h3 className="font-display font-semibold text-lg mb-1">Course Summaries</h3>
            <p className="text-sm text-muted">Faculty-reviewed notes. Requires basic tier.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}