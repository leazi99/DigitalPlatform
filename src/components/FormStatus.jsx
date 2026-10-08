import { useCompany } from "../content/useContent";

/**
 * The panel shown after a form is submitted — success or failure.
 *
 * The failure case always names the email and phone: if our form is broken,
 * the visitor should still be able to reach the business.
 */
export function SuccessPanel({ heading, body, onReset, resetLabel }) {
  const company = useCompany();

  return (
    <div className="flex min-h-[24rem] flex-col items-start justify-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-signal/12 text-signal">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5 L10 17.5 L19 7" />
        </svg>
      </span>
      <h3 className="mt-6 font-display text-2xl font-extrabold tracking-tight text-ink">{heading}</h3>
      <p className="mt-3 max-w-sm leading-relaxed text-ink-soft">
        {body}{" "}
        <a href={`mailto:${company.email}`} className="text-signal-deep underline underline-offset-4">
          {company.email}
        </a>
        .
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-8 text-sm font-semibold text-ink underline decoration-signal decoration-2 underline-offset-4"
      >
        {resetLabel}
      </button>
    </div>
  );
}

export function ErrorPanel({ message }) {
  const company = useCompany();

  return (
    <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4">
      <p className="text-[0.875rem] leading-relaxed text-red-800">{message}</p>
      <p className="mt-2 text-[0.875rem] text-red-800">
        <a href={`mailto:${company.email}`} className="underline underline-offset-4">
          {company.email}
        </a>
        {" · "}
        <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="underline underline-offset-4">
          {company.phone}
        </a>
      </p>
    </div>
  );
}

/** The submit button, with its in-flight state. */
export function SubmitButton({ busy, children, busyLabel = "Sending…" }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-sm font-semibold text-white transition duration-200 hover:bg-signal-deep disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy ? busyLabel : children}
      {!busy && (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h13M13 6l6 6-6 6" />
        </svg>
      )}
    </button>
  );
}
