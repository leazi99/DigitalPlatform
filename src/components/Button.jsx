const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-tight transition duration-200";

const variants = {
  solid: "bg-signal text-white hover:bg-signal-deep hover:-translate-y-0.5",
  outline:
    "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-mist hover:-translate-y-0.5",
  ghostLight: "border border-white/30 text-white hover:bg-white hover:text-ink",
};

export default function Button({ as: Tag = "a", variant = "solid", className = "", children, ...rest }) {
  return (
    <Tag className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
