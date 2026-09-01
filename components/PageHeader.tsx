import type { ReactNode } from "react";
import BackLink from "./BackLink";

/**
 * The standard page header. Every screen in the portal and admin area uses
 * this, so the eyebrow / title / spacing rhythm is identical everywhere.
 *
 * Structure, top to bottom:
 *   [ optional back link ]
 *   EYEBROW IN MONO CAPS
 *   Big display heading, with an optional italic gold accent word
 *   [ optional one-line subtitle ]
 *
 * Do not hand-roll page headings. If a screen needs something this cannot
 * express, extend this component rather than writing a one-off.
 */
export default function PageHeader({
  eyebrow,
  title,
  accent,
  trailing,
  subtitle,
  back,
  action,
}: {
  /** Mono uppercase label above the title, e.g. "REGISTER" or a department name. */
  eyebrow?: string;
  /** The plain part of the heading, e.g. "Choose a". */
  title: string;
  /** Optional word rendered in italic gold, e.g. "course". */
  accent?: string;
  /** Text after the accent, usually punctuation such as ".". */
  trailing?: string;
  /** Optional single line of supporting copy. */
  subtitle?: string;
  /** Back control. Omit on top-level tabs (dashboard, cbt, summaries). */
  back?: { href: string; label: string };
  /** Optional right-aligned action, e.g. a primary button. */
  action?: ReactNode;
}) {
  return (
    <header className="mb-8">
      {back ? (
        <div className="mb-3">
          <BackLink href={back.href} label={back.label} />
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="eyebrow text-golddeep mb-3 animate-fade-up" style={{ opacity: 0 }}>
              {eyebrow}
            </p>
          ) : null}

          <h1
            className="font-display text-3xl md:text-4xl font-bold tracking-tight animate-fade-up"
            style={{ animationDelay: "0.05s", opacity: 0 }}
          >
            {title}
            {accent ? <span className="italic font-medium text-gold"> {accent}</span> : null}
            {trailing ?? null}
          </h1>

          {subtitle ? <p className="text-sm text-muted mt-3 max-w-xl">{subtitle}</p> : null}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}
