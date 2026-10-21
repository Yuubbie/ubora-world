import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start a 24-hour NOUN CBT trial",
  description:
    "Create a free Ubora World account for 24 hours of NOUN CBT practice, past questions and course summaries. No card required.",
  alternates: { canonical: "/signup" },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
