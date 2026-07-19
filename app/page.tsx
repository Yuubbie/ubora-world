import Link from "next/link";

export default function RootPage() {
  return (
    <div className="min-h-[100dvh] md:min-h-screen flex flex-col">
      <div className="flex-1 grid md:grid-cols-2">
        <div className="slip-divider bg-grain relative overflow-hidden flex flex-col justify-center px-6 py-6 md:px-14 md:py-12 bg-ink text-white">
          <div
            className="absolute w-[380px] h-[380px] rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ top: "-100px", left: "-100px", background: "radial-gradient(circle, #C99A2E, transparent)" }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-3 md:mb-7 animate-fade-up" style={{ opacity: 0 }}>
              <img src="/brand/ubora-icon-cream.svg" alt="Ubora World" className="h-8 w-8 md:h-11 md:w-11 rounded-full object-cover" />
              <span className="font-display font-bold text-lg md:text-xl tracking-tight">Ubora World</span>
            </div>
            <p className="eyebrow mb-2 md:mb-4 text-gold animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
              NOUN - WAEC - NECO - JAMB
            </p>
            <h1 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold leading-[1.15] md:leading-[1.1] tracking-tight mb-2.5 md:mb-4 max-w-xl animate-fade-up" style={{ animationDelay: "0.15s", opacity: 0 }}>
              Everything between you and your <span className="italic font-medium text-gold">next result slip</span>.
            </h1>
            <p className="text-white/80 text-sm md:text-lg max-w-md mb-3 md:mb-8 leading-normal md:leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
              CBT practice, course summaries, past questions and tutorial videos -
              organized by faculty, available on your phone, one subscription per semester.
            </p>
            <div className="hidden md:flex flex-wrap gap-2.5 font-mono-brand text-xs animate-fade-up" style={{ animationDelay: "0.25s", opacity: 0 }}>
              <span className="flex items-center px-3 py-1.5 rounded-full border border-white/25 transition-colors duration-150 hover:border-gold hover:text-gold">
                <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block mr-2" />Past Questions
              </span>
              <span className="flex items-center px-3 py-1.5 rounded-full border border-white/25 transition-colors duration-150 hover:border-gold hover:text-gold">
                <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block mr-2" />CBT Simulator
              </span>
              <span className="flex items-center px-3 py-1.5 rounded-full border border-white/25 transition-colors duration-150 hover:border-gold hover:text-gold">
                <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block mr-2" />Video &amp; Audio Tutorials
              </span>
              <span className="flex items-center px-3 py-1.5 rounded-full border border-white/25 transition-colors duration-150 hover:border-gold hover:text-gold">
                <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block mr-2" />Course Summaries
              </span>
            </div>
          </div>
        </div>
        <div className="bg-dot-grid relative overflow-hidden flex flex-col items-center justify-center px-6 py-6 md:px-8 md:py-12 gap-2.5 md:gap-4 bg-paper">
          <svg
            viewBox="0 0 240 240"
            className="absolute pointer-events-none"
            style={{ width: "300px", height: "300px", top: "-50px", right: "-50px", opacity: 0.05 }}
          >
            <path
              d="M78,58 L78,150 C78,181 103,198 133,198 C163,198 184,179 184,148 L184,108 L152,130 L202,54"
              fill="none"
              stroke="#16233F"
              strokeWidth="30"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="relative z-10 flex flex-col items-center gap-2 md:gap-3.5 w-full">
            <p className="eyebrow text-muted mb-0.5 md:mb-1 animate-fade-up" style={{ opacity: 0 }}>
              Get started
            </p>
            <Link
              href="/login"
              className="btn-primary group w-full max-w-xs text-sm py-2.5 md:py-3 animate-fade-up-scale"
              style={{ animationDelay: "0.1s", opacity: 0 }}
            >
              <span>Log in</span>
              <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/signup"
              className="group w-full max-w-xs text-center rounded-xl py-2.5 md:py-3 text-sm font-semibold border border-line text-ink transition-all duration-200 ease-out hover:border-gold hover:shadow-button animate-fade-up-scale"
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
