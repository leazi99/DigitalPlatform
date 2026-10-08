import { useCompany } from "../content/useContent";

/**
 * Shared brand lockup used across the site.
 */
export default function Logo({ tone = "dark", subtitle = true }) {
  const company = useCompany();
  const ink = tone === "dark" ? "var(--color-ink)" : "#ffffff";
  const accent = "var(--color-signal)";

  return (
    <span className="inline-flex items-center gap-3">
      <svg viewBox="0 0 56 56" aria-hidden="true" className="h-11 w-11 shrink-0">
        <circle cx="28" cy="28" r="26" fill="none" stroke={accent} strokeWidth="2.5" />
        <circle cx="28" cy="28" r="20" fill="none" stroke={accent} strokeWidth="1.8" opacity="0.9" />
        <path d="M8 28h40" fill="none" stroke={accent} strokeWidth="1.7" opacity="0.75" />
        <path d="M28 6c-6.5 5.5-10 13.2-10 22s3.5 16.5 10 22" fill="none" stroke={accent} strokeWidth="1.7" opacity="0.75" />
        <path d="M28 6c6.5 5.5 10 13.2 10 22s-3.5 16.5-10 22" fill="none" stroke={accent} strokeWidth="1.7" opacity="0.75" />
        <path d="M18 16c3.7 2.2 7.6 3.3 10 3.3S32.3 18.2 36 16" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.7" />
        <path d="M18 40c3.7-2.2 7.6-3.3 10-3.3s4.3 1.1 8 3.3" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.7" />
        <text
          x="28"
          y="35"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="18"
          fontWeight="700"
          fill={ink}
          letterSpacing="-1"
        >
          DW
        </text>
      </svg>
      <span className="leading-tight">
        <span className="block font-display text-[0.95rem] font-extrabold tracking-tight sm:text-[1.02rem]" style={{ color: ink }}>
          {company.name}
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
