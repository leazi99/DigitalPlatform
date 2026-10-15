// The database: MongoDB (Atlas in production), one collection per kind of
// record.
//
// Two conventions carry over from the SQLite version so the browser code did
// not have to change:
//
//   · Records have a numeric `id` (from the `counters` collection) alongside
//     Mongo's own `_id`. Course and batch references, URLs in the admin panel
//     and reordering all use it. `_id` never leaves the server.
//   · Timestamps are UTC strings shaped "2026-09-25 07:17:42". They sort and
//     compare correctly as strings, and the admin panel already parses them.

import { MongoClient } from "mongodb";
import { config } from "./env.js";

let database = null;

/** Connect and make sure the indexes exist. Called once at startup.
 *  The client is made here rather than at import, so a missing connection
 *  string is reported by `assertConfig` instead of crashing the import. */
export async function connect() {
  if (database) return database;
  const client = new MongoClient(config.mongoUri, {
    // A serverless function holds very few concurrent requests; a small pool
    // keeps a burst of cold starts from exhausting Atlas's connection limit.
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10_000,
  });
  try {
    await client.connect();
  } catch (error) {
    throw explainConnectError(error);
  }
  database = client.db(config.mongoDb);
  await ensureIndexes();
  return database;
}

/** The driver's errors name the protocol failure, not the setting to fix.
 *  These are shown on the admin sign-in screen, so they say what to change. */
function explainConnectError(error) {
  const text = `${error.name} ${error.message} ${error.cause?.message ?? ""}`;
  const where = config.mongoUriName ?? "MONGODB_URI";
  let message = null;

  if (/auth|bad auth|authentication failed/i.test(text)) {
    message = `MongoDB Atlas rejected the username or password in ${where}. In Atlas → Database Access, reset that user's password, put it in the connection string (special characters like @ : / ? # must be URL-encoded), save, and redeploy.`;
  } else if (/ENOTFOUND|querySrv|ENODATA|EBADNAME/i.test(text)) {
    message = `The cluster address in ${where} could not be found. Copy the connection string again from Atlas → your cluster → Connect → Drivers.`;
  } else if (/ServerSelection|timed out|ECONNREFUSED|ETIMEDOUT|whitelist|not authorized to access/i.test(text)) {
    message = `Could not reach the MongoDB Atlas cluster. In Atlas → Network Access, add 0.0.0.0/0 (Vercel has no fixed IP address), wait a minute for it to apply, then try again.`;
  }

  if (!message) return error;
  const explained = new Error(`${message} (${error.message})`);
  explained.expose = true;
  return explained;
}

export function col(name) {
  if (!database) throw new Error("The database is not connected yet.");
  return database.collection(name);
}

/** The collections that hold admin-editable records, keyed by an `id`. */
const RECORD_COLLECTIONS = [
  "admins",
  "courses",
  "syllabus_modules",
  "instructors",
  "batches",
  "faqs",
  "outcomes",
  "audience",
  "services",
  "process_steps",
  "testimonials",
  "stats",
  "students",
  "enquiries",
];

async function ensureIndexes() {
  await Promise.all([
    ...RECORD_COLLECTIONS.map((name) => col(name).createIndex({ id: 1 }, { unique: true })),
    col("admins").createIndex({ email: 1 }, { unique: true }),
    col("settings").createIndex({ key: 1 }, { unique: true }),
    col("syllabus_modules").createIndex({ course_id: 1 }),
    col("students").createIndex({ created_at: -1 }),
    col("students").createIndex({ session_id: 1 }),
    col("enquiries").createIndex({ created_at: -1 }),
    col("enquiries").createIndex({ session_id: 1 }),
    col("visitors").createIndex({ visitor_id: 1 }, { unique: true }),
    col("visitors").createIndex({ last_seen: -1 }),
    col("sessions").createIndex({ session_id: 1 }, { unique: true }),
    col("sessions").createIndex({ visitor_id: 1 }),
    col("sessions").createIndex({ started_at: 1 }),
    col("sessions").createIndex({ last_seen_at: 1 }),
    col("pageviews").createIndex({ created_at: 1 }),
    col("pageviews").createIndex({ session_id: 1 }),
    col("pageviews").createIndex({ visitor_id: 1 }),
    col("events").createIndex({ created_at: 1 }),
    col("events").createIndex({ session_id: 1 }),
    col("events").createIndex({ visitor_id: 1 }),
  ]);
}

/** The next numeric id for a collection — atomic, so two requests creating
 *  a record at the same moment never get the same one. */
export async function nextId(name) {
  const counter = await col("counters").findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  return counter.seq;
}

/** A Date as the "YYYY-MM-DD HH:MM:SS" UTC string every record stores. */
export function stamp(date = new Date()) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export const now = () => stamp();

/** The stamp for `ms` milliseconds ago — for "in the last N days" filters. */
export const ago = (ms) => stamp(new Date(Date.now() - ms));

export const DAY = 24 * 60 * 60 * 1000;

/** Leave Mongo's `_id` out of everything sent to a browser. */
export const NO_ID = { projection: { _id: 0 } };

/** Read a settings value, or `fallback` if the key was never written. */
export async function getSetting(key, fallback = null) {
  const row = await col("settings").findOne({ key });
  return row ? row.value : fallback;
}

/** Every settings value in one round trip, as `{ key: value }`. */
export async function getSettings() {
  const rows = await col("settings").find({}).toArray();
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

/** Write a settings value, replacing whatever was there. */
export async function putSetting(key, value) {
  await col("settings").updateOne(
    { key },
    { $set: { value, updated_at: now() } },
    { upsert: true },
  );
}

export function countRows(name, filter = {}) {
  return col(name).countDocuments(filter);
}

/**
 * What SQLite's foreign keys used to do on delete: a course takes its
 * syllabus with it and leaves batches and students unassigned; a batch
 * leaves its students unassigned; a visitor takes their whole trail.
 */
export async function cascadeDelete(collection, ids) {
  if (ids.length === 0) return;
  const inIds = { $in: ids };

  if (collection === "courses") {
    await Promise.all([
      col("syllabus_modules").deleteMany({ course_id: inIds }),
      col("batches").updateMany({ course_id: inIds }, { $set: { course_id: null } }),
      col("students").updateMany({ course_id: inIds }, { $set: { course_id: null } }),
    ]);
  }
  if (collection === "batches") {
    await col("students").updateMany({ batch_id: inIds }, { $set: { batch_id: null } });
  }
  if (collection === "visitors") {
    await Promise.all([
      col("sessions").deleteMany({ visitor_id: inIds }),
      col("pageviews").deleteMany({ visitor_id: inIds }),
      col("events").deleteMany({ visitor_id: inIds }),
    ]);
  }
}
