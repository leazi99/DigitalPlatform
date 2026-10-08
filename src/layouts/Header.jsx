import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/Container";
import Logo from "../components/Logo";
import Button from "../components/Button";
import { useSector } from "./useSector";

export default function Header() {
  const sector = useSector();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition duration-300 ${
        scrolled ? "border-b border-rule/70 bg-mist/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <Container className="flex h-20 items-center justify-between gap-6">
        <Link
          to={sector ? sector.path : "/"}
          className="shrink-0"
          aria-label="Digital World — home"
        >
          <Logo />
        </Link>

        {sector && (
          <>
            <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
              {sector.nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="relative text-sm font-medium text-ink-soft transition-colors hover:text-ink after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-signal after:transition-all after:duration-300 hover:after:w-full"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="hidden items-center gap-5 md:flex">
              <SectorSwitch to={sector.other} />
              <Button href={sector.cta.href}>{sector.cta.label}</Button>
            </div>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 md:hidden"
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
              </svg>
            </button>
          </>
        )}
      </Container>

      {sector && open && (
        <div id="mobile-nav" className="border-t border-rule bg-mist md:hidden">
          <Container className="flex flex-col gap-1 py-6">
            {sector.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-rule/60 py-4 font-display text-2xl font-bold tracking-tight"
              >
                {item.label}
              </a>
            ))}
            <Button href={sector.cta.href} onClick={() => setOpen(false)} className="mt-5 w-full">
              {sector.cta.label}
            </Button>
            <Link
              to={sector.other.path}
              onClick={() => setOpen(false)}
              className="mt-4 text-center font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft"
            >
              Looking for the {sector.other.suffix.toLowerCase()}? →
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}

/** The persistent door to the other side of the business. */
function SectorSwitch({ to }) {
  return (
    <Link
      to={to.path}
      className="group flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink"
    >
      {to.suffix}
      <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}
