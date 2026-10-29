import { useCompany } from "../content/useContent";

/**
 * "Digital World" as the brand: small, in the logo's blue, in the display face.
 * `tone="light"` is for dark surfaces, where the logo blue is too dark to read.
 */
export default function BrandName({ tone = "dark", className = "" }) {
  const company = useCompany();

  return (
    <span
      className={`font-display text-sm font-bold tracking-tight ${
        tone === "dark" ? "text-brand" : "text-brand-light"
      } ${className}`}
    >
      {company.short}
    </span>
  );
}
