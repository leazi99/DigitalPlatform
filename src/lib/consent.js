import { useSyncExternalStore } from "react";

/**
 * The visitor's cookie choice, and whether the consent dialog is open.
 *
 * Two categories, because the site only has two: what it needs to work (which
 * is just remembering this choice) and the first-party visit statistics in
 * ./track.js. Nothing is recorded until the visitor says yes to the second.
 *
 * The choice lives in the browser's own storage. Where storage is blocked it is
 * kept for the visit only, and the visitor is asked again next time.
 */

const KEY = "dw.consent";
const VERSION = 1; // bump to ask everyone again after the categories change

let consent = read();
let open = false;
let onDone = null;
let snapshot = { consent, open };
const listeners = new Set();

function read() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return saved?.version === VERSION ? saved : null;
  } catch {
    return null;
  }
}

function emit() {
  snapshot = { consent, open };
  for (const listener of listeners) listener();
}

export function subscribeConsent(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** `null` until the visitor has chosen. */
export function getConsent() {
  return consent;
}

export function analyticsAllowed() {
  return consent?.analytics === true;
}

export function saveConsent({ analytics }) {
  consent = { version: VERSION, necessary: true, analytics: Boolean(analytics), decidedAt: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(consent));
  } catch {
    /* kept in memory for this visit */
  }

  const next = onDone;
  open = false;
  onDone = null;
  emit();
  next?.();
}

/** Open the dialog. `then` runs once the visitor has made a choice. */
export function openConsent(then = null) {
  open = true;
  onDone = then;
  emit();
}

/** Close without choosing — only offered once a choice already exists. */
export function closeConsent() {
  open = false;
  onDone = null;
  emit();
}

export function useConsent() {
  return useSyncExternalStore(subscribeConsent, () => snapshot);
}
