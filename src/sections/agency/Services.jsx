import Container from "../../components/Container";
import Reveal from "../../components/Reveal";
import SectionHeading from "../../components/SectionHeading";
import ServiceGlyph from "../../components/ServiceGlyph";
import { services } from "../../data/agency";

export default function Services() {
  return (
    <section id="services" className="border-y border-rule bg-mist-deep/60 py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={services.eyebrow} heading={services.heading} lead={services.lead} />

        <ul className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
          {services.items.map((service, i) => (
            <Reveal
              as="li"
              key={service.name}
              delay={(i % 3) * 90}
              className="group bg-mist p-8 transition-colors duration-300 hover:bg-white"
            >
              <ServiceGlyph
                name={service.glyph}
                className="h-9 w-9 text-signal transition-transform duration-300 group-hover:-translate-y-0.5"
              />
              <h3 className="mt-7 font-display text-xl font-extrabold tracking-tight text-ink">
                {service.name}
              </h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">{service.body}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
