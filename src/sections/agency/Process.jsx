import Container from "../../components/Container";
import Reveal from "../../components/Reveal";
import SectionHeading from "../../components/SectionHeading";
import { useAgency } from "../../content/useContent";

export default function Process() {
  const { process } = useAgency();

  return (
    <section id="process" className="relative py-24 sm:py-32">
      <div aria-hidden="true" className="gridlines pointer-events-none absolute inset-0" />

      <Container className="relative">
        <SectionHeading eyebrow={process.eyebrow} heading={process.heading} />

        {/* Numbered because the order is the point — each step needs the one before it. */}
        <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {process.steps.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 100} className="relative border-t-2 border-ink pt-6">
              <span className="font-mono text-xs tracking-[0.2em] text-signal-deep">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-xl font-extrabold tracking-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
