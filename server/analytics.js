// Visitor tracking: what gets recorded, and the numbers the dashboard reads.
//
// This is first-party and deliberately thin. No IP address is stored, no
// cookie is set, nothing is sent to a third party. A visitor is a random id
// the browser keeps in its own storage, which is enough to answer "how many
// people came, and did they engage" and not enough to identify anyone.

import { DAY, NO_ID, ago, col, now } from "./db.js";
import { escapeRegex } from "./crud.js";

/** A session counts as engaged if the visitor did more than glance at one
 *  page: a second page, half a minute, or any deliberate action. The
 *  dashboard states this definition on screen rather than leaving the admin
 *  to guess what "engaged" was measured as. */
const ENGAGED = {
  $or: [
    { $gte: ["$pageviews", 2] },
    { $gte: ["$duration_ms", 30000] },
    { $gte: ["$events", 1] },
  ],
};

const BOUNCED = {
  $and: [
    { $lte: ["$pageviews", 1] },
    { $eq: ["$events", 0] },
    { $lt: ["$duration_ms", 30000] },
  ],
};

const isEngaged = (s) => s.pageviews >= 2 || s.duration_ms >= 30000 || s.events >= 1;

const MAX_DURATION = 6 * 60 * 60 * 1000;

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

/**
 * Record one beat from the browser.
 *
 * Every type of beat first makes sure the visitor and session documents
 * exist, so a page opened directly on an anchor link — where the first thing
 * we hear is an event, not a pageview — still produces a complete session.
 */
export async function record(beat) {
  const { visitorId, sessionId, type } = beat;
  const stamp = now();

  const visitor = await col("visitors").updateOne(
    { visitor_id: visitorId },
    {
      $set: { last_seen: stamp, device: beat.device, browser: beat.browser, os: beat.os },
      $setOnInsert: {
        first_seen: stamp,
        sessions: 0,
        pageviews: 0,
        events: 0,
        landing_path: beat.path,
        referrer: beat.referrer,
        converted: 0,
      },
    },
    { upsert: true },
  );
  const isNewVisitor = visitor.upsertedCount === 1;

  const inc = {};
  if (type === "pageview") inc.pageviews = 1;
  if (type === "event") inc.events = 1;

  // Duration arrives as a running total for the session, not an increment, so
  // a beat that arrives out of order cannot inflate it. `$max` keeps the
  // longest figure seen.
  const max = {};
  if (Number.isFinite(beat.durationMs) && beat.durationMs > 0) {
    max.duration_ms = Math.min(beat.durationMs, MAX_DURATION);
  }

  // A counter being incremented cannot also be defaulted on insert — Mongo
  // rejects the conflict — and `$inc`/`$max` create the field anyway.
  const onInsert = {
    visitor_id: visitorId,
    started_at: stamp,
    pageviews: 0,
    events: 0,
    duration_ms: 0,
    is_new: isNewVisitor ? 1 : 0,
    landing_path: beat.path,
    referrer: beat.referrer,
    device: beat.device,
    browser: beat.browser,
    os: beat.os,
    screen: beat.screen,
    language: beat.language,
    converted: 0,
  };
  for (const key of [...Object.keys(inc), ...Object.keys(max)]) delete onInsert[key];

  const update = { $set: { last_seen_at: stamp }, $setOnInsert: onInsert };
  if (Object.keys(inc).length) update.$inc = inc;
  if (Object.keys(max).length) update.$max = max;

  const session = await col("sessions").updateOne({ session_id: sessionId }, update, {
    upsert: true,
  });

  const visitorInc = { ...inc };
  if (session.upsertedCount === 1) visitorInc.sessions = 1;
  if (Object.keys(visitorInc).length) {
    await col("visitors").updateOne({ visitor_id: visitorId }, { $inc: visitorInc });
  }

  if (type === "pageview") {
    await col("pageviews").insertOne({
      session_id: sessionId,
      visitor_id: visitorId,
      path: beat.path,
      title: beat.title,
      referrer: beat.referrer,
      duration_ms: 0,
      created_at: stamp,
    });
  }

  if (type === "event") {
    await col("events").insertOne({
      session_id: sessionId,
      visitor_id: visitorId,
      name: beat.name,
      path: beat.path,
      meta: beat.meta ?? {},
      created_at: stamp,
    });
  }

  // A pageview's own dwell time, sent when the visitor leaves that page.
  if (type === "pageview-end" && Number.isFinite(beat.durationMs)) {
    await col("pageviews").findOneAndUpdate(
      { session_id: sessionId, path: beat.path },
      { $set: { duration_ms: Math.min(beat.durationMs, MAX_DURATION) } },
      { sort: { _id: -1 } },
    );
  }
}

/** Flags the session that submitted a form, so the dashboard can say how many
 *  visits turned into an enrolment or an enquiry. */
export async function markConverted(sessionId) {
  if (!sessionId) return;
  const session = await col("sessions").findOneAndUpdate(
    { session_id: sessionId },
    { $set: { converted: 1 } },
  );
  if (session) {
    await col("visitors").updateOne({ visitor_id: session.visitor_id }, { $set: { converted: 1 } });
  }
}

const since = (days) => ago(Number(days) * DAY);

/** Run an aggregation pipeline and collect the results. */
const aggregate = (name, pipeline) => col(name).aggregate(pipeline).toArray();

/** Everything the dashboard shows, for the last `days` days. */
export async function overview(days = 30) {
  const d = Math.max(1, Math.min(Number(days) || 30, 365));
  const inSessions = { $match: { started_at: { $gte: since(d) } } };

  const byDimension = (field) =>
    aggregate("sessions", [
      inSessions,
      {
        $group: {
          _id: { $cond: [{ $eq: [{ $ifNull: [`$${field}`, ""] }, ""] }, "Unknown", `$${field}`] },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { sessions: -1 } },
      { $project: { _id: 0, name: "$_id", sessions: 1 } },
    ]);

  const [
    [totals = {}],
    series,
    topPages,
    topReferrers,
    devices,
    browsers,
    topEvents,
    studentsInPeriod,
    enquiriesInPeriod,
  ] = await Promise.all([
    aggregate("sessions", [
      inSessions,
      {
        $group: {
          _id: null,
          sessions: { $sum: 1 },
          visitors: { $addToSet: "$visitor_id" },
          pageviews: { $sum: "$pageviews" },
          events: { $sum: "$events" },
          engaged: { $sum: { $cond: [ENGAGED, 1, 0] } },
          new_visitors: { $sum: "$is_new" },
          converted: { $sum: "$converted" },
          bounced: { $sum: { $cond: [BOUNCED, 1, 0] } },
          avg_duration_ms: { $avg: "$duration_ms" },
        },
      },
      { $set: { visitors: { $size: "$visitors" } } },
    ]),
    aggregate("sessions", [
      inSessions,
      {
        $group: {
          _id: { $substrBytes: ["$started_at", 0, 10] },
          sessions: { $sum: 1 },
          visitors: { $addToSet: "$visitor_id" },
          pageviews: { $sum: "$pageviews" },
          engaged: { $sum: { $cond: [ENGAGED, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          day: "$_id",
          sessions: 1,
          visitors: { $size: "$visitors" },
          pageviews: 1,
          engaged: 1,
        },
      },
    ]),
    aggregate("pageviews", [
      { $match: { created_at: { $gte: since(d) } } },
      {
        $group: {
          _id: "$path",
          views: { $sum: 1 },
          visitors: { $addToSet: "$visitor_id" },
          // Pages left before the dwell beat arrived have no duration; they
          // are left out of the average rather than dragging it to zero.
          avg_duration_ms: {
            $avg: { $cond: [{ $gt: ["$duration_ms", 0] }, "$duration_ms", null] },
          },
        },
      },
      { $sort: { views: -1 } },
      { $limit: 12 },
      {
        $project: {
          _id: 0,
          path: "$_id",
          views: 1,
          visitors: { $size: "$visitors" },
          avg_duration_ms: { $ifNull: ["$avg_duration_ms", 0] },
        },
      },
    ]),
    aggregate("sessions", [
      inSessions,
      {
        $group: {
          _id: {
            $cond: [{ $eq: [{ $ifNull: ["$referrer", ""] }, ""] }, "Direct / none", "$referrer"],
          },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { sessions: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, source: "$_id", sessions: 1 } },
    ]),
    byDimension("device"),
    byDimension("browser"),
    aggregate("events", [
      { $match: { created_at: { $gte: since(d) } } },
      { $group: { _id: "$name", count: { $sum: 1 }, sessions: { $addToSet: "$session_id" } } },
      { $sort: { count: -1 } },
      { $limit: 12 },
      { $project: { _id: 0, name: "$_id", count: 1, sessions: { $size: "$sessions" } } },
    ]),
    col("students").countDocuments({ created_at: { $gte: since(d) } }),
    col("enquiries").countDocuments({ created_at: { $gte: since(d) } }),
  ]);

  const t = {
    sessions: 0,
    visitors: 0,
    pageviews: 0,
    events: 0,
    engaged: 0,
    new_visitors: 0,
    converted: 0,
    bounced: 0,
    avg_duration_ms: 0,
    ...totals,
  };

  const rate = (part, whole) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0);

  return {
    days: d,
    totals: {
      visitors: t.visitors,
      sessions: t.sessions,
      pageviews: t.pageviews,
      events: t.events,
      engagedSessions: t.engaged,
      engagementRate: rate(t.engaged, t.sessions),
      bounceRate: rate(t.bounced, t.sessions),
      newVisitors: t.new_visitors,
      returningVisitors: Math.max(0, t.sessions - t.new_visitors),
      avgDurationSec: Math.round((t.avg_duration_ms ?? 0) / 1000),
      conversions: t.converted,
      conversionRate: rate(t.converted, t.sessions),
      students: studentsInPeriod,
      enquiries: enquiriesInPeriod,
    },
    series: fillDays(series, d),
    topPages,
    topReferrers,
    devices,
    browsers,
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
export async function listVisitors({ q = "", limit = 50, offset = 0, engagedOnly = false } = {}) {
  const and = [];

  if (q) {
    const pattern = new RegExp(escapeRegex(q), "i");
    // A session id is searchable too: the enrolments and enquiries screens link
    // here by the session that sent the form, so pasting one has to find the
    // visitor behind it.
    const bySession = await col("sessions").distinct("visitor_id", { session_id: pattern });
    and.push({
      $or: [
        { visitor_id: pattern },
        { landing_path: pattern },
        { referrer: pattern },
        { visitor_id: { $in: bySession } },
      ],
    });
  }
  if (engagedOnly) {
    and.push({ $or: [{ pageviews: { $gte: 2 } }, { events: { $gte: 1 } }] });
  }
  const filter = and.length ? { $and: and } : {};

  const [total, visitors] = await Promise.all([
    col("visitors").countDocuments(filter),
    col("visitors")
      .find(filter, NO_ID)
      .sort({ last_seen: -1 })
      .skip(Number(offset) || 0)
      .limit(Math.min(Number(limit) || 50, 500))
      .toArray(),
  ]);

  const durations = await aggregate("sessions", [
    { $match: { visitor_id: { $in: visitors.map((v) => v.visitor_id) } } },
    { $group: { _id: "$visitor_id", total: { $sum: "$duration_ms" } } },
  ]);
  const durationOf = new Map(durations.map((row) => [row._id, row.total]));

  const items = visitors.map((v) => ({
    ...v,
    total_duration_ms: durationOf.get(v.visitor_id) ?? 0,
  }));

  return { items, total };
}

/** Pageviews and events have no numeric id; the browser keys lists by this. */
const withId = ({ _id, ...rest }) => ({ id: String(_id), ...rest });

/** One visitor: every session, page and action, plus anything they sent us. */
export async function visitorDetail(visitorId) {
  const visitor = await col("visitors").findOne({ visitor_id: visitorId }, NO_ID);
  if (!visitor) return null;

  const [sessions, pageviews, events] = await Promise.all([
    col("sessions")
      .find({ visitor_id: visitorId }, NO_ID)
      .sort({ started_at: -1 })
      .limit(100)
      .toArray(),
    col("pageviews")
      .find({ visitor_id: visitorId })
      .sort({ created_at: -1, _id: -1 })
      .limit(300)
      .toArray(),
    col("events")
      .find({ visitor_id: visitorId })
      .sort({ created_at: -1, _id: -1 })
      .limit(300)
      .toArray(),
  ]);

  const sessionIds = sessions.map((s) => s.session_id);
  const fromSessions = { session_id: { $in: sessionIds } };

  const [students, enquiries] = sessionIds.length
    ? await Promise.all([
        col("students").find(fromSessions, NO_ID).toArray(),
        col("enquiries").find(fromSessions, NO_ID).toArray(),
      ])
    : [[], []];

  return {
    visitor,
    sessions: sessions.map((s) => ({ ...s, engaged: isEngaged(s) ? 1 : 0 })),
    pageviews: pageviews.map(withId),
    events: events.map(withId),
    submissions: { students, enquiries },
  };
}

/** The "happening now" strip: sessions seen in the last five minutes. */
export async function liveNow() {
  const cutoff = ago(5 * 60 * 1000);

  const [sessions, visitors, paths] = await Promise.all([
    col("sessions").countDocuments({ last_seen_at: { $gte: cutoff } }),
    col("sessions").distinct("visitor_id", { last_seen_at: { $gte: cutoff } }),
    aggregate("pageviews", [
      { $match: { created_at: { $gte: cutoff } } },
      { $group: { _id: "$path", views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, path: "$_id", views: 1 } },
    ]),
  ]);

  return { sessions, visitors: visitors.length, paths };
}
