import Container from "../../components/Container";
import Reveal from "../../components/Reveal";
import SectionHeading from "../../components/SectionHeading";
import Disclosure from "../../components/Disclosure";
import { faq } from "../../data/institute";

export default function Faq() {
  return (
    <section id="faq" className="border-y border-rule bg-mist-deep/60 py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={faq.eyebrow} heading={faq.heading} />

        <div className="mt-14 overflow-hidden rounded-2xl border border-rule bg-mist px-7 sm:px-10">
          {faq.items.map((item, i) => (
            <Reveal key={item.q} delay={Math.min(i, 3) * 70}>
              <Disclosure
                summary={
                  <h3 className="font-display text-lg font-bold tracking-tight text-ink">{item.q}</h3>
                }
              >
                <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-ink-soft">{item.a}</p>
              </Disclosure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
