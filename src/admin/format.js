// Turning what the database stores into what a person reads.
//
// Kept apart from `ui.jsx` so that file exports nothing but components —
// which is what lets Vite hot-reload a component edit without losing the
// screen's state.

/** SQLite hands back "2026-09-25 07:17:42" in UTC. Without the Z a browser
 *  reads it as local time and every timestamp is hours out. */
export function parseStamp(value) {
  if (!value) return null;
  const date = new Date(`${String(value).replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value) {
  const date = parseStamp(value);
  if (!date) return "—";
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(value) {
  const date = parseStamp(value);
  if (!date) return "—";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function formatAgo(value) {
  const date = parseStamp(value);
  if (!date) return "—";

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";

  const steps = [
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.35, "week"],
    [12, "month"],
  ];

  let amount = seconds / 60;
  let unit = "minute";
  for (let i = 1; i < steps.length; i++) {
    if (Math.abs(amount) < steps[i][0]) break;
    amount /= steps[i][0];
    unit = steps[i][1];
  }

  return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(
    -Math.round(amount),
    unit,
  );
}

export function formatDuration(ms) {
  const seconds = Math.round((Number(ms) || 0) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function formatNumber(value) {
  return new Intl.NumberFormat().format(Number(value) || 0);
}
