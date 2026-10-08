import { trackEvent } from "../lib/track";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-tight transition duration-200";

const variants = {
  solid: "bg-signal text-white hover:bg-signal-deep hover:-translate-y-0.5",
  outline:
    "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-mist hover:-translate-y-0.5",
  ghostLight: "border border-white/30 text-white hover:bg-white hover:text-ink",
};

/**
 * Every call to action on the public site.
 *
 * Clicks are recorded, which is what turns the dashboard's "engaged visitors"
 * figure from a guess based on time on page into a count of people who
 * actually reached for something. The label is recorded, not the visitor.
 */
export default function Button({
  as: Tag = "a",
  variant = "solid",
  className = "",
  children,
  onClick,
  href,
  ...rest
}) {
  const handleClick = (event) => {
    trackEvent("cta_click", {
      label: typeof children === "string" ? children : undefined,
      href,
    });
    onClick?.(event);
  };

  return (
    <Tag className={`${base} ${variants[variant]} ${className}`} href={href} onClick={handleClick} {...rest}>
      {children}
    </Tag>
  );
}
