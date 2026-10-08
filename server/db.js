// The database: one SQLite file, opened synchronously at startup.
//
// SQLite is the right size for this. The whole site is one company's content
// plus its enrolments and visitor log — a single file that can be copied for
// a backup beats a database server that has to be administered.

import Database from "better-sqlite3";
import { config } from "./env.js";

export const db = new Database(config.dbFile);

// Write-ahead logging: a reader (a visitor loading the site) never blocks on a
// writer (the admin saving an edit). `foreign_keys` is off by default in
// SQLite, which quietly turns every FK into a comment.
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS admins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  -- Bumped whenever a password changes. Session tokens carry the version they
  -- were signed with, so changing a password invalidates tokens already out
  -- there instead of leaving them valid until they expire.
  token_version INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

-- Content that exists exactly once: company details, section headings, the
-- hero copy. Stored as JSON under a key rather than as a column per field,
-- so adding a heading to a section does not need a migration.
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS courses (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  duration    TEXT NOT NULL DEFAULT '',
  format      TEXT NOT NULL DEFAULT '',
  mode        TEXT NOT NULL DEFAULT '',
  fee         TEXT NOT NULL DEFAULT '',
  instalments TEXT NOT NULL DEFAULT '',
  seats       TEXT NOT NULL DEFAULT '',
  certificate TEXT NOT NULL DEFAULT '',
  language    TEXT NOT NULL DEFAULT '',
  published   INTEGER NOT NULL DEFAULT 1,
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS syllabus_modules (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id  INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  number     TEXT NOT NULL DEFAULT '',
  title      TEXT NOT NULL,
  body       TEXT NOT NULL DEFAULT '',
  topics     TEXT NOT NULL DEFAULT '[]',
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS instructors (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT '',
  bio        TEXT NOT NULL DEFAULT '[]',
  points     TEXT NOT NULL DEFAULT '[]',
  published  INTEGER NOT NULL DEFAULT 1,
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS batches (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id  INTEGER REFERENCES courses(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  starts     TEXT NOT NULL DEFAULT '',
  timing     TEXT NOT NULL DEFAULT '',
  seats      TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'open',
  published  INTEGER NOT NULL DEFAULT 1,
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS faqs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  sector     TEXT NOT NULL DEFAULT 'institute',
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL DEFAULT '',
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS outcomes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL DEFAULT '',
  glyph      TEXT NOT NULL DEFAULT 'growth',
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audience (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL DEFAULT '',
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS services (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  body       TEXT NOT NULL DEFAULT '',
  glyph      TEXT NOT NULL DEFAULT 'growth',
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS process_steps (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL DEFAULT '',
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS testimonials (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  quote      TEXT NOT NULL,
  name       TEXT NOT NULL DEFAULT '',
  role       TEXT NOT NULL DEFAULT '',
  published  INTEGER NOT NULL DEFAULT 1,
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS stats (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  sector     TEXT NOT NULL DEFAULT 'agency',
  value      TEXT NOT NULL DEFAULT '0',
  suffix     TEXT NOT NULL DEFAULT '',
  label      TEXT NOT NULL DEFAULT '',
  decimals   INTEGER NOT NULL DEFAULT 0,
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Enrolments. A row is created by the public form and then worked on by the
-- admin, so it carries both what the student sent and what staff added.
CREATE TABLE IF NOT EXISTS students (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL DEFAULT '',
  phone      TEXT NOT NULL DEFAULT '',
  course_id  INTEGER REFERENCES courses(id) ON DELETE SET NULL,
  batch_id   INTEGER REFERENCES batches(id) ON DELETE SET NULL,
  batch_name TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'enquiry',
  source     TEXT NOT NULL DEFAULT 'website',
  message    TEXT NOT NULL DEFAULT '',
  notes      TEXT NOT NULL DEFAULT '',
  session_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS enquiries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL DEFAULT '',
  phone      TEXT NOT NULL DEFAULT '',
  service    TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL DEFAULT '',
  sector     TEXT NOT NULL DEFAULT 'agency',
  status     TEXT NOT NULL DEFAULT 'new',
  notes      TEXT NOT NULL DEFAULT '',
  session_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Analytics. Three grains: one row per person, one per visit, one per page.
CREATE TABLE IF NOT EXISTS visitors (
  visitor_id   TEXT PRIMARY KEY,
  first_seen   TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen    TEXT NOT NULL DEFAULT (datetime('now')),
  sessions     INTEGER NOT NULL DEFAULT 0,
  pageviews    INTEGER NOT NULL DEFAULT 0,
  events       INTEGER NOT NULL DEFAULT 0,
  device       TEXT NOT NULL DEFAULT '',
  browser      TEXT NOT NULL DEFAULT '',
  os           TEXT NOT NULL DEFAULT '',
  landing_path TEXT NOT NULL DEFAULT '',
  referrer     TEXT NOT NULL DEFAULT '',
  converted    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id   TEXT PRIMARY KEY,
  visitor_id   TEXT NOT NULL REFERENCES visitors(visitor_id) ON DELETE CASCADE,
  started_at   TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  pageviews    INTEGER NOT NULL DEFAULT 0,
  events       INTEGER NOT NULL DEFAULT 0,
  duration_ms  INTEGER NOT NULL DEFAULT 0,
  is_new       INTEGER NOT NULL DEFAULT 1,
  landing_path TEXT NOT NULL DEFAULT '',
  referrer     TEXT NOT NULL DEFAULT '',
  device       TEXT NOT NULL DEFAULT '',
  browser      TEXT NOT NULL DEFAULT '',
  os           TEXT NOT NULL DEFAULT '',
  screen       TEXT NOT NULL DEFAULT '',
  language     TEXT NOT NULL DEFAULT '',
  converted    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pageviews (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  visitor_id  TEXT NOT NULL,
  path        TEXT NOT NULL,
  title       TEXT NOT NULL DEFAULT '',
  referrer    TEXT NOT NULL DEFAULT '',
  duration_ms INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  name       TEXT NOT NULL,
  path       TEXT NOT NULL DEFAULT '',
  meta       TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pageviews_created  ON pageviews(created_at);
CREATE INDEX IF NOT EXISTS idx_pageviews_session  ON pageviews(session_id);
CREATE INDEX IF NOT EXISTS idx_pageviews_visitor  ON pageviews(visitor_id);
CREATE INDEX IF NOT EXISTS idx_events_created     ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_session     ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started   ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_visitor   ON sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_students_created   ON students(created_at);
CREATE INDEX IF NOT EXISTS idx_enquiries_created  ON enquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_syllabus_course    ON syllabus_modules(course_id);
`;

db.exec(SCHEMA);

/**
 * Add a column to a table that already exists.
 *
 * `CREATE TABLE IF NOT EXISTS` does nothing to a database created by an
 * earlier version of this file, so a new column needs saying twice: once in
 * the schema above for fresh installs, once here for existing ones.
 */
function addColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (columns.some((c) => c.name === column)) return;
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

addColumn("admins", "token_version", "INTEGER NOT NULL DEFAULT 0");

/** Read a JSON settings value, or `fallback` if the key was never written. */
export function getSetting(key, fallback = null) {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key);
  if (!row) return fallback;
  try {
    return JSON.parse(row.value);
  } catch {
    return fallback;
  }
}

/** Write a JSON settings value, replacing whatever was there. */
export function putSetting(key, value) {
  db.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
  ).run(key, JSON.stringify(value));
}

export function countRows(table) {
  return db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;
}
