import Container from "../../components/Container";
import Reveal from "../../components/Reveal";
import SectionHeading from "../../components/SectionHeading";
import { useInstitute } from "../../content/useContent";

/**
 * Who teaches the course.
 *
 * Takes a list rather than a single person: a course can be taught by two or
 * three people, and the admin panel lets them be added and removed. One
 * instructor renders as it always did — the grid simply has one cell.
 */
export default function Instructor() {
  const { instructor } = useInstitute();
  const people = instructor.people ?? [];

  if (people.length === 0) return null;

  return (
    <section id="instructor" className="relative py-24 sm:py-32">
      <div aria-hidden="true" className="gridlines pointer-events-none absolute inset-0" />

      <Container className="relative">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <SectionHeading eyebrow={instructor.eyebrow} heading={instructor.heading} />

          <div className={people.length > 1 ? "grid gap-6" : undefined}>
            {people.map((person, i) => (
              <Reveal key={person.id ?? person.name} delay={120 + i * 90}>
                <Card person={person} />
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function Card({ person }) {
  const bio = person.bio ?? [];
  const points = person.points ?? [];

  return (
    <div className="rounded-2xl border border-rule bg-white/70 p-8 sm:p-10">
      <div className="flex items-center gap-5 border-b border-rule pb-7">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-signal/12 font-display text-xl font-extrabold text-signal-deep"
        >
          {(person.name ?? "?").charAt(0)}
        </span>
        <div>
          <p className="font-display text-lg font-extrabold tracking-tight text-ink">
            {person.name}
          </p>
          {person.role && (
            <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft">
              {person.role}
            </p>
          )}
        </div>
      </div>

      {bio.length > 0 && (
        <div className="mt-7 space-y-5">
          {bio.map((para) => (
            <p key={para} className="text-[0.9375rem] leading-relaxed text-ink-soft">
              {para}
            </p>
          ))}
        </div>
      )}

      {points.length > 0 && (
        <ul className="mt-8 space-y-3 border-t border-rule pt-7">
          {points.map((point) => (
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
      )}
    </div>
  );
}
