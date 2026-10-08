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

export const config = {
  port: Number(process.env.PORT ?? 4000),

  // The database file. Gitignored — it holds real enrolments and visitor logs.
  dbFile: process.env.DB_FILE
    ? resolve(root, process.env.DB_FILE)
    : process.env.VERCEL
      ? "/tmp/data.db"
      : resolve(here, "data.db"),

  // Signs admin session tokens. Change it and every admin is logged out,
  // which is the right behaviour if you think a token has leaked.
  jwtSecret: process.env.JWT_SECRET ?? "",

  // How long an admin stays signed in.
  sessionHours: Number(process.env.SESSION_HOURS ?? 12),

  // The first admin, created on first run only. After that, change the
  // password from the admin panel — editing these does nothing to an
  // account that already exists.
  seedAdmin: {
    email: process.env.ADMIN_EMAIL ?? "admin@digitalworld.local",
    password: process.env.ADMIN_PASSWORD ?? "",
    name: process.env.ADMIN_NAME ?? "Administrator",
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
  if (!config.jwtSecret || config.jwtSecret.length < 32) {
    missing.push("JWT_SECRET (at least 32 characters)");
  }
  if (!config.seedAdmin.password || config.seedAdmin.password.length < 8) {
    missing.push("ADMIN_PASSWORD (at least 8 characters)");
  }

  if (missing.length > 0) {
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
