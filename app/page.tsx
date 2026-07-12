import Link from "next/link";

export default function RootPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 grid md:grid-cols-2">
        <div className="slip-divider relative overflow-hidden flex flex-col justify-center px-8 md:px-16 py-14 bg-ink text-white">
          <div
            className="absolute w-[420px] h-[420px] rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ top: "-100px", left: "-100px", background: "radial-gradient(circle, #C99A2E, transparent)" }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10 animate-fade-up" style={{ opacity: 0 }}>
              <img src="/brand/ubora-icon-cream.svg" alt="Ubora World" className="h-12 w-12 rounded-full object-cover" />
              <span className="font-display font-bold text-2xl tracking-tight">Ubora World</span>
            </div>
            <p
              className="font-mono-brand text-sm tracking-[0.2em] uppercase mb-5 text-gold animate-fade-up"
              style={{ animationDelay: "0.1s", opacity: 0 }}
            >
              NOUN - WAEC - NECO - JAMB
            </p>
            <h1
              className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tighter mb-6 animate-fade-up"
              style={{ animationDelay: "0.15s", opacity: 0 }}
            >
              Everything between you<br />and your <span className="italic font-medium text-gold">next result slip</span>.
            </h1>
            <p
              className="text-white/80 text-lg md:text-xl max-w-lg mb-12 leading-relaxed animate-fade-up"
              style={{ animationDelay: "0.2s", opacity: 0 }}
            >
              CBT practice, course summaries, past questions and tutorial videos -
              organized by faculty, available on your phone, one subscription per semester.
            </p>
            <div
              className="flex flex-wrap gap-3 font-mono-brand text-sm animate-fade-up"
              style={{ animationDelay: "0.25s", opacity: 0 }}
            >
              <span className="flex items-center px-4 py-2 rounded-full border border-white/25 transition-colors duration-150 hover:border-gold hover:text-gold">
                <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block mr-2" />Past Questions
              </span>
              <span className="flex items-center px-4 py-2 rounded-full border border-white/25 transition-colors duration-150 hover:border-gold hover:text-gold">
                <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block mr-2" />CBT Simulator
              </span>
              <span className="flex items-center px-4 py-2 rounded-full border border-white/25 transition-colors duration-150 hover:border-gold hover:text-gold">
                <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block mr-2" />Video &amp; Audio Tutorials
              </span>
              <span className="flex items-center px-4 py-2 rounded-full border border-white/25 transition-colors duration-150 hover:border-gold hover:text-gold">
                <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block mr-2" />Course Summaries
              </span>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden flex flex-col items-center justify-center px-8 py-14 gap-4 bg-paper">
          <svg
            viewBox="0 0 240 240"
            className="absolute pointer-events-none"
            style={{ width: "320px", height: "320px", top: "-60px", right: "-60px", opacity: 0.06 }}
          >
            <path
              d="M78,58 L78,150 C78,181 103,198 133,198 C163,198 184,179 184,148 L184,108 L152,130 L202,54"
              fill="none" stroke="#16233F" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
          <div className="relative z-10 flex flex-col items-center gap-4">
            <p className="font-mono-brand text-sm tracking-[0.2em] uppercase text-muted mb-2 animate-fade-up" style={{ opacity: 0 }}>
              Get started
            </p>
            <Link
              href="/login"
              className="btn-primary group w-full max-w-xs text-base py-3.5 animate-fade-up-scale"
              style={{ animationDelay: "0.1s", opacity: 0 }}
            >
              <span>Log in</span>
              <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/signup"
              className="group w-full max-w-xs text-center rounded-lg py-3.5 text-base font-semibold border border-line text-ink transition-all duration-200 ease-out hover:border-gold hover:-translate-y-0.5 hover:shadow-button animate-fade-up-scale"
              style={{ animationDelay: "0.15s", opacity: 0 }}
            >
              <span>Create an account</span>
              <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}