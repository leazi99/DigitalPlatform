// Turns one entry in `resources.js` into a set of REST routes.
//
// Collection and field names come from the spec, which is code, not input.
// Every value that came from the browser is coerced to the column's type
// before it reaches a query, so a request body can never smuggle in a Mongo
// operator like `{ "$ne": null }`.

import { Router } from "express";
import { cascadeDelete, col, nextId, now } from "./db.js";
import { fromJson, toJson } from "./resources.js";

export function crudRouter(spec) {
  const router = Router();
  const records = () => col(spec.table);
  const columnNames = Object.keys(spec.columns);
  const sortable = new Set([...columnNames, "id", "created_at", "updated_at", "position"]);
  const defaultSort = spec.defaultSort ?? (spec.ordered ? { position: 1, id: 1 } : { id: 1 });
  const gone = (res, already = "") =>
    res.status(404).json({ error: `That ${spec.label.toLowerCase()} is ${already}gone.` });

  /** GET / — the list, with search, filters, sort and paging. */
  router.get("/", async (req, res) => {
    const filter = {};

    const q = String(req.query.q ?? "").trim();
    if (q && spec.search?.length) {
      const pattern = new RegExp(escapeRegex(q), "i");
      filter.$or = spec.search.map((field) => ({ [field]: pattern }));
    }

    for (const field of spec.filters ?? []) {
      const value = req.query[field];
      if (value === undefined || value === "") continue;
      filter[field] = spec.columns[field]?.type === "ref" ? Number(value) : String(value);
    }

    const sortField = sortable.has(req.query.sort) ? req.query.sort : null;
    const direction = String(req.query.dir).toUpperCase() === "DESC" ? -1 : 1;
    const sort = sortField ? { [sortField]: direction, id: direction } : defaultSort;

    const limit = clamp(req.query.limit, 200, 1000);
    const offset = Math.max(0, Number.parseInt(req.query.offset, 10) || 0);

    const [total, rows] = await Promise.all([
      records().countDocuments(filter),
      records().find(filter).sort(sort).skip(offset).limit(limit).toArray(),
    ]);

    res.json({ items: rows.map((row) => toJson(spec, row)), total, limit, offset });
  });

  /** GET /:id */
  router.get("/:id", async (req, res) => {
    const row = await records().findOne({ id: Number(req.params.id) });
    if (!row) return gone(res);
    res.json(toJson(spec, row));
  });

  /** POST / — create. New rows go to the end of a reorderable list. */
  router.post("/", async (req, res) => {
    const { values, errors } = fromJson(spec, req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ error: "Check the highlighted fields.", fields: errors });
    }

    if (spec.ordered) {
      const last = await records().findOne({}, { sort: { position: -1 } });
      values.position = (last?.position ?? -1) + 1;
    }

    const stamp = now();
    const row = { id: await nextId(spec.table), ...values, created_at: stamp, updated_at: stamp };
    await records().insertOne(row);

    res.status(201).json(toJson(spec, row));
  });

  /** PATCH /:id — partial update. Fields left out keep their value. */
  router.patch("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { values, errors } = fromJson(spec, req.body, { partial: true });
    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ error: "Check the highlighted fields.", fields: errors });
    }

    const row =
      Object.keys(values).length === 0
        ? await records().findOne({ id })
        : await records().findOneAndUpdate(
            { id },
            { $set: { ...values, updated_at: now() } },
            { returnDocument: "after" },
          );

    if (!row) return gone(res);
    res.json(toJson(spec, row));
  });

  /** DELETE /:id */
  router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const result = await records().deleteOne({ id });
    if (result.deletedCount === 0) return gone(res, "already ");
    await cascadeDelete(spec.table, [id]);
    res.json({ deleted: id });
  });

  /** POST /bulk-delete — for the list view's checkbox selection. */
  router.post("/bulk-delete", async (req, res) => {
    const ids = toIds(req.body?.ids);
    if (ids.length === 0) return res.status(400).json({ error: "Nothing was selected." });

    await records().deleteMany({ id: { $in: ids } });
    await cascadeDelete(spec.table, ids);

    res.json({ deleted: ids.length });
  });

  /** POST /reorder — the whole ordering in one call, so a drag that moves an
   *  item three places up is one request. */
  if (spec.ordered) {
    router.post("/reorder", async (req, res) => {
      const ids = toIds(req.body?.ids);
      if (ids.length === 0) return res.status(400).json({ error: "No order was sent." });

      await records().bulkWrite(
        ids.map((id, position) => ({
          updateOne: { filter: { id }, update: { $set: { position } } },
        })),
        { ordered: false },
      );

      res.json({ reordered: ids.length });
    });
  }

  return router;
}

function toIds(list) {
  return (Array.isArray(list) ? list : [])
    .map((id) => Number.parseInt(id, 10))
    .filter(Number.isFinite);
}

export function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function clamp(value, fallback, max) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(n, max);
}
