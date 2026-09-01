"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Standard back control, used on every screen that is not a top-level tab.
 *
 * Why this exists: pages used to hardcode <Link href="/somewhere"> as "back".
 * On any page reachable from more than one route that either sent the user
 * somewhere unexpected or pointed at a route that no longer existed.
 *
 * This renders a real anchor (so it is right-clickable and shows a URL in the
 * status bar) but intercepts the click to step back through history when
 * there is history to step back through. The href is the fallback for a
 * fresh tab, a shared link, or an installed PWA opened cold.
 */
export default function BackLink({
  href,
  label,
  className = "",
}: {
  /** Where to go when there is no history to go back to. Always required. */
  href: string;
  /** What the user sees, e.g. the parent page name. */
  label: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <Link
      href={href}
      onClick={(e) => {
        // Let modified clicks (new tab, new window) behave normally.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

        // Only intercept when we genuinely came from somewhere in this app.
        const sameOriginReferrer =
          typeof document !== "undefined" &&
          document.referrer.startsWith(window.location.origin);

        if (typeof window !== "undefined" && window.history.length > 1 && sameOriginReferrer) {
          e.preventDefault();
          router.back();
        }
        // Otherwise fall through and follow href normally.
      }}
      className={`eyebrow text-muted hover:text-gold inline-flex items-center gap-1.5 transition-colors ${className}`}
    >
      <span aria-hidden="true">←</span>
      <span>{label}</span>
    </Link>
  );
}
