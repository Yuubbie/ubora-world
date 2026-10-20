import "./globals.css";
import type { Metadata, Viewport } from "next";
import Providers from "@/components/Providers";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import InstallAppBanner from "@/components/InstallAppBanner";
import InquiryChat from "@/components/InquiryChat";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ubora World | NOUN CBT Practice, Past Questions & Summaries",
    template: "%s | Ubora World",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "NOUN CBT",
    "NOUN past questions",
    "National Open University of Nigeria",
    "NOUN exam practice",
    "NOUN TMA practice",
    "NOUN course summaries",
    "GST101",
    "Ubora World",
    "NOUN elearn",
    "nouonline",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Ubora World | NOUN CBT Practice, Past Questions & Summaries",
    description: SITE_DESCRIPTION,
    images: [{ url: "/brand/ubora-logo.jpeg", width: 512, height: 512, alt: "Ubora World" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ubora World | NOUN CBT Practice, Past Questions & Summaries",
    description: SITE_DESCRIPTION,
    images: ["/brand/ubora-logo.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
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
        <InquiryChat />
      </body>
    </html>
  );
}
