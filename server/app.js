// The API and, in production, the site itself.
//
//   /api/content      what the public pages render
//   /api/track        visitor activity
//   /api/enrol        the academy enrolment form
//   /api/enquiries    the agency contact form
//   /api/auth/*       admin sign-in
//   /api/admin/*      everything behind the sign-in
//
// This module builds the Express app without starting a listener so the same
// request handler can run locally and inside a Vercel function.

import express from "express";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { assertConfig, config, root } from "./env.js";
import { authRouter } from "./routes/auth.js";
import { publicRouter } from "./routes/public.js";
import { adminRouter } from "./routes/admin.js";
import { requireAdmin } from "./auth.js";
import { rateLimit } from "./rateLimit.js";
import { seed } from "./seed.js";

assertConfig();
seed();

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "256kb" }));

/**
 * CORS, for development only.
 *
 * In dev the site is on Vite's port and the API is on its own, so the browser
 * treats every call as cross-origin. In production both are served from here,
 * same-origin, and no CORS headers are needed — so none are sent.
 */
app.use((req, res, next) => {
  const origin = req.get("origin");
  if (origin && config.origins.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    );
    res.set("Access-Control-Max-Age", "600");
  }
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", rateLimit({ max: 30, windowMs: 10 * 60_000 }), authRouter);
app.use("/api", publicRouter);
app.use("/api/admin", requireAdmin, adminRouter);

// Anything else under /api is a typo, and should say so rather than fall
// through to the SPA and hand the caller a page of HTML.
app.use("/api", (req, res) =>
  res.status(404).json({ error: "No such endpoint." }),
);

/**
 * In production, serve the built site from this same process. The SPA fallback
 * is what makes a hard refresh on /institute or /admin/students work.
 */
const dist = resolve(root, "dist");
const assets = resolve(dist, "assets");

if (existsSync(dist)) {
  app.use(
    express.static(dist, {
      // Vite gives every built asset a content hash in its filename, so those
      // can be cached forever. index.html must not be, or a deploy leaves
      // browsers running the previous build.
      setHeaders(res, filePath) {
        if (filePath.startsWith(assets)) {
          res.set("Cache-Control", "public, max-age=31536000, immutable");
        } else if (filePath.endsWith("index.html")) {
          // `/` is served from here rather than by the fallback below, so the
          // no-cache rule has to be stated in both places or a deploy leaves
          // the home page pointing at the previous build's assets.
          res.set("Cache-Control", "no-cache");
        }
      },
    }),
  );
  app.get(/^(?!\/api).*/, (req, res) => {
    res.set("Cache-Control", "no-cache");
    res.sendFile(resolve(dist, "index.html"));
  });
}

// Every route above answers in JSON, so an unexpected throw should too. The
// message is logged in full and the caller is told only that it failed.
app.use((error, req, res, next) => {
  console.error(`${req.method} ${req.originalUrl} —`, error);
  if (res.headersSent) return next(error);
  res
    .status(500)
    .json({ error: "Something went wrong at our end. Try again." });
});
