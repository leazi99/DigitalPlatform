/**
 * Visitor tracking, first-party and deliberately small.
 *
 * What is recorded: which pages were opened, in what order, for how long, and
 * which buttons were clicked. What is not: no IP address, no cookie, no
 * third-party script, nothing that identifies a person. The visitor id is a
 * random string the browser keeps in its own storage and can clear at will.
 *
 * A browser that sends Do Not Track is not recorded at all. That means the
 * admin's figures are a slight undercount rather than a complete one, which is
 * the trade this file deliberately makes — and the dashboard says so on screen
 * instead of presenting the number as the whole truth.
 */

const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const ENDPOINT = `${base}/api/track`;

const VISITOR_KEY = "dw.vid";
const SESSION_KEY = "dw.sid";
const SESSION_STARTED_KEY = "dw.sid.started";
const SESSION_SEEN_KEY = "dw.sid.seen";

// A visit is over after half an hour of inactivity — the same window most
// analytics use, so the numbers are comparable to anything else you read.
const SESSION_IDLE_MS = 30 * 60 * 1000;
const PING_MS = 15 * 1000;

let started = 0; // when the current session began
let pageOpenedAt = 0; // when the current page was opened
let currentPath = "";
let pingTimer = null;
let enabled = null; // decided once, lazily

function optedOut() {
  if (typeof navigator === "undefined") return true;
  return (
    navigator.doNotTrack === "1" ||
    window.doNotTrack === "1" ||
    navigator.msDoNotTrack === "1" ||
    navigator.globalPrivacyControl === true
  );
}

/** Tracking needs storage to tell one visit from the next. Where storage is
 *  blocked we do not track at all rather than record every page as a brand new
 *  visitor, which would make the dashboard's numbers fiction. */
function storageWorks() {
  try {
    localStorage.setItem("dw.probe", "1");
    localStorage.removeItem("dw.probe");
    sessionStorage.setItem("dw.probe", "1");
    sessionStorage.removeItem("dw.probe");
    return true;
  } catch {
    return false;
  }
}

function isEnabled() {
  if (enabled === null) enabled = !optedOut() && storageWorks();
  return enabled;
}

function randomId() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function visitorId() {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = randomId();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

/** The session id, rotated when the visitor has been idle long enough. */
function sessionId() {
  const now = Date.now();
  const lastSeen = Number(sessionStorage.getItem(SESSION_SEEN_KEY)) || 0;
  let id = sessionStorage.getItem(SESSION_KEY);

  if (!id || now - lastSeen > SESSION_IDLE_MS) {
    id = randomId();
    sessionStorage.setItem(SESSION_KEY, id);
    sessionStorage.setItem(SESSION_STARTED_KEY, String(now));
  }

  sessionStorage.setItem(SESSION_SEEN_KEY, String(now));
  started = Number(sessionStorage.getItem(SESSION_STARTED_KEY)) || now;
  return id;
}

/** The session the browser is in, for a form to send with its submission so
 *  the admin can see which visit turned into an enquiry. Never creates one. */
export function currentSessionId() {
  if (!isEnabled()) return null;
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

/**
 * Send one beat.
 *
 * `keepalive` lets the request outlive the page, which is the only way a beat
 * sent as the visitor navigates away arrives at all. `sendBeacon` is used
 * where it is available because it is queued by the browser rather than by the
 * page that is about to close.
 */
function send(payload, { final = false } = {}) {
  if (!isEnabled()) return;

  const body = JSON.stringify({
    visitorId: visitorId(),
    sessionId: sessionId(),
    durationMs: Date.now() - started,
    screen: `${window.screen?.width ?? 0}x${window.screen?.height ?? 0}`,
    language: navigator.language ?? "",
    referrer: document.referrer ?? "",
    ...payload,
  });

  try {
    if (final && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
      return;
    }
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      /* a dropped beat is not the visitor's problem, and not worth a retry */
    });
  } catch {
    /* ditto */
  }
}

/**
 * Record a page being opened.
 *
 * The hash is dropped: `/institute` and `/institute#syllabus` are the same
 * page, and counting them separately would split every page's figures across
 * however many anchors the nav happens to have.
 */
export function trackPageview(path, title = document.title) {
  if (!isEnabled()) return;

  // Close off the previous page's dwell time before opening the next.
  if (currentPath && pageOpenedAt) {
    send({ type: "pageview-end", path: currentPath, durationMs: Date.now() - pageOpenedAt });
  }

  currentPath = stripHash(path);
  pageOpenedAt = Date.now();

  send({ type: "pageview", path: currentPath, title });
  startPinging();
}

/** Record something the visitor did: a button, a form, a scroll depth. */
export function trackEvent(name, meta = {}) {
  if (!isEnabled()) return;
  send({ type: "event", name, path: currentPath || stripHash(location.pathname), meta });
}

function stripHash(path) {
  return String(path).split("#")[0] || "/";
}

/** A beat every fifteen seconds, so time on the page is known even if the
 *  visitor leaves in a way that fires nothing. Paused when the tab is hidden —
 *  a page sitting in a background tab is not time spent reading it. */
function startPinging() {
  stopPinging();
  pingTimer = setInterval(() => {
    if (document.visibilityState === "visible") send({ type: "ping", path: currentPath });
  }, PING_MS);
}

function stopPinging() {
  if (pingTimer) clearInterval(pingTimer);
  pingTimer = null;
}

let listening = false;

/** Called once, from the app shell. */
export function startTracking() {
  if (!isEnabled() || listening) return;
  listening = true;

  // `pagehide` fires where `unload` is unreliable — notably when iOS Safari
  // freezes a page instead of unloading it.
  window.addEventListener("pagehide", () => {
    if (currentPath && pageOpenedAt) {
      send(
        { type: "pageview-end", path: currentPath, durationMs: Date.now() - pageOpenedAt },
        { final: true },
      );
    }
    stopPinging();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      send({ type: "ping", path: currentPath }, { final: true });
    }
  });

  trackScrollDepth();
}

/**
 * How far down the page the visitor got, reported once per threshold per page.
 *
 * This is the difference between "opened the page" and "read the page", which
 * is the whole point of an engagement figure.
 */
function trackScrollDepth() {
  const thresholds = [25, 50, 75, 100];
  let reached = new Set();
  let pathAtReset = currentPath;
  let frame = null;

  const measure = () => {
    frame = null;

    if (currentPath !== pathAtReset) {
      reached = new Set();
      pathAtReset = currentPath;
    }

    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;

    const percent = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
    for (const mark of thresholds) {
      if (percent >= mark && !reached.has(mark)) {
        reached.add(mark);
        trackEvent("scroll_depth", { percent: mark });
      }
    }
  };

  window.addEventListener(
    "scroll",
    () => {
      // One measurement per frame at most: a scroll handler that runs on every
      // pixel is the classic way to make a page feel heavy.
      if (frame === null) frame = requestAnimationFrame(measure);
    },
    { passive: true },
  );
}

/** Whether anything is being recorded, so the admin panel can say so plainly. */
export function trackingEnabled() {
  return isEnabled();
}
