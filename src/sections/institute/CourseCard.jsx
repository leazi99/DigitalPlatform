import Container from "../../components/Container";
import Reveal from "../../components/Reveal";
import { course } from "../../data/institute";

/** The dark band — the agency page uses it for its numbers, the academy for
 *  the facts a prospective student checks before reading anything else. */
const FACTS = [
  { key: "duration", label: "Duration" },
  { key: "format", label: "Format" },
  { key: "mode", label: "Mode" },
  { key: "fee", label: "Fee" },
  { key: "seats", label: "Class size" },
  { key: "language", label: "Language" },
];

export default function CourseCard() {
  return (
    <section id="course" className="bg-ink py-20 text-white sm:py-24">
      <Container>
        <div className="flex flex-col gap-8 border-b border-white/12 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-signal">The course</p>
            <h2 className="mt-4 font-display text-display font-extrabold text-white">
              {course.title}
            </h2>
          </div>
          <p className="max-w-sm text-[0.9375rem] leading-relaxed text-white/60">
            {course.instalments}. {course.certificate}.
          </p>
        </div>

        <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {FACTS.map((fact, i) => (
            <Reveal key={fact.key} delay={(i % 3) * 80}>
              <dt className="eyebrow text-white/45">{fact.label}</dt>
              <dd className="mt-2 font-display text-lg font-bold tracking-tight text-white">
                {course[fact.key]}
              </dd>
            </Reveal>
          ))}
        </dl>
      </Container>
    </section>
  );
}
