import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

/**
 * The frame both sectors sit in. Owns the header, the footer, and the
 * scroll behaviour that a client-side router otherwise gets wrong.
 */
export default function AppShell() {
  const { pathname, hash } = useLocation();

  // A router keeps the scroll position across navigations, which lands a
  // visitor halfway down the page they just opened. Reset it — unless they
  // followed a link to a specific section.
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);

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
