import "./globals.css";
import type { Metadata, Viewport } from "next";
import Providers from "@/components/Providers";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import InstallAppBanner from "@/components/InstallAppBanner";

export const metadata: Metadata = {
  title: "Ubora World",
  description: "CBT practice, course summaries, past questions and tutorials for NOUN students.",
  applicationName: "Ubora World",
  // iOS never prompts to install - the user adds to home screen manually.
  // These control how it behaves once they do.
  appleWebApp: {
    capable: true,
    title: "Ubora",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  // Tints the browser and OS chrome to match the app.
  themeColor: "#101B33",
};

/*
  Chrome fires beforeinstallprompt as soon as it judges the page installable,
  which is frequently BEFORE React has hydrated and attached its listener.
  The event fires once; miss it and there is no second chance, so the banner
  never appears.

  This inline script runs before any React code and stashes the event on
  window, where InstallAppBanner picks it up on mount. It also re-dispatches
  a custom event so a component mounting later still hears about it.
*/
const CAPTURE_INSTALL_PROMPT = `
(function () {
  window.__uboraInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    window.__uboraInstallPrompt = e;
    window.dispatchEvent(new Event('ubora:installable'));
  });
  window.addEventListener('appinstalled', function () {
    window.__uboraInstallPrompt = null;
    window.dispatchEvent(new Event('ubora:installed'));
  });
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: CAPTURE_INSTALL_PROMPT }} />
      </head>
      <body>
        <Providers>{children}</Providers>
        <ServiceWorkerRegistrar />
        {/* Site-wide so it reaches visitors on the landing page, not just
            signed-in students. Renders nothing when already installed. */}
        <InstallAppBanner />
      </body>
    </html>
  );
}
