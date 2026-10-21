import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in to NOUN CBT practice",
  description:
    "Log in to Ubora World to sit NOUN CBT practice, read course summaries, and continue your 24-hour trial.",
  alternates: { canonical: "/login" },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
