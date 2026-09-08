import Container from "../../components/Container";
import Reveal from "../../components/Reveal";
import SectionHeading from "../../components/SectionHeading";
import { testimonials } from "../../data/agency";

export default function Testimonials() {
  return (
    <section id="clients" className="border-y border-rule bg-mist-deep/60 py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={testimonials.eyebrow} heading={testimonials.heading} />

        <ul className="mt-16 grid gap-6 lg:grid-cols-3">
          {testimonials.items.map((item, i) => (
            <Reveal
              as="li"
              key={i}
              delay={i * 90}
              className="flex flex-col rounded-2xl border border-rule bg-mist p-8"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-signal" fill="currentColor">
                <path d="M10 6.5c-3.3 1-5.5 3.9-5.5 7.4 0 2.3 1.5 4 3.6 4 1.9 0 3.4-1.4 3.4-3.3 0-1.8-1.3-3.1-3-3.1-.3 0-.6 0-.8.1.4-1.6 1.6-2.9 3.3-3.6l-1-1.5Zm9 0c-3.3 1-5.5 3.9-5.5 7.4 0 2.3 1.5 4 3.6 4 1.9 0 3.4-1.4 3.4-3.3 0-1.8-1.3-3.1-3-3.1-.3 0-.6 0-.8.1.4-1.6 1.6-2.9 3.3-3.6l-1-1.5Z" />
              </svg>
              <blockquote className="mt-6 grow text-[1.0625rem] leading-relaxed text-ink">
                {item.quote}
              </blockquote>
              <footer className="mt-7 border-t border-rule pt-5">
                <p className="font-display text-sm font-extrabold tracking-tight text-ink">{item.name}</p>
                <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft">
                  {item.role}
                </p>
              </footer>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
