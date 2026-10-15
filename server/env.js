// Server configuration, read from the environment once at startup.
//
// These are SERVER variables — deliberately not prefixed `VITE_`, because
// anything Vite sees with that prefix is inlined into the browser bundle.
// A JWT secret in the browser bundle is not a secret.

import "dotenv/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

export const root = resolve(here, "..");

// Names the connection string commonly ends up under — Vercel's own MongoDB
// Atlas integration, other hosts' conventions, and plain typos of habit.
const MONGO_NAMES = [
  "MONGODB_URI",
  "MONGODB_URL",
  "MONGO_URI",
  "MONGO_URL",
  "MONGODB_CONNECTION_STRING",
  "ATLAS_URI",
  "DATABASE_URL",
];

/**
 * The first connection string set under any of those names, cleaned of what a
 * paste into a dashboard tends to drag along: surrounding quotes, whitespace,
 * or the whole `MONGODB_URI=…` line copied from a .env file.
 */
function readMongoUri() {
  for (const name of MONGO_NAMES) {
    const raw = process.env[name];
    if (!raw) continue;
    const value = raw
      .trim()
      .replace(/^[A-Z_]+\s*=\s*/, "")
      .replace(/^["'`]+|["'`]+$/g, "")
      .trim();
    // DATABASE_URL is often some other database's; only take it if it is Mongo.
    if (name === "DATABASE_URL" && !/^mongodb(\+srv)?:\/\//.test(value)) continue;
    if (value) return { name, value };
  }
  return { name: null, value: "" };
}

const mongo = readMongoUri();

export const config = {
  port: Number(process.env.PORT ?? 4000),

  // MongoDB Atlas connection string (mongodb+srv://…). The database lives
  // outside the server, so it survives deploys and serverless cold starts.
  mongoUri: mongo.value,
  mongoUriName: mongo.name,
  mongoDb: process.env.MONGODB_DB?.trim() || "digitalworld",

  // Signs admin session tokens. Change it and every admin is logged out,
  // which is the right behaviour if you think a token has leaked.
  jwtSecret: (process.env.JWT_SECRET ?? "").trim(),

  // How long an admin stays signed in.
  sessionHours: Number(process.env.SESSION_HOURS ?? 12),

  // Trimmed, because a value pasted into a hosting dashboard easily picks up
  // a trailing space or newline, and the login compares the password exactly.
  //
  // The first admin, created on first run only. After that, change the
  // password from the admin panel — editing these does nothing to an
  // account that already exists.
  seedAdmin: {
    email: process.env.ADMIN_EMAIL?.trim() || "admin@digitalworld.local",
    password: (process.env.ADMIN_PASSWORD ?? "").trim(),
    name: process.env.ADMIN_NAME?.trim() || "Administrator",
  },

  // Browser origins allowed to call the API. In dev the Vite server is on a
  // different port, so it has to be named explicitly.
  origins: (
    process.env.CORS_ORIGINS ?? "http://localhost:5173,http://127.0.0.1:5173"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  isProduction: process.env.NODE_ENV === "production",
};

/**
 * Refuse to start misconfigured rather than start insecurely.
 *
 * A generated-at-startup JWT secret would "work" — and silently log every
 * admin out on each restart. A default admin password would "work" too, and
 * hand the panel to anyone who reads this repository.
 */
export function assertConfig() {
  const missing = [];
  if (!config.mongoUri) {
    missing.push("MONGODB_URI (your MongoDB Atlas connection string)");
  } else if (!/^mongodb(\+srv)?:\/\//.test(config.mongoUri)) {
    missing.push(
      `${config.mongoUriName} — it must start with mongodb+srv:// (copy it from Atlas → Connect → Drivers)`,
    );
  } else if (/<(db_)?password>/i.test(config.mongoUri)) {
    missing.push(
      `${config.mongoUriName} — it still contains the <password> placeholder; put your database user's real password there`,
    );
  }
  if (!config.jwtSecret || config.jwtSecret.length < 32) {
    missing.push("JWT_SECRET (at least 32 characters)");
  }
  if (!config.seedAdmin.password || config.seedAdmin.password.length < 8) {
    missing.push("ADMIN_PASSWORD (at least 8 characters)");
  }

  if (missing.length > 0) {
    // On Vercel, exiting kills the function with a bare 500 that says
    // nothing. Throwing lets api/index.js answer with which settings are
    // missing instead.
    if (process.env.VERCEL) {
      const error = new Error(
        `The admin API cannot start. Set these in Vercel → Settings → Environment Variables, then redeploy: ${missing.join(", ")}. ${describeVercelEnv()}`,
      );
      error.expose = true;
      throw error;
    }
    console.error(
      [
        "",
        "The admin API cannot start — these are not set in your .env file:",
        ...missing.map((m) => `  · ${m}`),
        "",
        "Copy .env.example to .env and fill them in. To generate a secret:",
        "  node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"",
        "",
      ].join("\n"),
    );
    process.exit(1);
  }
}

/**
 * Which Vercel environment this is, and which of our settings it can see —
 * names only, never values. A variable saved for "Preview" but not
 * "Production", or added without a redeploy, shows up here as absent.
 */
function describeVercelEnv() {
  const ours = /^(MONGO|ATLAS|DATABASE_URL|JWT_|ADMIN_|SESSION_)/;
  const seen = Object.keys(process.env)
    .filter((name) => ours.test(name) && process.env[name])
    .sort();
  return [
    `This deployment is the "${process.env.VERCEL_ENV ?? "unknown"}" environment`,
    `and can see: ${seen.length ? seen.join(", ") : "none of the app's settings"}.`,
    "Make sure each variable has this environment ticked, and redeploy after saving.",
  ].join(" ");
}
