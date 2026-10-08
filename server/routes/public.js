// The routes the website itself calls: read the content, record a visit, send
// a form. No authentication, so each one is deliberately narrow about what it
// accepts and what it gives back.

import { Router } from "express";
import { db } from "../db.js";
import { buildContent } from "../content.js";
import { describeClient, looksLikeABot, markConverted, record, referrerHost } from "../analytics.js";
import { rateLimit } from "../rateLimit.js";

export const publicRouter = Router();

/** GET /api/content — everything the public pages render. */
publicRouter.get("/content", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(buildContent());
});

/**
 * POST /api/track — one beat of visitor activity.
 *
 * Always answers 204, even for a beat it decided to throw away. Tracking must
 * never make a visitor's browser show an error, and a failed beat is not
 * something the visitor can do anything about.
 */
publicRouter.post("/track", rateLimit({ max: 240, windowMs: 60_000 }), (req, res) => {
  const ua = req.get("user-agent") ?? "";
  if (looksLikeABot(ua)) return res.status(204).end();

  const body = req.body ?? {};
  const visitorId = str(body.visitorId, 64);
  const sessionId = str(body.sessionId, 64);
  const type = ["pageview", "pageview-end", "event", "ping"].includes(body.type) ? body.type : null;

  if (!visitorId || !sessionId || !type) return res.status(204).end();
  if (type === "event" && !str(body.name, 64)) return res.status(204).end();

  const { device, browser, os } = describeClient(ua);

  try {
    record({
      visitorId,
      sessionId,
      type,
      path: str(body.path, 300) || "/",
      title: str(body.title, 200),
      referrer: referrerHost(str(body.referrer, 500)),
      screen: str(body.screen, 20),
      language: str(body.language, 20),
      name: str(body.name, 64),
      meta: body.meta && typeof body.meta === "object" ? body.meta : {},
      durationMs: Number(body.durationMs) || 0,
      device,
      browser,
      os,
    });
  } catch (error) {
    console.error("track failed:", error.message);
  }

  res.status(204).end();
});

/**
 * POST /api/enrol — the academy's enrolment form.
 *
 * Creates a student row with status `enquiry`: nobody is enrolled until a
 * person at the company says so, and the form says as much to the visitor.
 */
publicRouter.post("/enrol", rateLimit({ max: 10, windowMs: 10 * 60_000 }), (req, res) => {
  const body = req.body ?? {};
  const errors = {};

  const name = str(body.name, 120);
  const phone = str(body.phone, 40);
  const email = str(body.email, 160);

  if (!name) errors.name = "Enter your name.";
  if (!phone) errors.phone = "Enter a phone number — we call to confirm seats.";
  else if (phone.replace(/\D/g, "").length < 7) errors.phone = "That number looks too short to dial.";
  if (email && !isEmail(email)) errors.email = "That email address is missing an @ or a domain.";

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({ error: "Check the highlighted fields.", fields: errors });
  }

  const batchName = str(body.batch, 120);
  const batch = batchName
    ? db.prepare("SELECT id, course_id FROM batches WHERE name = ?").get(batchName)
    : null;
  const liveCourse = db
    .prepare("SELECT id FROM courses WHERE published = 1 ORDER BY position, id LIMIT 1")
    .get();

  const sessionId = str(body.sessionId, 64) || null;

  const student = db
    .prepare(
      `INSERT INTO students (name, email, phone, course_id, batch_id, batch_name, message, source, session_id)
       VALUES (@name, @email, @phone, @courseId, @batchId, @batchName, @message, 'website', @sessionId)
       RETURNING id`,
    )
    .get({
      name,
      email,
      phone,
      courseId: batch?.course_id ?? liveCourse?.id ?? null,
      batchId: batch?.id ?? null,
      batchName,
      message: str(body.message, 2000),
      sessionId,
    });

  markConverted(sessionId);

  res.status(201).json({ ok: true, id: student.id });
});

/** POST /api/enquiries — the agency's contact form. */
publicRouter.post("/enquiries", rateLimit({ max: 10, windowMs: 10 * 60_000 }), (req, res) => {
  const body = req.body ?? {};
  const errors = {};

  const name = str(body.name, 120);
  const email = str(body.email, 160);
  const phone = str(body.phone, 40);
  const message = str(body.message, 4000);

  if (!name) errors.name = "Enter your name.";
  if (!email) errors.email = "Enter an email so we can reply.";
  else if (!isEmail(email)) errors.email = "That email address is missing an @ or a domain.";
  if (phone && phone.replace(/\D/g, "").length < 7) {
    errors.phone = "That number looks too short to dial.";
  }
  if (message.length < 10) errors.message = "A sentence or two about your business is enough.";

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({ error: "Check the highlighted fields.", fields: errors });
  }

  const sessionId = str(body.sessionId, 64) || null;
  const sector = body.sector === "institute" ? "institute" : "agency";

  const enquiry = db
    .prepare(
      `INSERT INTO enquiries (name, email, phone, service, message, sector, session_id)
       VALUES (@name, @email, @phone, @service, @message, @sector, @sessionId)
       RETURNING id`,
    )
    .get({
      name,
      email,
      phone,
      service: str(body.service, 160),
      message,
      sector,
      sessionId,
    });

  markConverted(sessionId);

  res.status(201).json({ ok: true, id: enquiry.id });
});

function str(value, max) {
  if (value === null || value === undefined) return "";
  return String(value).trim().slice(0, max);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
