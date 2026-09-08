import Container from "../../components/Container";
import Reveal from "../../components/Reveal";
import SectionHeading from "../../components/SectionHeading";
import { company } from "../../data/company";
import { about } from "../../data/agency";

export default function About() {
  return (
    <section id="about" className="relative py-24 sm:py-32">
      <div aria-hidden="true" className="gridlines pointer-events-none absolute inset-0" />

      <Container className="relative">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <SectionHeading eyebrow={about.eyebrow} heading={about.heading} />

          <div>
            {about.body.map((paragraph, i) => (
              <Reveal key={i} delay={i * 90}>
                <p className="mb-5 text-lg leading-relaxed text-ink-soft">{paragraph}</p>
              </Reveal>
            ))}

            <Reveal delay={220}>
              <p className="mt-10 border-l-2 border-signal pl-6 font-display text-2xl font-bold leading-snug tracking-tight text-ink">
                “{company.tagline}.”
              </p>
            </Reveal>

          </div>
        </div>

        <dl className="mt-16 grid gap-10 border-t border-rule pt-10 sm:grid-cols-3 lg:mt-20">
          {about.points.map((point, i) => (
            <Reveal as="div" key={point.title} delay={i * 90}>
              <dt className="font-display text-base font-extrabold tracking-tight text-ink">
                {point.title}
              </dt>
              <dd className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">{point.body}</dd>
            </Reveal>
          ))}
        </dl>
      </Container>
    </section>
  );
}
