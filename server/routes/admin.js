// Everything behind the sign-in. Mounted at /api/admin with `requireAdmin`
// applied to the whole router, so a route added here is protected by default
// rather than by remembering to protect it.

import { Router } from "express";
import { db, getSetting, putSetting } from "../db.js";
import { crudRouter } from "../crud.js";
import { resources, glyphNames } from "../resources.js";
import { settingsSchema } from "../content.js";
import { listVisitors, liveNow, overview, visitorDetail } from "../analytics.js";
import { hashPassword, publicAdmin } from "../auth.js";

export const adminRouter = Router();

/** GET /api/admin/meta — what the panel needs to build its own forms: the
 *  field specs, the enum values, and the options for every reference field. */
adminRouter.get("/meta", (req, res) => {
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

  res.json({
    resources: specs,
    settings: settingsSchema,
    glyphs: glyphNames,
    options: {
      courses: db
        .prepare("SELECT id, title FROM courses ORDER BY position, id")
        .all()
        .map((c) => ({ value: c.id, label: c.title })),
      batches: db
        .prepare("SELECT id, name, starts FROM batches ORDER BY position, id")
        .all()
        .map((b) => ({ value: b.id, label: b.starts ? `${b.name} — ${b.starts}` : b.name })),
    },
  });
});

/** GET /api/admin/summary — the counts in the sidebar and the dashboard tiles. */
adminRouter.get("/summary", (req, res) => {
  const count = (sql, params = []) => db.prepare(sql).get(...params).n;

  res.json({
    students: {
      total: count("SELECT COUNT(*) AS n FROM students"),
      new: count("SELECT COUNT(*) AS n FROM students WHERE status = 'enquiry'"),
      enrolled: count(
        "SELECT COUNT(*) AS n FROM students WHERE status IN ('enrolled', 'studying')",
      ),
      completed: count("SELECT COUNT(*) AS n FROM students WHERE status = 'completed'"),
      last7: count("SELECT COUNT(*) AS n FROM students WHERE created_at >= datetime('now', '-7 days')"),
    },
    enquiries: {
      total: count("SELECT COUNT(*) AS n FROM enquiries"),
      new: count("SELECT COUNT(*) AS n FROM enquiries WHERE status = 'new'"),
      last7: count(
        "SELECT COUNT(*) AS n FROM enquiries WHERE created_at >= datetime('now', '-7 days')",
      ),
    },
    content: {
      courses: count("SELECT COUNT(*) AS n FROM courses"),
      syllabus: count("SELECT COUNT(*) AS n FROM syllabus_modules"),
      instructors: count("SELECT COUNT(*) AS n FROM instructors"),
      batches: count("SELECT COUNT(*) AS n FROM batches"),
      faqs: count("SELECT COUNT(*) AS n FROM faqs"),
      services: count("SELECT COUNT(*) AS n FROM services"),
      testimonials: count("SELECT COUNT(*) AS n FROM testimonials"),
      outcomes: count("SELECT COUNT(*) AS n FROM outcomes"),
      audience: count("SELECT COUNT(*) AS n FROM audience"),
      process: count("SELECT COUNT(*) AS n FROM process_steps"),
      stats: count("SELECT COUNT(*) AS n FROM stats"),
    },
    visitors: {
      total: count("SELECT COUNT(*) AS n FROM visitors"),
      today: count("SELECT COUNT(DISTINCT visitor_id) AS n FROM sessions WHERE date(started_at) = date('now')"),
    },
    live: liveNow(),
  });
});

// ── Analytics ───────────────────────────────────────────────────────────────

adminRouter.get("/analytics/overview", (req, res) => {
  res.json(overview(req.query.days ?? 30));
});

adminRouter.get("/analytics/live", (req, res) => {
  res.json(liveNow());
});

adminRouter.get("/visitors", (req, res) => {
  res.json(
    listVisitors({
      q: String(req.query.q ?? "").trim(),
      limit: req.query.limit,
      offset: req.query.offset,
      engagedOnly: req.query.engaged === "1",
    }),
  );
});

adminRouter.get("/visitors/:id", (req, res) => {
  const detail = visitorDetail(req.params.id);
  if (!detail) return res.status(404).json({ error: "No visitor with that id." });
  res.json(detail);
});

/** DELETE /api/admin/visitors/:id — erase one visitor's whole trail. Sessions,
 *  pageviews and events go with them through the foreign keys. */
adminRouter.delete("/visitors/:id", (req, res) => {
  const result = db.prepare("DELETE FROM visitors WHERE visitor_id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "No visitor with that id." });
  res.json({ deleted: req.params.id });
});

/** POST /api/admin/analytics/purge — drop analytics older than `days` days.
 *  Keeping a visitor log forever is a liability, not an asset. */
adminRouter.post("/analytics/purge", (req, res) => {
  const days = Math.max(1, Math.min(Number(req.body?.days) || 365, 3650));
  const cutoff = `datetime('now', '-${days} days')`;

  const purge = db.transaction(() => {
    db.prepare(`DELETE FROM pageviews WHERE created_at < ${cutoff}`).run();
    db.prepare(`DELETE FROM events WHERE created_at < ${cutoff}`).run();
    const sessions = db.prepare(`DELETE FROM sessions WHERE last_seen_at < ${cutoff}`).run();
    const visitors = db
      .prepare(
        `DELETE FROM visitors WHERE last_seen < ${cutoff}
           AND visitor_id NOT IN (SELECT visitor_id FROM sessions)`,
      )
      .run();
    return { sessions: sessions.changes, visitors: visitors.changes };
  });

  res.json({ days, ...purge() });
});

// ── Site content that exists exactly once ───────────────────────────────────

adminRouter.get("/settings", (req, res) => {
  const out = {};
  for (const key of Object.keys(settingsSchema)) out[key] = getSetting(key, null);
  res.json(out);
});

adminRouter.put("/settings/:key", (req, res) => {
  const { key } = req.params;
  if (!Object.hasOwn(settingsSchema, key)) {
    return res.status(404).json({ error: "That is not a content block the panel can edit." });
  }
  if (req.body?.value === undefined) {
    return res.status(400).json({ error: "Nothing to save." });
  }

  putSetting(key, req.body.value);
  res.json({ key, value: getSetting(key) });
});

// ── Admin accounts ──────────────────────────────────────────────────────────

adminRouter.get("/admins", (req, res) => {
  res.json({
    items: db.prepare("SELECT * FROM admins ORDER BY id").all().map(publicAdmin),
  });
});

adminRouter.post("/admins", (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const name = String(req.body?.name ?? "").trim();
  const password = String(req.body?.password ?? "");
  const fields = {};

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.email = "Enter a valid email address.";
  if (password.length < 8) fields.password = "Use at least 8 characters.";
  if (db.prepare("SELECT id FROM admins WHERE email = ?").get(email)) {
    fields.email = "There is already an admin with that email.";
  }
  if (Object.keys(fields).length > 0) {
    return res.status(422).json({ error: "Check the highlighted fields.", fields });
  }

  const created = db
    .prepare(
      "INSERT INTO admins (email, name, password_hash) VALUES (?, ?, ?) RETURNING *",
    )
    .get(email, name, hashPassword(password));

  res.status(201).json(publicAdmin(created));
});

adminRouter.delete("/admins/:id", (req, res) => {
  const id = Number(req.params.id);

  if (id === req.admin.id) {
    return res.status(422).json({ error: "You cannot delete the account you are signed in as." });
  }
  if (db.prepare("SELECT COUNT(*) AS n FROM admins").get().n <= 1) {
    return res.status(422).json({ error: "This is the only admin account. Add another first." });
  }

  const result = db.prepare("DELETE FROM admins WHERE id = ?").run(id);
  if (result.changes === 0) return res.status(404).json({ error: "No admin with that id." });
  res.json({ deleted: id });
});

// ── CSV export ──────────────────────────────────────────────────────────────

/** GET /api/admin/export/:resource.csv — for the spreadsheet the office
 *  actually works in. Only the record tables; content is not useful as CSV. */
adminRouter.get("/export/:resource", (req, res) => {
  const exportable = { students: "students", enquiries: "enquiries", visitors: "visitors" };
  const table = exportable[req.params.resource];
  if (!table) return res.status(404).json({ error: "That cannot be exported." });

  const rows = db.prepare(`SELECT * FROM ${table}`).all();
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
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
  const text = String(value);
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
