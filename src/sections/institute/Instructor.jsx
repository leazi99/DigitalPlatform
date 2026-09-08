import Container from "../../components/Container";
import Reveal from "../../components/Reveal";
import SectionHeading from "../../components/SectionHeading";
import { instructor } from "../../data/institute";

export default function Instructor() {
  return (
    <section id="instructor" className="relative py-24 sm:py-32">
      <div aria-hidden="true" className="gridlines pointer-events-none absolute inset-0" />

      <Container className="relative">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <SectionHeading eyebrow={instructor.eyebrow} heading={instructor.heading} />

          <Reveal delay={120}>
            <div className="rounded-2xl border border-rule bg-white/70 p-8 sm:p-10">
              <div className="flex items-center gap-5 border-b border-rule pb-7">
                <span
                  aria-hidden="true"
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-signal/12 font-display text-xl font-extrabold text-signal-deep"
                >
                  {instructor.name.charAt(0)}
                </span>
                <div>
                  <p className="font-display text-lg font-extrabold tracking-tight text-ink">
                    {instructor.name}
                  </p>
                  <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft">
                    {instructor.role}
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-5">
                {instructor.bio.map((para) => (
                  <p key={para} className="text-[0.9375rem] leading-relaxed text-ink-soft">
                    {para}
                  </p>
                ))}
              </div>

              <ul className="mt-8 space-y-3 border-t border-rule pt-7">
                {instructor.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-[0.9375rem] text-ink">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-signal"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12.5 L10 17.5 L19 7" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
