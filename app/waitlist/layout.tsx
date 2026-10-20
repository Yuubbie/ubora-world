import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Waitlist",
};

export default function WaitlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
