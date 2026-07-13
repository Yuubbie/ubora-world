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
      <div className="bg-dot-grid min-h-[calc(100vh-64px)]">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <p className="eyebrow text-golddeep mb-3 animate-fade-up" style={{ opacity: 0 }}>
            Dashboard
          </p>
          <h1
            className="font-display text-3xl md:text-4xl font-bold mb-2 tracking-tight animate-fade-up"
            style={{ animationDelay: "0.05s", opacity: 0 }}
          >
            Welcome back, <span className="italic font-medium text-gold">{session!.user?.name}</span>.
          </h1>
          <p className="text-muted mb-10 animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
            {access.active
              ? `Your ${access.tier} subscription is active until ${access.endDate.toLocaleDateString("en-GB")}.`
              : "You don't have an active subscription yet — subscribe to unlock content."}
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            <Link
              href="/cbt"
              className="card-premium group block p-7 animate-fade-up-scale"
              style={{ animationDelay: "0.15s", opacity: 0 }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 bg-paper">
                <span className="font-display text-xl">✓</span>
              </div>
              <h3 className="font-display font-bold text-lg mb-2 tracking-tight flex items-center justify-between">
                CBT Practice
                <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:translate-x-1">→</span>
              </h3>
              <p className="text-sm text-muted mb-4">Timed simulations, graded instantly.</p>
              <span className="eyebrow inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[10px] text-golddeep">
                Standard tier required
              </span>
            </Link>
            <Link
              href="/summaries"
              className="card-premium group block p-7 animate-fade-up-scale"
              style={{ animationDelay: "0.2s", opacity: 0 }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 bg-paper">
                <span className="font-display text-xl">▤</span>
              </div>
              <h3 className="font-display font-bold text-lg mb-2 tracking-tight flex items-center justify-between">
                Course Summaries
                <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:translate-x-1">→</span>
              </h3>
              <p className="text-sm text-muted mb-4">Faculty-reviewed notes.</p>
              <span className="eyebrow inline-flex items-center rounded-full border border-line bg-white px-2.5 py-1 text-[10px] text-muted">
                Basic tier required
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}