import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getAccessState } from "@/lib/access";
import PortalNav from "@/components/PortalNav";

const TIER_LABELS: Record<string, string> = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium",
};

// basic unlocks 2 feature categories, standard 3, premium 4 — see spec 6.2
const TIER_FEATURE_COUNT: Record<string, number> = {
  basic: 2,
  standard: 3,
  premium: 4,
};

function getGreeting() {
  // Nigeria is UTC+1 (WAT) year-round, no DST
  const watHour = (new Date().getUTCHours() + 1) % 24;
  if (watHour < 12) return "Good morning";
  if (watHour < 17) return "Good afternoon";
  return "Good evening";
}

function getDaysRemaining(endDate: Date) {
  const ms = endDate.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const access = await getAccessState((session!.user as any).id);

  const daysRemaining = access.active ? getDaysRemaining(access.endDate) : 0;
  const tierLabel = access.active ? TIER_LABELS[access.tier] ?? access.tier : "—";
  const featuresUnlocked = access.active ? TIER_FEATURE_COUNT[access.tier] ?? 0 : 0;
  const firstName = (session!.user?.name || "").split(" ")[0];

  return (
    <div className="md:flex md:min-h-screen">
      <PortalNav tier={access.active ? access.tier : null} userName={session!.user?.name || undefined} />
      <div className="flex-1 bg-cream min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-14">

          <p className="eyebrow text-golddeep mb-3 animate-fade-up" style={{ opacity: 0 }}>
            Dashboard
          </p>
          <h1
            className="font-display text-3xl md:text-4xl font-bold mb-2 tracking-tight animate-fade-up"
            style={{ animationDelay: "0.05s", opacity: 0 }}
          >
            {getGreeting()}, <span className="italic font-medium text-gold">{firstName}</span> 👋
          </h1>
          <p className="text-muted mb-10 animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
            {access.active
              ? `Your ${access.tier} subscription is active until ${access.endDate.toLocaleDateString("en-GB")}.`
              : "You don't have an active subscription yet — subscribe to unlock content."}
          </p>

          {/* Stat row */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-up-scale"
            style={{ animationDelay: "0.12s", opacity: 0 }}
          >
            <div className="stat-card">
              <div className="stat-icon bg-mintChip text-mintIcon">✓</div>
              <div className="stat-number">{access.active ? "Active" : "Inactive"}</div>
              <div className="stat-label">Subscription</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-peachChip text-peachIcon">◆</div>
              <div className="stat-number">{tierLabel}</div>
              <div className="stat-label">Current Plan</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-mintChip text-mintIcon">⏳</div>
              <div className="stat-number">{access.active ? daysRemaining : "—"}</div>
              <div className="stat-label">{access.active ? "Days Left" : "Renews In"}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-peachChip text-peachIcon">▤</div>
              <div className="stat-number">{featuresUnlocked} / 4</div>
              <div className="stat-label">Features Unlocked</div>
            </div>
          </div>

          {/* Action panel */}
          <div className="action-panel animate-fade-up-scale" style={{ animationDelay: "0.18s", opacity: 0 }}>
            <p className="eyebrow text-gold mb-2">Getting things done</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-6">
              What would you like to do?
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link href="/cbt" className="action-btn group">
                <span>Start CBT Practice</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">↗</span>
              </Link>
              <Link href="/summaries" className="action-btn group">
                <span>Open Course Summaries</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">↗</span>
              </Link>
              <span className="action-btn opacity-40 cursor-not-allowed">
                <span>Browse Past Questions</span>
                <span className="text-[10px] font-mono-brand tracking-wide">SOON</span>
              </span>
              <span className="action-btn opacity-40 cursor-not-allowed">
                <span>Watch Tutorials</span>
                <span className="text-[10px] font-mono-brand tracking-wide">SOON</span>
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
