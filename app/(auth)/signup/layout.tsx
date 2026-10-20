import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start a 10-day NOUN CBT trial",
  description:
    "Create a free Ubora World account for 10 days of NOUN CBT practice, past questions and course summaries. No card required.",
  alternates: { canonical: "/signup" },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
