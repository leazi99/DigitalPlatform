import Container from "../../components/Container";
import Button from "../../components/Button";
import GrowthCurve from "../../components/GrowthCurve";
import { hero } from "../../data/agency";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 lg:pb-28">
      <div aria-hidden="true" className="gridlines pointer-events-none absolute inset-0" />

      <Container className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)] lg:gap-14">
          <div className="min-w-0">
            <p className="eyebrow inline-flex items-center gap-2.5 text-signal-deep">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              {hero.eyebrow}
            </p>

            <h1 className="mt-6 font-display text-mega font-black uppercase">
              {hero.lines.map((line, i) => (
                <span
                  key={line}
                  className={`block ${i === hero.lines.length - 1 ? "text-signal" : "text-ink"}`}
                  style={{
                    animation: "heroIn 0.9s cubic-bezier(0.16,1,0.3,1) both",
                    animationDelay: `${i * 110}ms`,
                  }}
                >
                  {line}
                </span>
              ))}
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft">{hero.lead}</p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button href={hero.primaryCta.href}>{hero.primaryCta.label}</Button>
              <Button href={hero.secondaryCta.href} variant="outline">
                {hero.secondaryCta.label}
              </Button>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-rule pt-7">
              {hero.ticks.map((tick) => (
                <div key={tick.label}>
                  <dt className="sr-only">{tick.label}</dt>
                  <dd>
                    <span className="block font-display text-2xl font-extrabold tracking-tight text-ink">
                      {tick.value}
                    </span>
                    <span className="mt-1 block font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft">
                      {tick.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative min-w-0">
            <GrowthCurve className="w-full" />
            <p className="mt-2 text-center font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-soft/70">
              Six channels, one line going up
            </p>
          </div>
        </div>
      </Container>

      <style>{`
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(0.22em); }
          to { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes heroIn { from { opacity: 1; transform: none; } to { opacity: 1; transform: none; } }
        }
      `}</style>
    </section>
  );
}
