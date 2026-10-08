import { createContext, useContext } from "react";

/** The signed-in admin, and the hook that reads it. Apart from the provider so
 *  that file exports nothing but a component and hot-reloads cleanly. */
export const AdminAuthContext = createContext(null);

export function useAdminAuth() {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error("useAdminAuth must be used inside AdminAuthProvider.");
  return value;
}
