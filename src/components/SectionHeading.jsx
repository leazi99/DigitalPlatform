import Reveal from "./Reveal";

export default function SectionHeading({ eyebrow, heading, lead, tone = "dark", className = "" }) {
  const isDark = tone === "dark";

  return (
    <div className={`max-w-2xl ${className}`}>
      <Reveal>
        <p className={`eyebrow ${isDark ? "text-signal-deep" : "text-signal"}`}>{eyebrow}</p>
      </Reveal>
      <Reveal delay={70}>
        <h2
          className={`mt-4 font-display text-display font-extrabold ${
            isDark ? "text-ink" : "text-white"
          }`}
        >
          {heading}
        </h2>
      </Reveal>
      {lead && (
        <Reveal delay={140}>
          <p className={`mt-5 text-lg leading-relaxed ${isDark ? "text-ink-soft" : "text-white/70"}`}>
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
}
