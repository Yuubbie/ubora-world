import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Ubora World",
  description: "CBT practice, course summaries, past questions and tutorials for NOUN students.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
