import Link from "next/link";

export default function RootPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 grid md:grid-cols-2">
        <div className="flex flex-col justify-center px-8 md:px-16 py-14" style={{ background: "#16233F", color: "#fff" }}>
          <div className="flex items-center gap-2.5 mb-8">
            <img src="/brand/ubora-icon-cream.svg" alt="Ubora World" className="h-10 w-10 rounded-full object-cover" />
            <span className="font-display font-semibold text-xl">Ubora World</span>
          </div>
          <p className="font-mono-brand text-xs tracking-widest uppercase mb-4" style={{ color: "#C99A2E" }}>
            NOUN - WAEC - NECO - JAMB
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-5">
            Everything between you<br />and your next result slip.
          </h1>
          <p className="text-white/75 max-w-md mb-10 leading-relaxed">
            CBT practice, course summaries, past questions and tutorial videos -
            organized by faculty, available on your phone, one subscription per semester.
          </p>
          <div className="flex flex-wrap gap-3 font-mono-brand text-xs">
            <span className="px-3 py-1.5 rounded-full border border-white/25">Past Questions</span>
            <span className="px-3 py-1.5 rounded-full border border-white/25">CBT Simulator</span>
            <span className="px-3 py-1.5 rounded-full border border-white/25">Video &amp; Audio Tutorials</span>
            <span className="px-3 py-1.5 rounded-full border border-white/25">Course Summaries</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center px-8 py-14 gap-4" style={{ background: "#F3F5F4" }}>
          <p className="text-muted text-sm mb-2">Get started</p>
          <Link
            href="/login"
            className="w-full max-w-xs text-center rounded-lg py-3 text-sm font-semibold"
            style={{ background: "#16233F", color: "#fff" }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="w-full max-w-xs text-center rounded-lg py-3 text-sm font-semibold border"
            style={{ borderColor: "#DCE1E6", color: "#16233F" }}
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}