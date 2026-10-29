import { useNavigate } from "react-router-dom";
import Container from "../components/Container";
import Reveal from "../components/Reveal";
import GrowthCurve from "../components/GrowthCurve";
import BrandName from "../components/BrandName";
import { intro } from "../data/intro";
import { getConsent, openConsent } from "../lib/consent";

/**
 * The first page a visitor sees: who we are, in one screen and four answers,
 * then one way forward. "See our services" asks for the cookie choice on the
 * way out — once — and then opens the two-doors page at /home.
 */
export default function IntroPage() {
  const navigate = useNavigate();

  const goToServices = () => {
    const next = () => navigate(intro.cta.href);
    if (getConsent()) next();
    else openConsent(next);
  };

  return (
    <>
      <section className="relative flex min-h-screen items-center pt-28 pb-20">
        <div aria-hidden="true" className="gridlines pointer-events-none absolute inset-0" />

        <Container className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <Reveal>
              <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <BrandName />
                <span className="eyebrow text-signal-deep">{intro.eyebrow}</span>
              </p>
            </Reveal>
            <Reveal delay={70}>
              <h1 className="mt-5 font-display text-display font-extrabold uppercase text-ink">
                {intro.headline}
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">{intro.lead}</p>
            </Reveal>
            <Reveal delay={210}>
              <CtaButton onClick={goToServices} className="mt-9">
                {intro.cta.label}
              </CtaButton>
            </Reveal>
          </div>

          <Reveal delay={160}>
            <Poster />
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="intro-about" className="border-t border-rule bg-white/60 py-24">
        <Container>
          <h2 id="intro-about" className="sr-only">
            About Digital World
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {intro.sections.map((item, i) => (
              <Reveal key={item.title} delay={i * 70}>
                <article className="h-full rounded-2xl border border-rule bg-white p-8">
                  <p className="font-mono text-[0.6875rem] tracking-[0.14em] text-signal-deep">
                    0{i + 1}
                  </p>
                  <h3 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-ink-soft">{item.body}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-16 flex justify-center">
            <CtaButton onClick={goToServices}>{intro.cta.label}</CtaButton>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

function CtaButton({ onClick, className = "", children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-3 rounded-full bg-signal px-8 py-4 font-display text-base font-extrabold uppercase tracking-tight text-white transition duration-200 hover:-translate-y-0.5 hover:bg-signal-deep ${className}`}
    >
      {children}
      <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
        »
      </span>
    </button>
  );
}

/**
 * The promotional poster. Uses the supplied file when there is one; until then
 * draws an animated banner in the site's own colours so the layout is whole.
 */
function Poster() {
  const src = intro.poster;
  const frame = "overflow-hidden rounded-3xl border border-rule shadow-xl shadow-ink/10";

  if (src && /\.(mp4|webm)$/i.test(src)) {
    return (
      <video
        src={src}
        className={`${frame} w-full`}
        autoPlay
        muted
        loop
        playsInline
        aria-label="Digital World promotional poster"
      />
    );
  }

  if (src) {
    return <img src={src} alt="Digital World promotional poster" className={`${frame} w-full`} />;
  }

  return (
    <div className={`${frame} relative bg-ink p-8 text-white sm:p-10`} aria-hidden="true">
      <img src="/logo-light.png" alt="" className="h-9 w-auto" />
      <p className="mt-8 font-display text-3xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-4xl">
        Grow your <span className="text-signal">business</span>
        <br />
        and <span className="text-signal">skills</span>
      </p>
      <div className="mt-6 rounded-2xl bg-white/[0.04] p-2">
        <GrowthCurve className="w-full" />
      </div>
      <ul className="mt-6 flex flex-wrap gap-2 font-mono text-[0.625rem] uppercase tracking-[0.14em]">
        {["Social media", "Search & SEO", "Paid ads", "Academy"].map((tag, i) => (
          <li
            key={tag}
            className="poster-tag rounded-full border border-white/20 px-3 py-1.5 text-white/80"
            style={{ animationDelay: `${1200 + i * 150}ms` }}
          >
            {tag}
          </li>
        ))}
      </ul>
    </div>
  );
}
