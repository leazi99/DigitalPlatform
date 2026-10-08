import { Link } from "react-router-dom";
import Container from "../components/Container";
import Logo from "../components/Logo";
import { useContent } from "../content/useContent";
import { useSector } from "./useSector";

export default function Footer() {
  const { company, sectors, socials } = useContent();
  const sector = useSector();

  return (
    <footer className="bg-ink pt-16 pb-10 text-white">
      <Container>
        <div className="flex flex-col gap-12 border-b border-white/12 pb-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <Link to="/" aria-label="Digital World — home">
              <Logo tone="light" />
            </Link>
            <p className="mt-6 leading-relaxed text-white/60">
              Two sides of the same business: campaigns run for you, and the course that
              teaches you to run them yourself.
            </p>
            <a
              href={`mailto:${company.email}`}
              className="mt-6 inline-block font-display text-lg font-bold tracking-tight text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal"
            >
              {company.email}
            </a>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:gap-16">
            <div>
              <h2 className="eyebrow text-white/45">Sectors</h2>
              <ul className="mt-5 space-y-3">
                {Object.values(sectors).map((s) => (
                  <li key={s.key}>
                    <Link to={s.path} className="text-white/75 transition-colors hover:text-signal">
                      {s.suffix}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {sector && (
              <div>
                <h2 className="eyebrow text-white/45">On this page</h2>
                <ul className="mt-5 space-y-3">
                  {sector.nav.map((item) => (
                    <li key={item.href}>
                      <a href={item.href} className="text-white/75 transition-colors hover:text-signal">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="eyebrow text-white/45">Follow</h2>
              <ul className="mt-5 space-y-3">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a href={social.href} className="text-white/75 transition-colors hover:text-signal">
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-8 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {company.name}</p>
          <p>{company.address}</p>
        </div>
      </Container>
    </footer>
  );
}
