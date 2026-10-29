import { useEffect, useRef, useState } from "react";
import { closeConsent, saveConsent, useConsent } from "../lib/consent";

/**
 * The cookie dialog: accept, reject, or choose per category.
 *
 * A native <dialog> opened with showModal(), so focus is trapped, the page
 * behind is inert and Escape is handled by the browser. The first time it is
 * shown a choice is required — Escape and the backdrop do nothing — because
 * the visitor is on their way to the next page and has to land somewhere.
 * Reopened later from the footer, it can simply be closed.
 *
 * Reject sits next to Accept at the same size: a "no" that is harder to find
 * than the "yes" is not a choice.
 */
export default function CookieConsent() {
  const { consent, open } = useConsent();
  const ref = useRef(null);
  const [managing, setManaging] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const required = consent === null;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setManaging(false);
      setAnalytics(consent?.analytics ?? false);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, consent]);

  const onCancel = (event) => {
    event.preventDefault();
    if (!required) closeConsent();
  };

  return (
    <dialog
      ref={ref}
      onCancel={onCancel}
      aria-labelledby="cookie-title"
      aria-describedby="cookie-body"
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-rule bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-signal-deep">Your privacy</p>
            <h2 id="cookie-title" className="mt-3 font-display text-2xl font-extrabold tracking-tight">
              {managing ? "Manage cookie preferences" : "We use cookies"}
            </h2>
          </div>
          {!required && (
            <button
              type="button"
              onClick={closeConsent}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/15 hover:border-ink"
            >
              <span className="sr-only">Close</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>

        <p id="cookie-body" className="mt-4 leading-relaxed text-ink-soft">
          We use cookies and similar browser storage to keep the site working and, if you allow
          it, to count visits so we can see which pages help people. No advertising, no third
          parties, nothing that identifies you.
        </p>

        {managing && (
          <ul className="mt-6 divide-y divide-rule rounded-xl border border-rule">
            <Category
              title="Strictly necessary"
              body="Remembers the choice you make here. The site cannot work without it."
              checked
              disabled
            />
            <Category
              title="Analytics"
              body="Counts which pages are opened, for how long, and which buttons are clicked — with a random id, never your name or IP address."
              checked={analytics}
              onChange={setAnalytics}
            />
          </ul>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          {managing ? (
            <>
              <Action onClick={() => saveConsent({ analytics })} primary>
                Save preferences
              </Action>
              <Action onClick={() => saveConsent({ analytics: true })}>Accept all</Action>
            </>
          ) : (
            <>
              <Action onClick={() => saveConsent({ analytics: true })} primary>
                Accept
              </Action>
              <Action onClick={() => saveConsent({ analytics: false })} primary>
                Reject
              </Action>
            </>
          )}
        </div>

        {!managing && (
          <button
            type="button"
            onClick={() => setManaging(true)}
            className="mt-5 w-full text-center text-sm font-medium text-signal-deep underline decoration-signal/40 underline-offset-4 hover:decoration-signal"
          >
            Manage preferences
          </button>
        )}
      </div>
    </dialog>
  );
}

function Category({ title, body, checked, disabled = false, onChange }) {
  const id = `cookie-${title.toLowerCase().replace(/\W+/g, "-")}`;

  return (
    <li className="flex items-start justify-between gap-5 p-4">
      <div>
        <label htmlFor={id} className="font-display font-bold tracking-tight">
          {title}
        </label>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{body}</p>
        {disabled && <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-soft">Always on</p>}
      </div>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-signal disabled:opacity-60"
      />
    </li>
  );
}

function Action({ primary = false, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex flex-1 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold tracking-tight transition duration-200 ${
        primary ? "bg-ink text-white hover:bg-signal-deep" : "border border-ink/25 text-ink hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}
