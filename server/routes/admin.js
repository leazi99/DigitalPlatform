// Everything behind the sign-in. Mounted at /api/admin with `requireAdmin`
// applied to the whole router, so a route added here is protected by default
// rather than by remembering to protect it.

import { Router } from "express";
import {
  DAY,
  NO_ID,
  ago,
  cascadeDelete,
  col,
  getSetting,
  getSettings,
  nextId,
  now,
  putSetting,
} from "../db.js";
import { crudRouter } from "../crud.js";
import { resources, glyphNames } from "../resources.js";
import { settingsSchema } from "../content.js";
import { listVisitors, liveNow, overview, visitorDetail } from "../analytics.js";
import { hashPassword, publicAdmin } from "../auth.js";

export const adminRouter = Router();

/** GET /api/admin/meta — what the panel needs to build its own forms: the
 *  field specs, the enum values, and the options for every reference field. */
adminRouter.get("/meta", async (req, res) => {
  const specs = {};
  for (const [key, spec] of Object.entries(resources)) {
    specs[key] = {
      key,
      label: spec.label,
      plural: spec.plural,
      ordered: Boolean(spec.ordered),
      search: spec.search ?? [],
      filters: spec.filters ?? [],
      columns: spec.columns,
    };
  }

  const byPosition = { sort: { position: 1, id: 1 } };
  const [courses, batches] = await Promise.all([
    col("courses").find({}, byPosition).toArray(),
    col("batches").find({}, byPosition).toArray(),
  ]);

  res.json({
    resources: specs,
    settings: settingsSchema,
    glyphs: glyphNames,
    options: {
      courses: courses.map((c) => ({ value: c.id, label: c.title })),
      batches: batches.map((b) => ({
        value: b.id,
        label: b.starts ? `${b.name} — ${b.starts}` : b.name,
      })),
    },
  });
});

/** GET /api/admin/summary — the counts in the sidebar and the dashboard tiles. */
adminRouter.get("/summary", async (req, res) => {
  const count = (name, filter = {}) => col(name).countDocuments(filter);
  const lastWeek = { created_at: { $gte: ago(7 * DAY) } };
  const today = `${now().slice(0, 10)} 00:00:00`;

  const [
    students,
    enquiries,
    content,
    visitorsTotal,
    visitorsToday,
    live,
  ] = await Promise.all([
    Promise.all([
      count("students"),
      count("students", { status: "enquiry" }),
      count("students", { status: { $in: ["enrolled", "studying"] } }),
      count("students", { status: "completed" }),
      count("students", lastWeek),
    ]),
    Promise.all([count("enquiries"), count("enquiries", { status: "new" }), count("enquiries", lastWeek)]),
    Promise.all(
      [
        ["courses", "courses"],
        ["syllabus", "syllabus_modules"],
        ["instructors", "instructors"],
        ["batches", "batches"],
        ["faqs", "faqs"],
        ["services", "services"],
        ["testimonials", "testimonials"],
        ["outcomes", "outcomes"],
        ["audience", "audience"],
        ["process", "process_steps"],
        ["stats", "stats"],
      ].map(async ([key, name]) => [key, await count(name)]),
    ),
    count("visitors"),
    col("sessions").distinct("visitor_id", { started_at: { $gte: today } }),
    liveNow(),
  ]);

  res.json({
    students: {
      total: students[0],
      new: students[1],
      enrolled: students[2],
      completed: students[3],
      last7: students[4],
    },
    enquiries: { total: enquiries[0], new: enquiries[1], last7: enquiries[2] },
    content: Object.fromEntries(content),
    visitors: { total: visitorsTotal, today: visitorsToday.length },
    live,
  });
});

// ── Analytics ───────────────────────────────────────────────────────────────

adminRouter.get("/analytics/overview", async (req, res) => {
  res.json(await overview(req.query.days ?? 30));
});

adminRouter.get("/analytics/live", async (req, res) => {
  res.json(await liveNow());
});

adminRouter.get("/visitors", async (req, res) => {
  res.json(
    await listVisitors({
      q: String(req.query.q ?? "").trim(),
      limit: req.query.limit,
      offset: req.query.offset,
      engagedOnly: req.query.engaged === "1",
    }),
  );
});

adminRouter.get("/visitors/:id", async (req, res) => {
  const detail = await visitorDetail(String(req.params.id));
  if (!detail) return res.status(404).json({ error: "No visitor with that id." });
  res.json(detail);
});

/** DELETE /api/admin/visitors/:id — erase one visitor's whole trail:
 *  their sessions, pageviews and events go with them. */
adminRouter.delete("/visitors/:id", async (req, res) => {
  const id = String(req.params.id);
  const result = await col("visitors").deleteOne({ visitor_id: id });
  if (result.deletedCount === 0) return res.status(404).json({ error: "No visitor with that id." });
  await cascadeDelete("visitors", [id]);
  res.json({ deleted: id });
});

/** POST /api/admin/analytics/purge — drop analytics older than `days` days.
 *  Keeping a visitor log forever is a liability, not an asset. */
adminRouter.post("/analytics/purge", async (req, res) => {
  const days = Math.max(1, Math.min(Number(req.body?.days) || 365, 3650));
  const cutoff = ago(days * DAY);

  // A session going takes its pages and actions with it, whatever their age.
  const oldSessions = await col("sessions").distinct("session_id", {
    last_seen_at: { $lt: cutoff },
  });

  await Promise.all([
    col("pageviews").deleteMany({
      $or: [{ created_at: { $lt: cutoff } }, { session_id: { $in: oldSessions } }],
    }),
    col("events").deleteMany({
      $or: [{ created_at: { $lt: cutoff } }, { session_id: { $in: oldSessions } }],
    }),
  ]);
  const sessions = await col("sessions").deleteMany({ session_id: { $in: oldSessions } });

  const stillActive = await col("sessions").distinct("visitor_id");
  const visitors = await col("visitors").deleteMany({
    last_seen: { $lt: cutoff },
    visitor_id: { $nin: stillActive },
  });

  res.json({ days, sessions: sessions.deletedCount, visitors: visitors.deletedCount });
});

// ── Site content that exists exactly once ───────────────────────────────────

adminRouter.get("/settings", async (req, res) => {
  const all = await getSettings();
  const out = {};
  for (const key of Object.keys(settingsSchema)) out[key] = all[key] ?? null;
  res.json(out);
});

adminRouter.put("/settings/:key", async (req, res) => {
  const { key } = req.params;
  if (!Object.hasOwn(settingsSchema, key)) {
    return res.status(404).json({ error: "That is not a content block the panel can edit." });
  }
  if (req.body?.value === undefined) {
    return res.status(400).json({ error: "Nothing to save." });
  }

  await putSetting(key, req.body.value);
  res.json({ key, value: await getSetting(key) });
});

// ── Admin accounts ──────────────────────────────────────────────────────────

adminRouter.get("/admins", async (req, res) => {
  const admins = await col("admins").find({}).sort({ id: 1 }).toArray();
  res.json({ items: admins.map(publicAdmin) });
});

adminRouter.post("/admins", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const name = String(req.body?.name ?? "").trim();
  const password = String(req.body?.password ?? "");
  const fields = {};

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.email = "Enter a valid email address.";
  if (password.length < 8) fields.password = "Use at least 8 characters.";
  if (await col("admins").findOne({ email })) {
    fields.email = "There is already an admin with that email.";
  }
  if (Object.keys(fields).length > 0) {
    return res.status(422).json({ error: "Check the highlighted fields.", fields });
  }

  const created = {
    id: await nextId("admins"),
    email,
    name,
    password_hash: hashPassword(password),
    token_version: 0,
    created_at: now(),
    last_login_at: null,
  };
  await col("admins").insertOne(created);

  res.status(201).json(publicAdmin(created));
});

adminRouter.delete("/admins/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (id === req.admin.id) {
    return res.status(422).json({ error: "You cannot delete the account you are signed in as." });
  }
  if ((await col("admins").countDocuments()) <= 1) {
    return res.status(422).json({ error: "This is the only admin account. Add another first." });
  }

  const result = await col("admins").deleteOne({ id });
  if (result.deletedCount === 0) return res.status(404).json({ error: "No admin with that id." });
  res.json({ deleted: id });
});

// ── CSV export ──────────────────────────────────────────────────────────────

/** GET /api/admin/export/:resource.csv — for the spreadsheet the office
 *  actually works in. Only the record tables; content is not useful as CSV. */
adminRouter.get("/export/:resource", async (req, res) => {
  const exportable = { students: "students", enquiries: "enquiries", visitors: "visitors" };
  const table = exportable[req.params.resource];
  if (!table) return res.status(404).json({ error: "That cannot be exported." });

  const rows = await col(table).find({}, NO_ID).sort({ _id: 1 }).toArray();
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const body =
    [columns.join(","), ...rows.map((row) => columns.map((c) => csvCell(row[c])).join(","))].join(
      "\n",
    ) + "\n";

  res.set("Content-Type", "text/csv; charset=utf-8");
  res.set("Content-Disposition", `attachment; filename="${table}-${today()}.csv"`);
  res.send(body);
});

function csvCell(value) {
  if (value === null || value === undefined) return "";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  // A leading =, +, - or @ makes a spreadsheet treat the cell as a formula.
  // Anything typed into a public form gets that prefix neutralised.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[",\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ── The generated CRUD routes ───────────────────────────────────────────────

for (const [key, spec] of Object.entries(resources)) {
  adminRouter.use(`/${key}`, crudRouter(spec));
}
