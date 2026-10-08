// A small in-memory rate limiter for the public routes.
//
// It exists to stop one browser filling the enquiries table or the visitor log
// by accident or by script. It is per-process, so it is not a defence for a
// site behind several instances — put a real limiter at the proxy for that.
// For one Node process serving one company's site, this is enough.

const buckets = new Map();

export function rateLimit({ max = 60, windowMs = 60_000 } = {}) {
  return function limit(req, res, next) {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > max) {
      res.set("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
      return res.status(429).json({
        error: "That was a lot of requests in a short time. Wait a moment and try again.",
      });
    }

    next();
  };
}

// Expired buckets are dropped on a timer rather than on each request, so a
// flood of unique keys cannot grow the map without bound. `unref` keeps this
// interval from holding the process open on shutdown.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}, 60_000).unref();
