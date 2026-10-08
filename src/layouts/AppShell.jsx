import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useContent } from "../content/useContent";
import { useSector } from "./useSector";
import { startTracking, trackPageview } from "../lib/track";

/**
 * The frame both sectors sit in. Owns the header, the footer, the scroll
 * behaviour that a client-side router otherwise gets wrong, and the visitor
 * tracking that feeds the admin panel's figures.
 */
export default function AppShell() {
  const { pathname, hash } = useLocation();
  const { company } = useContent();
  const sector = useSector();

  // One title per sector rather than one for the whole site. It is what a
  // browser tab, a bookmark and a search result show, and it is what the
  // admin panel files each page view under — with a single shared title every
  // row in that report reads the same and tells nobody anything.
  const title = sector
    ? `${company.short} ${sector.suffix} — ${sector.label}`
    : `${company.name} — ${company.tagline}`;

  useEffect(() => {
    document.title = title;
  }, [title]);

  // A router keeps the scroll position across navigations, which lands a
  // visitor halfway down the page they just opened. Reset it — unless they
  // followed a link to a specific section.
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);

  useEffect(() => {
    startTracking();
  }, []);

  // One pageview per route, not per hash: following the nav to #syllabus is
  // moving within a page, not opening another one. The title goes with it, so
  // the admin's page report is readable without decoding paths.
  useEffect(() => {
    trackPageview(pathname, title);
  }, [pathname, title]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Suspense fallback={<div className="min-h-screen" aria-hidden="true" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
