import { useCallback, useEffect, useMemo, useState } from "react";
import { get, post, setToken, getToken } from "../lib/api";
import { AdminAuthContext } from "./useAdminAuth";

/**
 * Who is signed in.
 *
 * The token is kept in localStorage so a refresh does not sign the admin out,
 * and it is checked against the server on load — a token that has expired, or
 * whose account has been deleted or had its password changed, is discarded
 * rather than left to fail on the first real request.
 */

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));

  useEffect(() => {
    // `checking` already starts false when there is no token, so this effect
    // only has to run when there is one to check.
    if (!getToken()) return;

    let live = true;
    get("/auth/me")
      .then((data) => live && setAdmin(data.admin))
      .catch(() => {
        setToken("");
        if (live) setAdmin(null);
      })
      .finally(() => live && setChecking(false));

    return () => {
      live = false;
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const data = await post("/auth/login", { email, password }, { auth: false });
    setToken(data.token);
    setAdmin(data.admin);
    return data.admin;
  }, []);

  const signOut = useCallback(() => {
    setToken("");
    setAdmin(null);
  }, []);

  /** Called after a password change, which invalidates the previous token. */
  const refreshToken = useCallback((token) => setToken(token), []);

  const value = useMemo(
    () => ({ admin, checking, signIn, signOut, refreshToken }),
    [admin, checking, signIn, signOut, refreshToken],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
