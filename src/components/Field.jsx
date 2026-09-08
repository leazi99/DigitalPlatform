export const fieldClass =
  "w-full rounded-xl border bg-mist px-4 py-3 text-[0.9375rem] text-ink transition-colors placeholder:text-ink-soft/50 focus:border-signal focus:outline-none";

/** A labelled form control with its error message. Shared by both forms. */
export default function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={`field-${id}`} className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-ink">{label}</span>
        {hint && (
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-soft">
            {hint}
          </span>
        )}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-2 text-[0.8125rem] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
