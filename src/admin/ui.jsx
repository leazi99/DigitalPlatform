import { useEffect, useRef, useState } from "react";

/**
 * The admin panel's building blocks.
 *
 * Same tokens as the public site — ink, mist, signal, rule, the display and
 * mono typefaces — so the panel looks like part of the same product rather
 * than a bolted-on tool. Denser, though: the public pages are for reading,
 * these screens are for working.
 */

// ── Layout ──────────────────────────────────────────────────────────────────

export function Page({ title, lead, actions, children }) {
  return (
    <div className="mx-auto w-full max-w-[82rem] px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
          {lead && <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-soft">{lead}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </header>
      <div className="mt-8">{children}</div>
    </div>
  );
}

export function Card({ title, lead, actions, className = "", children }) {
  return (
    <section className={`rounded-2xl border border-rule bg-white/70 ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {title && (
              <h2 className="font-display text-base font-extrabold tracking-tight text-ink">
                {title}
              </h2>
            )}
            {lead && <p className="mt-1 text-[0.8125rem] text-ink-soft">{lead}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Eyebrow({ children, className = "" }) {
  return <p className={`eyebrow text-ink-soft ${className}`}>{children}</p>;
}

// ── Numbers ─────────────────────────────────────────────────────────────────

export function Stat({ label, value, hint, tone = "ink" }) {
  const tones = { ink: "text-ink", signal: "text-signal-deep", soft: "text-ink-soft" };
  return (
    <div className="rounded-2xl border border-rule bg-white/70 p-5">
      <Eyebrow>{label}</Eyebrow>
      <p className={`mt-3 font-display text-3xl font-black tracking-tight ${tones[tone]}`}>{value}</p>
      {hint && <p className="mt-2 text-[0.8125rem] leading-snug text-ink-soft">{hint}</p>}
    </div>
  );
}

// ── Buttons ─────────────────────────────────────────────────────────────────

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[0.8125rem] font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-55";

const btnVariants = {
  primary: "bg-ink text-white hover:bg-signal-deep",
  signal: "bg-signal text-white hover:bg-signal-deep",
  outline: "border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-white",
  subtle: "bg-ink/6 text-ink hover:bg-ink/12",
  danger: "border border-red-300 text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600",
  ghost: "text-ink-soft hover:text-ink hover:bg-ink/6",
};

export function Btn({ as: Tag = "button", variant = "primary", className = "", ...rest }) {
  return <Tag className={`${btnBase} ${btnVariants[variant]} ${className}`} {...rest} />;
}

/**
 * A destructive action that asks first, in place.
 *
 * The confirmation is the button turning into "Really delete?" rather than a
 * browser dialog: it cannot be suppressed by a "don't ask again" checkbox, and
 * a stray Enter keypress does not confirm it because the button that appears
 * is not the one that had focus.
 */
export function ConfirmBtn({ onConfirm, label = "Delete", confirmLabel = "Really delete?", ...rest }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [armed]);

  return (
    <Btn
      // Never a submit button: this is destructive, and it sits inside forms.
      type="button"
      variant={armed ? "danger" : "ghost"}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else {
          setArmed(true);
        }
      }}
      {...rest}
    >
      {armed ? confirmLabel : label}
    </Btn>
  );
}

// ── Form controls ───────────────────────────────────────────────────────────

export const inputClass =
  "w-full rounded-xl border border-rule bg-mist px-3.5 py-2.5 text-[0.9375rem] text-ink transition-colors placeholder:text-ink-soft/50 focus:border-signal focus:outline-none disabled:opacity-60";

export function FormField({ label, hint, error, htmlFor, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between gap-3">
          <span className="text-[0.8125rem] font-semibold text-ink">{label}</span>
          {hint && (
            <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-soft">
              {hint}
            </span>
          )}
        </label>
      )}
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-[0.8125rem] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className = "", invalid, ...rest }) {
  return <input className={`${inputClass} ${invalid ? "border-red-500" : ""} ${className}`} {...rest} />;
}

export function Textarea({ className = "", invalid, rows = 4, ...rest }) {
  return (
    <textarea
      rows={rows}
      className={`${inputClass} resize-y ${invalid ? "border-red-500" : ""} ${className}`}
      {...rest}
    />
  );
}

export function Select({ className = "", invalid, children, ...rest }) {
  return (
    <select className={`${inputClass} ${invalid ? "border-red-500" : ""} ${className}`} {...rest}>
      {children}
    </select>
  );
}

export function Toggle({ checked, onChange, label, id }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-3">
      <input
        id={id}
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 shrink-0 rounded border-rule text-signal accent-signal"
      />
      <span className="text-[0.8125rem] font-semibold text-ink">{label}</span>
    </label>
  );
}

// ── Feedback ────────────────────────────────────────────────────────────────

const alertTones = {
  error: "border-red-300 bg-red-50 text-red-800",
  success: "border-signal/40 bg-signal/10 text-signal-deep",
  info: "border-rule bg-mist-deep/60 text-ink-soft",
  warn: "border-amber-300 bg-amber-50 text-amber-800",
};

export function Alert({ tone = "info", children, onDismiss }) {
  if (!children) return null;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-[0.875rem] leading-relaxed ${alertTones[tone]}`}
    >
      <div className="min-w-0">{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.14em] underline underline-offset-4"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}

const badgeTones = {
  neutral: "bg-ink/8 text-ink-soft",
  signal: "bg-signal/15 text-signal-deep",
  warn: "bg-amber-500/18 text-amber-700",
  good: "bg-emerald-500/15 text-emerald-700",
  bad: "bg-red-500/12 text-red-700",
};

export function Badge({ tone = "neutral", children }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.12em] ${badgeTones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Empty({ title, body, action }) {
  return (
    <div className="flex flex-col items-start gap-3 px-5 py-14 sm:items-center sm:px-6 sm:text-center">
      <p className="font-display text-lg font-extrabold tracking-tight text-ink">{title}</p>
      {body && <p className="max-w-md text-[0.9375rem] leading-relaxed text-ink-soft">{body}</p>}
      {action}
    </div>
  );
}

export function Loading({ label = "Loading…" }) {
  return (
    <div className="flex items-center gap-3 px-5 py-14 text-[0.875rem] text-ink-soft sm:px-6">
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-rule border-t-signal"
      />
      {label}
    </div>
  );
}

// ── Tables ──────────────────────────────────────────────────────────────────

/**
 * A table that scrolls sideways rather than squeezing its columns.
 *
 * `minWidth` is the width below which it starts scrolling. It is a prop rather
 * than something to override through `className`, because two competing
 * `min-w-` classes resolve by stylesheet order, not by which one was passed
 * last — so the override would work or not depending on the build.
 */
export function Table({ children, className = "", minWidth = "min-w-[40rem]" }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${minWidth} border-collapse text-left ${className}`}>{children}</table>
    </div>
  );
}

export function TH({ className = "", children, ...rest }) {
  return (
    <th
      scope="col"
      className={`border-b border-rule px-4 py-3 font-mono text-[0.625rem] font-medium uppercase tracking-[0.14em] text-ink-soft ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
}

export function TD({ className = "", children, ...rest }) {
  return (
    <td className={`border-b border-rule/60 px-4 py-3 align-top text-[0.875rem] ${className}`} {...rest}>
      {children}
    </td>
  );
}

// ── Drawer ──────────────────────────────────────────────────────────────────

/**
 * The panel every add and edit form opens in.
 *
 * A drawer rather than a modal so the list stays visible behind it — the
 * context for "is this the right row" is the list. Escape closes it, the first
 * field takes focus on open, and focus returns to whatever opened it.
 */
export function Drawer({ open, title, lead, onClose, footer, children }) {
  const panel = useRef(null);
  const body = useRef(null);
  const returnFocusTo = useRef(null);

  useEffect(() => {
    if (!open) return;

    returnFocusTo.current = document.activeElement;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the first field, so the drawer can be filled in from the keyboard
    // without reaching for the mouse first. Scoped to the body: the first
    // focusable thing in the panel as a whole is the header's Close button, and
    // opening a form with Close focused invites closing it by reflex.
    const first = body.current?.querySelector(
      "input:not([type=hidden]), textarea, select, button",
    );
    first?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusTo.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex h-full w-full max-w-xl flex-col bg-mist shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-rule px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-extrabold tracking-tight text-ink">{title}</h2>
            {lead && <p className="mt-1 text-[0.8125rem] text-ink-soft">{lead}</p>}
          </div>
          <Btn variant="ghost" onClick={onClose} aria-label="Close">
            Close
          </Btn>
        </header>

        <div ref={body} className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>

        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-rule bg-white/60 px-5 py-4 sm:px-6">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
