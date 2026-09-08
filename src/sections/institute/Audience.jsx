import Container from "../../components/Container";
import Reveal from "../../components/Reveal";
import SectionHeading from "../../components/SectionHeading";
import { audience } from "../../data/institute";

export default function Audience() {
  return (
    <section id="audience" className="relative py-24 sm:py-32">
      <div aria-hidden="true" className="gridlines pointer-events-none absolute inset-0" />

      <Container className="relative">
        <SectionHeading eyebrow={audience.eyebrow} heading={audience.heading} lead={audience.lead} />

        <ul className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {audience.items.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 90} className="border-t-2 border-ink pt-6">
              <h3 className="font-display text-xl font-extrabold tracking-tight text-ink">
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
