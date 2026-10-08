import { useEffect, useMemo, useState } from "react";
import { get } from "../lib/api";
import { fallbackContent } from "./fallback";
import { ContentContext } from "./useContent";

/**
 * Where every public page gets its copy.
 *
 * It renders the bundled fallback immediately and swaps in what the API sends
 * when it arrives. Nothing waits on the network: a visitor on a slow
 * connection sees the page, not a spinner, and if the API is down they see the
 * content the site shipped with rather than an error.
 *
 * The cost of that choice is that an edit made in the admin panel can appear a
 * moment after first paint. For a marketing site that is the right way round.
 */

export function ContentProvider({ children }) {
  const [content, setContent] = useState(fallbackContent);
  const [source, setSource] = useState("fallback");

  useEffect(() => {
    const controller = new AbortController();

    get("/content", { auth: false, signal: controller.signal })
      .then((live) => {
        // Merge rather than replace: if a section has been emptied in the
        // database — no courses yet, say — the page should not lose the block
        // of copy around it.
        setContent(merge(fallbackContent, live));
        setSource("live");
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        console.warn("Using the bundled content — the API did not answer:", error.message);
      });

    return () => controller.abort();
  }, []);

  const value = useMemo(() => ({ ...content, __source: source }), [content, source]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

/**
 * A section-by-section merge: a key the API sent wins, a key it left out keeps
 * the fallback's value.
 *
 * What the API *does* send always wins, including `null` and `[]`. Those are
 * answers, not gaps — "no course is published", "no batches are scheduled" —
 * and falling back to the bundled placeholder there would put invented copy on
 * the page precisely when the admin had taken the real thing down. Only a key
 * that is absent altogether falls back.
 */
function merge(base, live) {
  if (!live || typeof live !== "object") return base;
  if (Array.isArray(live)) return live;

  const out = { ...base };
  for (const [key, value] of Object.entries(live)) {
    if (value === undefined) continue;
    if (value === null) {
      out[key] = null;
      continue;
    }
    if (Array.isArray(value)) out[key] = value;
    else if (typeof value === "object") out[key] = merge(base?.[key] ?? {}, value);
    else out[key] = value;
  }
  return out;
}
