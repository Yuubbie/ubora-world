import type { MetadataRoute } from "next";

/**
 * Web app manifest. Next.js serves this at /manifest.webmanifest and injects
 * the <link rel="manifest"> tag automatically - no layout change needed for it.
 *
 * Icons live in public/ so they are served as static assets.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ubora World",
    short_name: "Ubora",
    description:
      "CBT practice, course summaries, past questions and tutorial videos for NOUN, WAEC, NECO and JAMB - organised by faculty.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#101B33",
    theme_color: "#101B33",
    categories: ["education"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        // Padded so Android's circle / squircle mask never clips the mark.
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
