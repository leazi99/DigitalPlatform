import { Link } from "react-router-dom";
import Container from "../components/Container";
import Reveal from "../components/Reveal";
import ServiceGlyph from "../components/ServiceGlyph";
import { useCompany, useContent } from "../content/useContent";

/**
 * The fork in the road. Deliberately thin — no stats, no testimonials, no
 * form. Its only job is to send a visitor to the right side of the business
 * in one click, so it must not give either sector anything to compete with.
 */
export default function LandingPage() {
  const { company, sectors } = useContent();

  return (
    <section className="relative flex min-h-screen items-center py-32">
      <div aria-hidden="true" className="gridlines pointer-events-none absolute inset-0" />

      <Container className="relative">
        <Reveal>
          <p className="eyebrow text-signal-deep">{company.tagline}</p>
        </Reveal>
        <Reveal delay={70}>
          <h1 className="mt-5 max-w-4xl font-display text-mega font-extrabold text-ink">
            Two ways in.
          </h1>
        </Reveal>
        <Reveal delay={140}>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            We run campaigns for businesses, and we teach the people who want to run their
            own. Pick the door that fits.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <Door sector={sectors.agency} glyph="growth" delay={200} />
          <Door sector={sectors.institute} glyph="search" delay={280} />
        </div>
      </Container>
    </section>
  );
}

function Door({ sector, glyph, delay }) {
  const company = useCompany();

  return (
    <Reveal delay={delay}>
      <Link
        to={sector.path}
        className="group flex h-full flex-col justify-between rounded-2xl border border-rule bg-white/70 p-8 transition duration-200 hover:-translate-y-1 hover:border-signal sm:p-10"
      >
        <div>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-signal/12 text-signal-deep transition-colors group-hover:bg-signal group-hover:text-white">
            <ServiceGlyph name={glyph} className="h-6 w-6" />
          </span>
          <p className="mt-7 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft">
            {sector.label}
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {company.short} <span className="text-signal">{sector.suffix}</span>
          </h2>
          <p className="mt-4 leading-relaxed text-ink-soft">{sector.blurb}</p>
        </div>

        <div className="mt-10 border-t border-rule pt-6">
          <p className="text-sm text-ink-soft">{sector.forWhom}</p>
          <span className="mt-3 inline-flex items-center gap-2 font-display text-sm font-bold tracking-tight text-ink">
            Enter
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
