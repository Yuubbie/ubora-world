import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refer Ubora World and earn",
  description:
    "Anyone can refer Ubora World. Share your link and earn ₦500 on a friend's first monthly plan or ₦1,000 on a semester plan. Free trials do not count.",
  alternates: { canonical: "/refer" },
};

export default function ReferLayout({ children }: { children: React.ReactNode }) {
  return children;
}
