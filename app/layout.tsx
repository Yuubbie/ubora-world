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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
