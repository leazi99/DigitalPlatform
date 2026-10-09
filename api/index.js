// Every /api/* request is rewritten here by vercel.json, because Vercel only
// routes `[...path]` catch-all filenames in Next.js projects. The rewrite also
// passes the original path as `__path`, so the Express routes still match
// even if the function is handed the rewritten URL instead of the original.
//
// The app is imported lazily so a startup failure (missing settings, the
// database not opening) comes back as a JSON error the login screen can show,
// rather than a crashed function and a bare 500.

let loading;

export default async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const path = url.searchParams.get("__path");
  if (path !== null) {
    url.searchParams.delete("__path");
    req.url = `/api/${path}${url.search}`;
  }

  let app;
  try {
    loading ??= import("../server/app.js");
    ({ app } = await loading);
  } catch (error) {
    loading = undefined;
    console.error("API startup failed:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: error.expose
          ? error.message
          : `The API failed to start: ${error.message}. See the function logs in Vercel.`,
      }),
    );
    return;
  }
  return app(req, res);
}
