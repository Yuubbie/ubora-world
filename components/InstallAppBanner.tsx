"use client";

import { useEffect, useState } from "react";

/**
 * Site-wide install banner.
 *
 * WHAT A BROWSER WILL AND WILL NOT ALLOW
 *   A site cannot open the native install dialog by itself - Chrome requires
 *   a user gesture, and iOS Safari has no programmatic install at all. So the
 *   most any site can do is surface its own banner immediately and open the
 *   real dialog when the user taps it. That is what this does.
 *
 * Mounted in the root layout so it reaches visitors on the landing page,
 * not just signed-in students.
 *
 * Renders nothing when:
 *   - already running as an installed app
 *   - the browser has not signalled installability (no beforeinstallprompt)
 *   - the user dismissed it (remembered for 30 days)
 */

const DISMISS_KEY = "ubora-install-dismissed-until";
const DISMISS_DAYS = 30;

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function IconDownload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function InstallAppBanner() {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed and running standalone - nothing to offer.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (standalone) return;

    try {
      const until = window.localStorage.getItem(DISMISS_KEY);
      if (until && Date.now() < Number(until)) return;
    } catch {
      // localStorage throws in some private modes - carry on.
    }

    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    if (iOS) {
      // Safari never fires beforeinstallprompt, so show instructions instead.
      setIsIOS(true);
      setVisible(true);
      return;
    }

    const onBeforeInstall = (e: Event) => {
      // Suppress Chrome's own mini-infobar where it still appears, so we
      // control when and how the offer is shown.
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
      setVisible(true);
    };

    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(
        DISMISS_KEY,
        String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000)
      );
    } catch {
      // Dismissal simply will not persist.
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    if (outcome === "accepted") setVisible(false);
    else dismiss();
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Install Ubora World"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 animate-fade-up"
      style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-ink text-white shadow-cardHover px-5 py-4 flex items-center gap-4">
        <img
          src="/icons/icon-192.png"
          alt=""
          aria-hidden="true"
          className="h-10 w-10 rounded-xl shrink-0"
        />

        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold tracking-tight">
            {isIOS ? "Add Ubora World to your home screen" : "Install Ubora World"}
          </p>
          <p className="font-mono-brand text-xs text-white/60 mt-0.5">
            {isIOS
              ? "Tap Share, then Add to Home Screen."
              : "Full screen, faster launch, works like an app."}
          </p>
        </div>

        {!isIOS && (
          <button onClick={install} className="btn-gold btn-sm shrink-0">
            <span className="mr-1.5">
              <IconDownload />
            </span>
            <span>Install</span>
          </button>
        )}

        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-white/50 hover:text-white transition-colors shrink-0"
        >
          <IconClose />
        </button>
      </div>
    </div>
  );
}
