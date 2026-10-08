import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAdminAuth } from "./useAdminAuth";
import { contentOrder, resourceViews } from "./resourceViews";
import { useFetch } from "./useAdmin";
import { Badge, Btn } from "./ui";

/**
 * The frame the whole panel sits in: a dark sidebar of sections, and the
 * current screen beside it.
 *
 * The counts next to Students and Enquiries are the point of the sidebar — the
 * first thing someone opening the panel wants to know is whether anything new
 * has come in, and they should not have to click to find out.
 */
export default function AdminLayout({ children }) {
  const { admin, signOut } = useAdminAuth();
  const [open, setOpen] = useState(false);

  // The summary is what the badges read from. Polled gently so a panel left
  // open on a desk still shows a new enquiry arriving.
  const { data: summary, reload } = useFetch("/admin/summary");

  useEffect(() => {
    const timer = setInterval(reload, 60_000);
    return () => clearInterval(timer);
  }, [reload]);

  const sections = [
    {
      heading: null,
      items: [
        { to: "/admin", label: "Dashboard", end: true },
        { to: "/admin/visitors", label: "Visitors", count: summary?.visitors.total },
      ],
    },
    {
      heading: "Enquiries",
      items: [
        { to: "/admin/students", label: "Students", count: summary?.students.new, tone: "signal" },
        { to: "/admin/enquiries", label: "Agency enquiries", count: summary?.enquiries.new, tone: "signal" },
      ],
    },
    ...Object.entries(contentOrder).map(([heading, keys]) => ({
      heading,
      items: keys.map((key) => ({
        to: `/admin/${key}`,
        label: resourceViews[key]?.title ?? key,
        count: summary?.content[key],
      })),
    })),
    {
      heading: "Site",
      items: [
        { to: "/admin/content", label: "Page copy" },
        { to: "/admin/account", label: "Account" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-mist lg:flex">
      {/* Mobile bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-ink px-5 py-3 lg:hidden">
        <Link to="/admin" className="font-display text-sm font-extrabold tracking-tight text-white">
          Digital World <span className="text-signal">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-nav"
          className="rounded-full border border-white/25 px-4 py-1.5 text-[0.8125rem] font-semibold text-white"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <nav
        id="admin-nav"
        aria-label="Admin sections"
        className={`${open ? "block" : "hidden"} shrink-0 bg-ink px-4 py-6 lg:sticky lg:top-0 lg:block lg:h-screen lg:w-64 lg:overflow-y-auto`}
      >
        <Link
          to="/admin"
          className="hidden px-2 font-display text-base font-extrabold tracking-tight text-white lg:block"
        >
          Digital World <span className="text-signal">Admin</span>
        </Link>

        <div className="mt-6 space-y-6">
          {sections.map((section) => (
            <div key={section.heading ?? "top"}>
              {section.heading && (
                <p className="eyebrow px-2 pb-2 text-white/35">{section.heading}</p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      // Closes the mobile drawer from the tap that navigated,
                      // rather than by watching the route change afterwards.
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-[0.875rem] transition-colors ${
                          isActive
                            ? "bg-white/12 font-semibold text-white"
                            : "text-white/65 hover:bg-white/8 hover:text-white"
                        }`
                      }
                    >
                      <span className="truncate">{item.label}</span>
                      {item.count > 0 && (
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[0.625rem] ${
                            item.tone === "signal" ? "bg-signal text-white" : "bg-white/12 text-white/60"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-white/12 px-2 pt-5">
          <p className="truncate text-[0.8125rem] text-white/70">{admin?.name || admin?.email}</p>
          <p className="mt-0.5 truncate font-mono text-[0.625rem] uppercase tracking-[0.14em] text-white/35">
            {admin?.email}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Btn
              as={Link}
              to="/"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="!text-white/60 hover:!bg-white/10 hover:!text-white"
            >
              View site
            </Btn>
            <Btn variant="ghost" onClick={signOut} className="!text-white/60 hover:!bg-white/10 hover:!text-white">
              Sign out
            </Btn>
          </div>
        </div>
      </nav>

      <main className="min-w-0 flex-1">
        {summary?.live?.visitors > 0 && (
          <div className="flex items-center gap-3 border-b border-rule bg-white/60 px-5 py-2 sm:px-8">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
            </span>
            <p className="text-[0.8125rem] text-ink-soft">
              <strong className="font-semibold text-ink">{summary.live.visitors}</strong>{" "}
              {summary.live.visitors === 1 ? "person is" : "people are"} on the site right now
            </p>
            {summary.live.paths?.[0] && (
              <Badge tone="signal">{summary.live.paths[0].path}</Badge>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
