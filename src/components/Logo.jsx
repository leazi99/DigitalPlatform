import { useCompany } from "../content/useContent";

/**
 * Shared brand lockup used across the site — the official Digital World logo.
 * Transparent artwork; `tone="light"` swaps in the variant with white/light-blue
 * lettering for dark surfaces.
 */
export default function Logo({ tone = "dark" }) {
  const company = useCompany();

  return (
    <img
      src={tone === "dark" ? "/logo.png" : "/logo-light.png"}
      alt={`${company.name} — ${company.tagline}`}
      width="1500"
      height="342"
      className="block h-10 w-auto sm:h-12"
    />
  );
}
