import Container from "../../components/Container";
import Reveal from "../../components/Reveal";
import SectionHeading from "../../components/SectionHeading";
import ServiceGlyph from "../../components/ServiceGlyph";
import { useInstitute } from "../../content/useContent";

export default function Outcomes() {
  const { outcomes } = useInstitute();

  return (
    <section id="outcomes" className="relative py-24 sm:py-32">
      <div aria-hidden="true" className="gridlines pointer-events-none absolute inset-0" />

      <Container className="relative">
        <SectionHeading eyebrow={outcomes.eyebrow} heading={outcomes.heading} lead={outcomes.lead} />

        <ul className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-2">
          {outcomes.items.map((item, i) => (
            <Reveal
              as="li"
              key={item.title}
              delay={(i % 2) * 90}
              className="group bg-mist p-8 transition-colors duration-300 hover:bg-white"
            >
              <ServiceGlyph
                name={item.glyph}
                className="h-9 w-9 text-signal transition-transform duration-300 group-hover:-translate-y-0.5"
              />
              <h3 className="mt-7 font-display text-xl font-extrabold tracking-tight text-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">{item.body}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
