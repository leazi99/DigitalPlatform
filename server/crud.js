// Turns one entry in `resources.js` into a set of REST routes.
//
// Table and column names come from the spec, which is code, not input. Every
// value that came from the browser is bound as a parameter — none of it is
// ever concatenated into SQL.

import { Router } from "express";
import { db } from "./db.js";
import { fromJson, toJson } from "./resources.js";

export function crudRouter(spec) {
  const router = Router();
  const { table } = spec;
  const columnNames = Object.keys(spec.columns);
  const sortable = new Set([...columnNames, "id", "created_at", "updated_at", "position"]);
  const defaultSort = spec.defaultSort ?? (spec.ordered ? "position ASC, id ASC" : "id ASC");

  /** GET / — the list, with search, filters, sort and paging. */
  router.get("/", (req, res) => {
    const where = [];
    const params = {};

    const q = String(req.query.q ?? "").trim();
    if (q && spec.search?.length) {
      const clauses = spec.search.map((col, i) => {
        params[`q${i}`] = `%${q}%`;
        return `${col} LIKE @q${i}`;
      });
      where.push(`(${clauses.join(" OR ")})`);
    }

    for (const field of spec.filters ?? []) {
      const value = req.query[field];
      if (value === undefined || value === "") continue;
      params[field] = value;
      where.push(`${field} = @${field}`);
    }

    const sql = where.length ? ` WHERE ${where.join(" AND ")}` : "";
    const total = db.prepare(`SELECT COUNT(*) AS n FROM ${table}${sql}`).get(params).n;

    const sortField = sortable.has(req.query.sort) ? req.query.sort : null;
    const direction = String(req.query.dir).toUpperCase() === "DESC" ? "DESC" : "ASC";
    const order = sortField ? `${sortField} ${direction}` : defaultSort;

    const limit = clamp(req.query.limit, 200, 1000);
    const offset = Math.max(0, Number.parseInt(req.query.offset, 10) || 0);

    const rows = db
      .prepare(`SELECT * FROM ${table}${sql} ORDER BY ${order} LIMIT @_limit OFFSET @_offset`)
      .all({ ...params, _limit: limit, _offset: offset });

    res.json({ items: rows.map((row) => toJson(spec, row)), total, limit, offset });
  });

  /** GET /:id */
  router.get("/:id", (req, res) => {
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: `That ${spec.label.toLowerCase()} is gone.` });
    res.json(toJson(spec, row));
  });

  /** POST / — create. New rows go to the end of a reorderable list. */
  router.post("/", (req, res) => {
    const { values, errors } = fromJson(spec, req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ error: "Check the highlighted fields.", fields: errors });
    }

    if (spec.ordered) {
      values.position = (db.prepare(`SELECT MAX(position) AS m FROM ${table}`).get().m ?? -1) + 1;
    }

    const cols = Object.keys(values);
    const row = db
      .prepare(
        `INSERT INTO ${table} (${cols.join(", ")})
         VALUES (${cols.map((c) => `@${c}`).join(", ")})
         RETURNING *`,
      )
      .get(values);

    res.status(201).json(toJson(spec, row));
  });

  /** PATCH /:id — partial update. Fields left out keep their value. */
  router.patch("/:id", (req, res) => {
    const existing = db.prepare(`SELECT id FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: `That ${spec.label.toLowerCase()} is gone.` });
    }

    const { values, errors } = fromJson(spec, req.body, { partial: true });
    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ error: "Check the highlighted fields.", fields: errors });
    }
    if (Object.keys(values).length === 0) {
      const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
      return res.json(toJson(spec, row));
    }

    const assignments = Object.keys(values).map((c) => `${c} = @${c}`);
    assignments.push("updated_at = datetime('now')");

    const row = db
      .prepare(`UPDATE ${table} SET ${assignments.join(", ")} WHERE id = @_id RETURNING *`)
      .get({ ...values, _id: req.params.id });

    res.json(toJson(spec, row));
  });

  /** DELETE /:id */
  router.delete("/:id", (req, res) => {
    const result = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: `That ${spec.label.toLowerCase()} is already gone.` });
    }
    res.json({ deleted: Number(req.params.id) });
  });

  /** POST /bulk-delete — for the list view's checkbox selection. */
  router.post("/bulk-delete", (req, res) => {
    const ids = (Array.isArray(req.body?.ids) ? req.body.ids : [])
      .map((id) => Number.parseInt(id, 10))
      .filter(Number.isFinite);

    if (ids.length === 0) return res.status(400).json({ error: "Nothing was selected." });

    const statement = db.prepare(`DELETE FROM ${table} WHERE id = ?`);
    const run = db.transaction((list) => list.forEach((id) => statement.run(id)));
    run(ids);

    res.json({ deleted: ids.length });
  });

  /** POST /reorder — the whole ordering in one call, so a drag that moves an
   *  item three places up is one request and cannot half-apply. */
  if (spec.ordered) {
    router.post("/reorder", (req, res) => {
      const ids = (Array.isArray(req.body?.ids) ? req.body.ids : [])
        .map((id) => Number.parseInt(id, 10))
        .filter(Number.isFinite);

      if (ids.length === 0) return res.status(400).json({ error: "No order was sent." });

      const statement = db.prepare(`UPDATE ${table} SET position = ? WHERE id = ?`);
      const run = db.transaction((list) => list.forEach((id, i) => statement.run(i, id)));
      run(ids);

      res.json({ reordered: ids.length });
    });
  }

  return router;
}

function clamp(value, fallback, max) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(n, max);
}
