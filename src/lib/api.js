/**
 * The browser's side of the API.
 *
 * One place that knows the base URL, attaches the admin token, and turns a
 * failed response into an Error carrying a message written for a person to
 * read — plus, where the server sent them, per-field messages a form can show
 * under the input they belong to.
 */

// Empty in production: the API and the site are served from the same origin,
// so a relative /api is correct. In development this points at the API port.
const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

const TOKEN_KEY = "dw.admin.token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    // Private browsing with storage blocked. The panel still works for the
    // length of the page's life; a refresh will ask for the password again.
    return memoryToken;
  }
}

let memoryToken = "";

export function setToken(token) {
  memoryToken = token ?? "";
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — the in-memory copy above is the fallback */
  }
}

/** Thrown for any non-2xx response. `fields` is keyed by form field name. */
export class ApiError extends Error {
  constructor(message, { status = 0, fields = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

export async function api(path, { method = "GET", body, auth = true, signal } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = auth ? getToken() : "";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${base}/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(
      "Could not reach the server. Check that it is running, and that you are online.",
      { status: 0 },
    );
  }

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(payload?.error ?? `The server replied ${response.status}.`, {
      status: response.status,
      fields: payload?.fields ?? null,
    });
  }

  return payload;
}

export const get = (path, options) => api(path, options);
export const post = (path, body, options) => api(path, { ...options, method: "POST", body });
export const patch = (path, body, options) => api(path, { ...options, method: "PATCH", body });
export const put = (path, body, options) => api(path, { ...options, method: "PUT", body });
export const del = (path, options) => api(path, { ...options, method: "DELETE" });

/** A download that needs the admin token, which a plain link cannot carry. */
export async function download(path, filename) {
  const response = await fetch(`${base}/api${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new ApiError("That download failed.", { status: response.status });

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // Safari ignores a click on a link that is not in the document, so it goes
  // in and comes straight back out.
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const apiBase = base;
