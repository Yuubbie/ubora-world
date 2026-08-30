import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getAccessState } from "@/lib/access";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";

const TIER_LABELS: Record<string, string> = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium",
};

// basic unlocks 2 feature categories, standard 3, premium 4 - see spec 6.2
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

/* Inline SVG rather than Unicode glyphs - the previous check, diamond,
   hourglass and arrow characters rendered as emoji on some devices and as
   blank boxes on others. */

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconPlan() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function IconUnlocked() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="stat-card">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-golddeep">
        {icon}
      </div>
      <div className="stat-number">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const access = await getAccessState((session!.user as any).id);

  const daysRemaining = access.active ? getDaysRemaining(access.endDate) : 0;
  const tierLabel = access.active ? TIER_LABELS[access.tier] ?? access.tier : "None";
  const featuresUnlocked = access.active ? TIER_FEATURE_COUNT[access.tier] ?? 0 : 0;
  const firstName = (session!.user?.name || "").split(" ")[0];

  const actions = [
    { href: "/cbt", label: "Start CBT Practice", ready: true },
    { href: "/summaries", label: "Open Course Summaries", ready: true },
    { href: null, label: "Browse Past Questions", ready: false },
    { href: null, label: "Watch Tutorials", ready: false },
  ];

  return (
    <div className="md:flex md:min-h-screen">
      <PortalNav tier={access.active ? access.tier : null} userName={session!.user?.name || undefined} />
      {/* bg-dot-grid and page-shell, matching every other portal screen.
          This page previously used bg-cream and max-w-5xl, so it was a
          different width and background from the rest of the app. */}
      <div className="flex-1 bg-dot-grid min-h-screen">
        <div className="page-shell">
          <PageHeader
            eyebrow="Dashboard"
            title={firstName ? `${getGreeting()}, ${firstName}` : getGreeting()}
            subtitle={
              access.active
                ? `Your ${access.tier} subscription is active until ${access.endDate.toLocaleDateString("en-GB")}.`
                : "You don't have an active subscription yet - subscribe to unlock content."
            }
          />

          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-up-scale"
            style={{ animationDelay: "0.12s", opacity: 0 }}
          >
            <StatCard
              icon={<IconCheck />}
              value={access.active ? "Active" : "Inactive"}
              label="Subscription"
            />
            <StatCard icon={<IconPlan />} value={tierLabel} label="Current Plan" />
            <StatCard
              icon={<IconClock />}
              value={access.active ? daysRemaining : "None"}
              label={access.active ? "Days Left" : "Renews In"}
            />
            <StatCard
              icon={<IconUnlocked />}
              value={`${featuresUnlocked} / 4`}
              label="Features Unlocked"
            />
          </div>

          {!access.active ? (
            <div className="notice notice-warn mb-8">
              <p className="notice-warn-text">
                Subscribe to unlock CBT practice and course summaries.
              </p>
              <Link href="/subscribe" className="btn-gold btn-sm shrink-0">
                View plans
              </Link>
            </div>
          ) : null}

          <section
            className="card-static p-6 md:p-8 animate-fade-up-scale"
            style={{ animationDelay: "0.18s", opacity: 0 }}
          >
            <p className="eyebrow text-golddeep mb-2">Getting things done</p>
            <h2 className="type-section-title mb-6">What would you like to do?</h2>

            <div className="grid sm:grid-cols-2 gap-3">
              {actions.map((a) =>
                a.ready && a.href ? (
                  <Link
                    key={a.label}
                    href={a.href}
                    className="btn-ghost group justify-between w-full"
                  >
                    <span>{a.label}</span>
                    <span
                      aria-hidden="true"
                      className="text-gold transition-transform duration-200 group-hover:translate-x-1"
                    >
                      <IconArrow />
                    </span>
                  </Link>
                ) : (
                  <span
                    key={a.label}
                    aria-disabled="true"
                    className="btn-ghost justify-between w-full opacity-50 cursor-not-allowed"
                  >
                    <span>{a.label}</span>
                    <span className="tag">Soon</span>
                  </span>
                )
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
