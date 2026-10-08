import { createContext, useContext } from "react";
import { fallbackContent } from "./fallback";

/**
 * The context the public pages read their copy from, and the hooks that read it.
 *
 * Apart from `ContentProvider.jsx` so that file exports nothing but a component
 * — which is what lets Vite hot-reload an edit to it without remounting the
 * whole page and losing scroll position and form state.
 *
 * The default value is the bundled fallback, so a component rendered outside the
 * provider (a test, say) still has content rather than undefined.
 */
export const ContentContext = createContext(fallbackContent);

export function useContent() {
  return useContext(ContentContext);
}

export function useCompany() {
  return useContent().company;
}

export function useAgency() {
  return useContent().agency;
}

export function useInstitute() {
  return useContent().institute;
}
