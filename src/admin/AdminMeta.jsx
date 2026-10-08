import { useCallback, useEffect, useMemo, useState } from "react";
import { get } from "../lib/api";
import { MetaContext } from "./useAdmin";

/**
 * Holds the field descriptions and dropdown options the whole panel builds
 * its forms from, fetched once.
 */
export function AdminMetaProvider({ children }) {
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(
    () =>
      get("/admin/meta")
        .then((data) => {
          setMeta(data);
          setError("");
        })
        .catch((failure) => setError(failure.message)),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(() => ({ meta, error, reload: load }), [meta, error, load]);
  return <MetaContext.Provider value={value}>{children}</MetaContext.Provider>;
}
