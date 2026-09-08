import Container from "../../components/Container";
import Reveal from "../../components/Reveal";
import SectionHeading from "../../components/SectionHeading";
import Disclosure from "../../components/Disclosure";
import { syllabus } from "../../data/institute";

export default function Syllabus() {
  return (
    <section id="syllabus" className="border-y border-rule bg-mist-deep/60 py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={syllabus.eyebrow} heading={syllabus.heading} lead={syllabus.lead} />

        <div className="mt-16 overflow-hidden rounded-2xl border border-rule bg-mist px-7 sm:px-10">
          {syllabus.modules.map((module, i) => (
            <Reveal key={module.number} delay={Math.min(i, 3) * 70}>
              <Disclosure
                defaultOpen={i === 0}
                summary={
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-5">
                    <span className="font-mono text-xs tracking-[0.2em] text-signal-deep">
                      {module.number}
                    </span>
                    <h3 className="font-display text-xl font-extrabold tracking-tight text-ink">
                      {module.title}
                    </h3>
                  </div>
                }
              >
                <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-ink-soft">
                  {module.body}
                </p>
                <ul className="mt-6 grid gap-x-10 gap-y-3 sm:grid-cols-2">
                  {module.topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-3 text-[0.9375rem] text-ink-soft">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </Disclosure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
