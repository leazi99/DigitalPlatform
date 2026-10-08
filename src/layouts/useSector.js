import { useLocation } from "react-router-dom";
import { useContent } from "../content/useContent";

/**
 * Which side of the business the visitor is currently on.
 *
 * Returns `null` on the landing page and in the admin panel, where neither
 * sector is active and the header deliberately shows nothing but the wordmark.
 *
 * The nav, the wordmark suffix and the header's call to action all come from
 * the content the admin edits — the header's button is the same one as the
 * hero's, so changing it in one place changes it in both rather than leaving
 * two buttons that disagree.
 */
export function useSector() {
  const { pathname } = useLocation();
  const content = useContent();
  const { sectors } = content;

  const build = (key) => {
    const sector = sectors?.[key];
    if (!sector) return null;
    const sectorContent = content[key] ?? {};
    const other = key === "agency" ? "institute" : "agency";

    return {
      ...sector,
      key,
      path: sector.path ?? `/${key}`,
      nav: sectorContent.nav ?? [],
      cta: sectorContent.hero?.primaryCta ?? sector.cta ?? { label: "Contact us", href: "#contact" },
      other: { ...sectors[other], path: sectors[other]?.path ?? `/${other}` },
    };
  };

  if (pathname.startsWith("/agency")) return build("agency");
  if (pathname.startsWith("/institute")) return build("institute");
  return null;
}
