import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { del, get, patch, post } from "../lib/api";

/**
 * The panel's data layer.
 *
 * `useResource` is the list-and-mutate hook every CRUD screen uses, so the
 * reload-after-save and the error handling are written once rather than per
 * screen. The provider that fills `useMeta` lives in `AdminMeta.jsx`, so this
 * file exports only hooks.
 *
 * The fetch-on-mount effects here do call setState synchronously, which the
 * linter flags. That is what fetching is: the effect is synchronising React
 * with an external system, and the loading flag has to go up before the request
 * goes out.
 */

// ── Meta ────────────────────────────────────────────────────────────────────

export const MetaContext = createContext(null);

export function useMeta() {
  const value = useContext(MetaContext);
  if (!value) throw new Error("useMeta must be used inside AdminMetaProvider.");
  return value;
}

// ── Resources ───────────────────────────────────────────────────────────────

/**
 * One resource's rows, plus the operations on them.
 *
 * Every mutation reloads the list rather than patching it in place. It costs a
 * request and removes a whole class of bug: the list cannot drift from what the
 * database holds, including the positions a reorder rewrote.
 */
export function useResource(key, { query = {}, auto = true } = {}) {
  const { reload: reloadMeta } = useMeta();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(auto);
  const [error, setError] = useState("");

  const search = useMemo(() => {
    const params = new URLSearchParams();
    for (const [name, value] of Object.entries(query)) {
      if (value !== "" && value !== null && value !== undefined) params.set(name, value);
    }
    const text = params.toString();
    return text ? `?${text}` : "";
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get(`/admin/${key}${search}`);
      setItems(data.items);
      setTotal(data.total);
      setError("");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  }, [key, search]);

  useEffect(() => {
    if (auto) load();
  }, [auto, load]);

  // Courses and batches are offered as dropdown options on other screens, so
  // changing them has to refresh what those dropdowns show.
  const affectsOptions = key === "courses" || key === "batches";

  const after = useCallback(
    async (result) => {
      await load();
      if (affectsOptions) await reloadMeta();
      return result;
    },
    [load, affectsOptions, reloadMeta],
  );

  const create = useCallback(
    (values) => post(`/admin/${key}`, values).then(after),
    [key, after],
  );

  const update = useCallback(
    (id, values) => patch(`/admin/${key}/${id}`, values).then(after),
    [key, after],
  );

  const remove = useCallback((id) => del(`/admin/${key}/${id}`).then(after), [key, after]);

  const removeMany = useCallback(
    (ids) => post(`/admin/${key}/bulk-delete`, { ids }).then(after),
    [key, after],
  );

  const reorder = useCallback(
    (ids) => post(`/admin/${key}/reorder`, { ids }).then(after),
    [key, after],
  );

  /** Moves one row up or down and saves the whole resulting order. */
  const move = useCallback(
    (id, direction) => {
      const index = items.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= items.length) return Promise.resolve();

      const ids = items.map((item) => item.id);
      [ids[index], ids[target]] = [ids[target], ids[index]];
      return reorder(ids);
    },
    [items, reorder],
  );

  return {
    items,
    total,
    loading,
    error,
    setError,
    reload: load,
    create,
    update,
    remove,
    removeMany,
    reorder,
    move,
  };
}

/** A one-off GET that reloads when `path` changes. For dashboards and details. */
export function useFetch(path, { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      setData(await get(path));
      setError("");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  }, [path, enabled]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
