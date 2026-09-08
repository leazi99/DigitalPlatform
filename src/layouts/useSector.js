import { useLocation } from "react-router-dom";
import { sectors } from "../data/company";
import { nav as agencyNav } from "../data/agency";
import { nav as instituteNav } from "../data/institute";

/**
 * Which side of the business the visitor is currently on.
 *
 * Returns `null` on the landing page, where neither sector is active and the
 * header deliberately shows nothing but the wordmark.
 */
export function useSector() {
  const { pathname } = useLocation();

  if (pathname.startsWith("/agency")) {
    return {
      ...sectors.agency,
      nav: agencyNav,
      cta: { label: "Get a free audit", href: "#contact" },
      other: sectors.institute,
    };
  }

  if (pathname.startsWith("/institute")) {
    return {
      ...sectors.institute,
      nav: instituteNav,
      cta: { label: "Enrol now", href: "#enrol" },
      other: sectors.agency,
    };
  }

  return null;
}
