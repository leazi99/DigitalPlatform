// Visitor tracking: what gets recorded, and the numbers the dashboard reads.
//
// This is first-party and deliberately thin. No IP address is stored, no
// cookie is set, nothing is sent to a third party. A visitor is a random id
// the browser keeps in its own storage, which is enough to answer "how many
// people came, and did they engage" and not enough to identify anyone.

import { db } from "./db.js";

/** A session counts as engaged if the visitor did more than glance at one
 *  page: a second page, half a minute, or any deliberate action. The
 *  dashboard states this definition on screen rather than leaving the admin
 *  to guess what "engaged" was measured as. */
const ENGAGED_SQL = "(pageviews >= 2 OR duration_ms >= 30000 OR events >= 1)";

const BOT = /bot|crawler|spider|crawling|slurp|bingpreview|headlesschrome|lighthouse|pingdom|curl|wget|python-requests|axios/i;

export function looksLikeABot(userAgent = "") {
  return BOT.test(userAgent);
}

/** Enough of the user agent to group a dashboard by, and no more. */
export function describeClient(ua = "") {
  const device = /iPad|Tablet/i.test(ua)
    ? "Tablet"
    : /Mobi|Android|iPhone|iPod/i.test(ua)
      ? "Mobile"
      : "Desktop";

  const browser = /Edg\//i.test(ua)
    ? "Edge"
    : /OPR\/|Opera/i.test(ua)
      ? "Opera"
      : /Chrome\//i.test(ua)
        ? "Chrome"
        : /Safari\//i.test(ua)
          ? "Safari"
          : /Firefox\//i.test(ua)
            ? "Firefox"
            : "Other";

  const os = /Windows/i.test(ua)
    ? "Windows"
    : /Android/i.test(ua)
      ? "Android"
      : /iPhone|iPad|iPod/i.test(ua)
        ? "iOS"
        : /Mac OS X/i.test(ua)
          ? "macOS"
          : /Linux/i.test(ua)
            ? "Linux"
            : "Other";

  return { device, browser, os };
}

/** Strip a referrer down to its host. The full URL is somebody else's page
 *  and is not ours to log. */
export function referrerHost(referrer = "") {
  if (!referrer) return "";
  try {
    const url = new URL(referrer);
    return url.host;
  } catch {
    return "";
  }
}

const upsertVisitor = db.prepare(`
  INSERT INTO visitors (visitor_id, device, browser, os, landing_path, referrer)
  VALUES (@visitorId, @device, @browser, @os, @path, @referrer)
  ON CONFLICT(visitor_id) DO UPDATE SET
    last_seen = datetime('now'),
    device    = excluded.device,
    browser   = excluded.browser,
    os        = excluded.os
`);

const upsertSession = db.prepare(`
  INSERT INTO sessions
    (session_id, visitor_id, landing_path, referrer, device, browser, os, screen, language, is_new)
  VALUES
    (@sessionId, @visitorId, @path, @referrer, @device, @browser, @os, @screen, @language, @isNew)
  ON CONFLICT(session_id) DO UPDATE SET last_seen_at = datetime('now')
`);

/**
 * Record one beat from the browser.
 *
 * Every type of beat first makes sure the visitor and session rows exist, so
 * a page opened directly on an anchor link — where the first thing we hear is
 * an event, not a pageview — still produces a complete session.
 */
export const record = db.transaction((beat) => {
  const { visitorId, sessionId, type } = beat;

  const existingSession = db
    .prepare("SELECT session_id FROM sessions WHERE session_id = ?")
    .get(sessionId);

  const isNewVisitor = !db
    .prepare("SELECT visitor_id FROM visitors WHERE visitor_id = ?")
    .get(visitorId);

  upsertVisitor.run({
    visitorId,
    device: beat.device,
    browser: beat.browser,
    os: beat.os,
    path: beat.path,
    referrer: beat.referrer,
  });

  upsertSession.run({
    sessionId,
    visitorId,
    path: beat.path,
    referrer: beat.referrer,
    device: beat.device,
    browser: beat.browser,
    os: beat.os,
    screen: beat.screen,
    language: beat.language,
    isNew: isNewVisitor ? 1 : 0,
  });

  if (!existingSession) {
    db.prepare("UPDATE visitors SET sessions = sessions + 1 WHERE visitor_id = ?").run(visitorId);
  }

  if (type === "pageview") {
    db.prepare(
      `INSERT INTO pageviews (session_id, visitor_id, path, title, referrer)
       VALUES (@sessionId, @visitorId, @path, @title, @referrer)`,
    ).run({
      sessionId,
      visitorId,
      path: beat.path,
      title: beat.title,
      referrer: beat.referrer,
    });
    db.prepare(
      "UPDATE sessions SET pageviews = pageviews + 1, last_seen_at = datetime('now') WHERE session_id = ?",
    ).run(sessionId);
    db.prepare("UPDATE visitors SET pageviews = pageviews + 1 WHERE visitor_id = ?").run(visitorId);
  }

  if (type === "event") {
    db.prepare(
      `INSERT INTO events (session_id, visitor_id, name, path, meta)
       VALUES (@sessionId, @visitorId, @name, @path, @meta)`,
    ).run({
      sessionId,
      visitorId,
      name: beat.name,
      path: beat.path,
      meta: JSON.stringify(beat.meta ?? {}),
    });
    db.prepare(
      "UPDATE sessions SET events = events + 1, last_seen_at = datetime('now') WHERE session_id = ?",
    ).run(sessionId);
    db.prepare("UPDATE visitors SET events = events + 1 WHERE visitor_id = ?").run(visitorId);
  }

  // Duration arrives as a running total for the session, not an increment, so
  // a beat that arrives out of order cannot inflate it. `MAX` keeps the
  // longest figure seen.
  if (Number.isFinite(beat.durationMs) && beat.durationMs > 0) {
    db.prepare(
      `UPDATE sessions
          SET duration_ms = MAX(duration_ms, @durationMs), last_seen_at = datetime('now')
        WHERE session_id = @sessionId`,
    ).run({ durationMs: Math.min(beat.durationMs, 6 * 60 * 60 * 1000), sessionId });
  }

  // A pageview's own dwell time, sent when the visitor leaves that page.
  if (type === "pageview-end" && Number.isFinite(beat.durationMs)) {
    db.prepare(
      `UPDATE pageviews SET duration_ms = @durationMs
        WHERE id = (SELECT id FROM pageviews
                     WHERE session_id = @sessionId AND path = @path
                     ORDER BY id DESC LIMIT 1)`,
    ).run({ durationMs: Math.min(beat.durationMs, 6 * 60 * 60 * 1000), sessionId, path: beat.path });
  }
});

/** Flags the session that submitted a form, so the dashboard can say how many
 *  visits turned into an enrolment or an enquiry. */
export function markConverted(sessionId) {
  if (!sessionId) return;
  const session = db
    .prepare("UPDATE sessions SET converted = 1 WHERE session_id = ? RETURNING visitor_id")
    .get(sessionId);
  if (session) {
    db.prepare("UPDATE visitors SET converted = 1 WHERE visitor_id = ?").run(session.visitor_id);
  }
}

const since = (days) => `datetime('now', '-${Number(days)} days')`;

/** Everything the dashboard shows, for the last `days` days. */
export function overview(days = 30) {
  const d = Math.max(1, Math.min(Number(days) || 30, 365));

  const totals = db
    .prepare(
      `SELECT
         COUNT(*)                                    AS sessions,
         COUNT(DISTINCT visitor_id)                  AS visitors,
         COALESCE(SUM(pageviews), 0)                 AS pageviews,
         COALESCE(SUM(events), 0)                    AS events,
         COALESCE(SUM(${ENGAGED_SQL}), 0)            AS engaged,
         COALESCE(SUM(is_new), 0)                    AS new_visitors,
         COALESCE(SUM(converted), 0)                 AS converted,
         COALESCE(SUM(pageviews <= 1 AND events = 0 AND duration_ms < 30000), 0) AS bounced,
         COALESCE(AVG(duration_ms), 0)               AS avg_duration_ms
       FROM sessions WHERE started_at >= ${since(d)}`,
    )
    .get();

  const series = db
    .prepare(
      `SELECT date(started_at)                        AS day,
              COUNT(*)                                AS sessions,
              COUNT(DISTINCT visitor_id)              AS visitors,
              COALESCE(SUM(pageviews), 0)             AS pageviews,
              COALESCE(SUM(${ENGAGED_SQL}), 0)        AS engaged
         FROM sessions WHERE started_at >= ${since(d)}
        GROUP BY day ORDER BY day`,
    )
    .all();

  const topPages = db
    .prepare(
      `SELECT path,
              COUNT(*)                   AS views,
              COUNT(DISTINCT visitor_id) AS visitors,
              COALESCE(AVG(NULLIF(duration_ms, 0)), 0) AS avg_duration_ms
         FROM pageviews WHERE created_at >= ${since(d)}
        GROUP BY path ORDER BY views DESC LIMIT 12`,
    )
    .all();

  const topReferrers = db
    .prepare(
      `SELECT CASE WHEN referrer = '' THEN 'Direct / none' ELSE referrer END AS source,
              COUNT(*) AS sessions
         FROM sessions WHERE started_at >= ${since(d)}
        GROUP BY source ORDER BY sessions DESC LIMIT 10`,
    )
    .all();

  const byDimension = (column) =>
    db
      .prepare(
        `SELECT CASE WHEN ${column} = '' THEN 'Unknown' ELSE ${column} END AS name,
                COUNT(*) AS sessions
           FROM sessions WHERE started_at >= ${since(d)}
          GROUP BY name ORDER BY sessions DESC`,
      )
      .all();

  const topEvents = db
    .prepare(
      `SELECT name, COUNT(*) AS count, COUNT(DISTINCT session_id) AS sessions
         FROM events WHERE created_at >= ${since(d)}
        GROUP BY name ORDER BY count DESC LIMIT 12`,
    )
    .all();

  const studentsInPeriod = db
    .prepare(`SELECT COUNT(*) AS n FROM students WHERE created_at >= ${since(d)}`)
    .get().n;
  const enquiriesInPeriod = db
    .prepare(`SELECT COUNT(*) AS n FROM enquiries WHERE created_at >= ${since(d)}`)
    .get().n;

  const rate = (part, whole) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0);

  return {
    days: d,
    totals: {
      visitors: totals.visitors,
      sessions: totals.sessions,
      pageviews: totals.pageviews,
      events: totals.events,
      engagedSessions: totals.engaged,
      engagementRate: rate(totals.engaged, totals.sessions),
      bounceRate: rate(totals.bounced, totals.sessions),
      newVisitors: totals.new_visitors,
      returningVisitors: Math.max(0, totals.sessions - totals.new_visitors),
      avgDurationSec: Math.round(totals.avg_duration_ms / 1000),
      conversions: totals.converted,
      conversionRate: rate(totals.converted, totals.sessions),
      students: studentsInPeriod,
      enquiries: enquiriesInPeriod,
    },
    series: fillDays(series, d),
    topPages,
    topReferrers,
    devices: byDimension("device"),
    browsers: byDimension("browser"),
    topEvents,
    engagedDefinition:
      "A session with two or more pages, or thirty seconds or more on the site, or at least one tracked action.",
  };
}

/** A day with no visitors is still a day. Without this the chart silently
 *  closes the gap and a quiet week looks like a busy one. */
function fillDays(rows, days) {
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const out = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - i);
    const key = date.toISOString().slice(0, 10);
    out.push(byDay.get(key) ?? { day: key, sessions: 0, visitors: 0, pageviews: 0, engaged: 0 });
  }
  return out;
}

/** The visitor list, newest first. */
export function listVisitors({ q = "", limit = 50, offset = 0, engagedOnly = false } = {}) {
  const where = [];
  const params = { limit: Math.min(Number(limit) || 50, 500), offset: Number(offset) || 0 };

  if (q) {
    params.q = `%${q}%`;
    // A session id is searchable too: the enrolments and enquiries screens link
    // here by the session that sent the form, so pasting one has to find the
    // visitor behind it.
    where.push(`(v.visitor_id LIKE @q OR v.landing_path LIKE @q OR v.referrer LIKE @q
       OR EXISTS (SELECT 1 FROM sessions s WHERE s.visitor_id = v.visitor_id AND s.session_id LIKE @q))`);
  }
  if (engagedOnly) {
    where.push("(v.pageviews >= 2 OR v.events >= 1)");
  }
  const sql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const total = db.prepare(`SELECT COUNT(*) AS n FROM visitors v ${sql}`).get(params).n;
  const items = db
    .prepare(
      `SELECT v.*,
              (SELECT COALESCE(SUM(duration_ms), 0) FROM sessions s WHERE s.visitor_id = v.visitor_id) AS total_duration_ms
         FROM visitors v ${sql}
        ORDER BY v.last_seen DESC LIMIT @limit OFFSET @offset`,
    )
    .all(params);

  return { items, total };
}

/** One visitor: every session, page and action, plus anything they sent us. */
export function visitorDetail(visitorId) {
  const visitor = db.prepare("SELECT * FROM visitors WHERE visitor_id = ?").get(visitorId);
  if (!visitor) return null;

  const sessions = db
    .prepare(
      `SELECT *, ${ENGAGED_SQL} AS engaged FROM sessions
        WHERE visitor_id = ? ORDER BY started_at DESC LIMIT 100`,
    )
    .all(visitorId);

  const pageviews = db
    .prepare("SELECT * FROM pageviews WHERE visitor_id = ? ORDER BY created_at DESC LIMIT 300")
    .all(visitorId);

  const events = db
    .prepare("SELECT * FROM events WHERE visitor_id = ? ORDER BY created_at DESC LIMIT 300")
    .all(visitorId);

  const sessionIds = sessions.map((s) => s.session_id);
  const placeholders = sessionIds.map(() => "?").join(", ");

  const submissions = sessionIds.length
    ? {
        students: db
          .prepare(`SELECT * FROM students WHERE session_id IN (${placeholders})`)
          .all(...sessionIds),
        enquiries: db
          .prepare(`SELECT * FROM enquiries WHERE session_id IN (${placeholders})`)
          .all(...sessionIds),
      }
    : { students: [], enquiries: [] };

  return {
    visitor,
    sessions,
    pageviews,
    events: events.map((e) => ({ ...e, meta: safeParse(e.meta) })),
    submissions,
  };
}

/** The "happening now" strip: sessions seen in the last five minutes. */
export function liveNow() {
  const row = db
    .prepare(
      `SELECT COUNT(*) AS sessions, COUNT(DISTINCT visitor_id) AS visitors
         FROM sessions WHERE last_seen_at >= datetime('now', '-5 minutes')`,
    )
    .get();

  const paths = db
    .prepare(
      `SELECT path, COUNT(*) AS views FROM pageviews
        WHERE created_at >= datetime('now', '-5 minutes')
        GROUP BY path ORDER BY views DESC LIMIT 5`,
    )
    .all();

  return { ...row, paths };
}

function safeParse(raw) {
  try {
    return JSON.parse(raw ?? "{}");
  } catch {
    return {};
  }
}
