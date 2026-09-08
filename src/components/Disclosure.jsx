/**
 * An expand/collapse row, used by the syllabus and the FAQ.
 *
 * Built on native `<details>`/`<summary>` rather than buttons and state: the
 * browser gives us the keyboard handling, the ARIA semantics and find-in-page
 * (Chrome will open a closed section to reveal a match) for free, and none of
 * it can drift out of sync the way a hand-rolled version does.
 */
export default function Disclosure({ summary, aside, defaultOpen = false, children }) {
  return (
    <details
      open={defaultOpen}
      className="group border-b border-rule last:border-b-0 [&[open]_.disclosure-mark]:rotate-45"
    >
      <summary className="flex cursor-pointer list-none items-start gap-5 py-6 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">{summary}</div>
        {aside}
        <span
          aria-hidden="true"
          className="disclosure-mark mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-rule text-signal-deep transition-transform duration-300 group-hover:border-signal"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </summary>
      <div className="pb-8 pr-12">{children}</div>
    </details>
  );
}
