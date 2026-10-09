import { app } from "../server/app.js";

// Every /api/* request is rewritten here by vercel.json, because Vercel only
// routes `[...path]` catch-all filenames in Next.js projects. The rewrite also
// passes the original path as `__path`, so the Express routes still match
// even if the function is handed the rewritten URL instead of the original.
export default function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const path = url.searchParams.get("__path");
  if (path !== null) {
    url.searchParams.delete("__path");
    req.url = `/api/${path}${url.search}`;
  }
  return app(req, res);
}
