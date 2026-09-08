import { company } from "../data/company";

/**
 * The shared wordmark. Both sectors carry the same mark and the same
 * company name — the `suffix` is the only thing that tells a visitor
 * which side of the business they are on.
 */
export default function Logo({ tone = "dark", suffix, subtitle = true }) {
  const ink = tone === "dark" ? "var(--color-ink)" : "#ffffff";

  return (
    <span className="inline-flex items-center gap-3">
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 shrink-0">
        <rect width="32" height="32" rx="7" fill={ink} />
        <path
          d="M6 23 L13 15 L18 19 L26 8"
          fill="none"
          stroke="var(--color-signal)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="26" cy="8" r="3" fill="var(--color-signal)" />
      </svg>
      <span className="leading-tight">
        <span
          className="block font-display text-[0.95rem] font-extrabold tracking-tight"
          style={{ color: ink }}
        >
          {company.short}
          <span className="text-signal">{suffix ? ` ${suffix}` : " Pvt.Ltd"}</span>
        </span>
        {subtitle && (
          <span
            className="hidden font-mono text-[0.5625rem] uppercase tracking-[0.18em] sm:block"
            style={{ color: ink, opacity: 0.55 }}
          >
            {company.tagline}
          </span>
        )}
      </span>
    </span>
  );
}
