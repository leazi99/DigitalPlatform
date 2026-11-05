import Container from "../../components/Container";
import Reveal from "../../components/Reveal";
import SectionHeading from "../../components/SectionHeading";
import Disclosure from "../../components/Disclosure";
import ServiceGlyph from "../../components/ServiceGlyph";
import { useInstitute } from "../../content/useContent";

export default function Syllabus() {
  const { syllabus, course } = useInstitute();
  const last = syllabus.modules[syllabus.modules.length - 1];

  return (
    <section id="syllabus" className="border-y border-rule bg-mist-deep/60 py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={syllabus.eyebrow} heading={syllabus.heading} lead={syllabus.lead} />

        <Reveal delay={120}>
          <dl className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-2">
            {course?.duration && (
              <div className="bg-ink px-7 py-5 sm:px-8">
                <dt className="eyebrow text-white/50">Course duration</dt>
                <dd className="mt-1.5 font-display text-xl font-extrabold tracking-tight text-white">
                  {course.duration}
                </dd>
              </div>
            )}
            {last && (
              <div className="bg-mist px-7 py-5 sm:px-8">
                <dt className="eyebrow text-ink-soft">Final module · {last.number}</dt>
                <dd className="mt-1.5 font-display text-xl font-extrabold tracking-tight text-ink">
                  {last.title}
                </dd>
              </div>
            )}
          </dl>
        </Reveal>

        <div className="mt-8 overflow-hidden rounded-2xl border border-rule bg-mist px-7 sm:px-10">
          {syllabus.modules.map((module, i) => (
            <Reveal key={module.number} delay={Math.min(i, 3) * 70}>
              <Disclosure
                defaultOpen={i === 0}
                summary={
                  <div className="flex items-start gap-4 sm:gap-5">
                    <ServiceGlyph name={module.glyph} className="mt-0.5 h-7 w-7 shrink-0 text-signal" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-mono text-xs tracking-[0.2em] text-signal-deep">
                          {module.number}
                        </span>
                        {module.weeks && (
                          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft">
                            {module.weeks}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 font-display text-xl font-extrabold tracking-tight text-ink">
                        {module.title}
                      </h3>
                      {module.tagline && (
                        <p className="mt-1 text-[0.9375rem] italic text-ink-soft">{module.tagline}</p>
                      )}
                    </div>
                  </div>
                }
              >
                <ModuleDetail module={module} />
              </Disclosure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ModuleDetail({ module }) {
  const steps = (module.framework ?? []).map(parseStep);

  return (
    <div className="grid gap-8 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10">
      <Poster module={module} />

      <div className="min-w-0">
        <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-ink-soft">{module.body}</p>

        {module.topics?.length > 0 && (
          <>
            <Label>What you will learn</Label>
            <ul className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
              {module.topics.map((topic) => (
                <li key={topic} className="flex items-start gap-3 text-[0.9375rem] text-ink-soft">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                  {topic}
                </li>
              ))}
            </ul>
          </>
        )}

        {steps.length > 0 && (
          <>
            <Label>Framework{module.frameworkName ? `: ${module.frameworkName}` : ""}</Label>
            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <li key={step.text} className="rounded-xl border border-rule bg-white/70 p-4">
                  {step.letter && (
                    <span className="block font-display text-3xl font-extrabold leading-none text-signal">
                      {step.letter}
                    </span>
                  )}
                  {step.word && (
                    <span className="mt-2 block font-display text-base font-bold text-ink">{step.word}</span>
                  )}
                  <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{step.text}</span>
                </li>
              ))}
            </ol>
          </>
        )}

        {module.tools?.length > 0 && (
          <>
            <Label>Tools you will use</Label>
            <ul className="flex flex-wrap gap-2">
              {module.tools.map((tool) => (
                <li
                  key={tool}
                  className="rounded-full border border-rule bg-white/70 px-3.5 py-1.5 text-[0.8125rem] font-medium text-ink"
                >
                  {tool}
                </li>
              ))}
            </ul>
          </>
        )}

        {(module.activities?.length > 0 || module.project) && (
          <div className="mt-8 rounded-xl border-l-4 border-signal bg-white/70 px-5 py-5 sm:px-6">
            {module.activities?.length > 0 && (
              <>
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-signal-deep">
                  Practical activities
                </span>
                <ul className="mt-3 space-y-2">
                  {module.activities.map((activity) => (
                    <li key={activity} className="flex items-start gap-3 text-[0.9375rem] text-ink-soft">
                      <span aria-hidden="true" className="mt-0.5 font-bold text-signal">✓</span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {module.project && (
              <div className={module.activities?.length > 0 ? "mt-5 border-t border-rule pt-4" : ""}>
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-signal-deep">
                  Practical project
                </span>
                <p className="mt-1.5 text-[0.9375rem] font-medium leading-relaxed text-ink">{module.project}</p>
              </div>
            )}
          </div>
        )}

        {module.practice && (
          <>
            <Label>Real-world value</Label>
            <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-ink-soft">{module.practice}</p>
          </>
        )}
      </div>
    </div>
  );
}

/** The module's poster: its icon and headline on a dark card. */
function Poster({ module }) {
  return (
    <div
      aria-hidden="true"
      className="relative flex aspect-[4/5] max-w-[13rem] flex-col justify-between overflow-hidden rounded-xl bg-ink p-5 text-white"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-signal/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-brand/40 blur-2xl" />

      <span className="relative font-mono text-[0.625rem] uppercase tracking-[0.2em] text-brand-light">
        Module {module.number}
      </span>
      <ServiceGlyph name={module.glyph} className="relative h-16 w-16 text-signal" />
      <span className="relative font-display text-xl font-extrabold leading-tight tracking-tight">
        {module.poster || module.title}
      </span>
    </div>
  );
}

function Label({ children }) {
  return (
    <h4 className="mb-4 mt-8 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-signal-deep">
      {children}
    </h4>
  );
}

/** "P – Prompt: Give AI clear instructions." → its letter, word and meaning.
 *  A line in any other shape is shown whole. */
function parseStep(line) {
  const match = /^\s*(\S{1,3})\s*[–—-]\s*([^:]+):\s*(.+)$/.exec(line);
  if (!match) return { letter: "", word: "", text: line };
  return { letter: match[1], word: match[2].trim(), text: match[3].trim() };
}
