import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { del, download } from "../../lib/api";
import { useFetch } from "../useAdmin";
import {
  Alert,
  Badge,
  Btn,
  Card,
  ConfirmBtn,
  Drawer,
  Empty,
  Input,
  Loading,
  Page,
  TD,
  TH,
  Table,
  Toggle,
} from "../ui";
import {
  formatAgo,
  formatDateTime,
  formatDuration,
  formatNumber,
} from "../format";

/**
 * Everyone who has been on the site, and what each of them did.
 *
 * A visitor here is a browser, not a name: the id is random, stored by that
 * browser, and tied to a person only if they went on to send a form — in which
 * case their own submission is shown beside the trail.
 */
export default function Visitors() {
  const [params, setParams] = useSearchParams();
  const [engagedOnly, setEngagedOnly] = useState(false);
  const [openId, setOpenId] = useState(null);

  const q = params.get("q") ?? "";
  const setQ = (value) => {
    const next = new URLSearchParams(params);
    if (value) next.set("q", value);
    else next.delete("q");
    setParams(next, { replace: true });
  };

  const path = useMemo(() => {
    const search = new URLSearchParams({ limit: "200" });
    if (q) search.set("q", q);
    if (engagedOnly) search.set("engaged", "1");
    return `/admin/visitors?${search}`;
  }, [q, engagedOnly]);

  const { data, loading, error, reload } = useFetch(path);
  const visitors = data?.items ?? [];

  async function forget(id) {
    await del(`/admin/visitors/${id}`);
    setOpenId(null);
    reload();
  }

  return (
    <Page
      title="Visitors"
      lead="One row per browser that has opened the site. Open a row to see every page they read, in order."
      actions={
        <Btn variant="subtle" onClick={() => download("/admin/export/visitors", "visitors.csv")}>
          Export CSV
        </Btn>
      }
    >
      <div className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}

        <div className="flex flex-wrap items-center gap-4">
          <Input
            type="search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search by id, landing page or referrer…"
            className="max-w-sm"
            aria-label="Search visitors"
          />
          <Toggle
            id="engaged-only"
            checked={engagedOnly}
            onChange={setEngagedOnly}
            label="Only those who engaged"
          />
          <p className="ml-auto font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-soft">
            {formatNumber(data?.total ?? 0)} visitors
          </p>
        </div>

        <Card>
          {loading && visitors.length === 0 ? (
            <Loading label="Reading the visitor log…" />
          ) : visitors.length === 0 ? (
            <Empty
              title={q ? "Nothing matches that." : "Nobody has visited yet."}
              body={
                q
                  ? "Clear the search to see everyone."
                  : "Open the website in another browser and this fills up. Note that a browser asking not to be tracked is never recorded."
              }
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  <TH>Visitor</TH>
                  <TH>Device</TH>
                  <TH>Came from</TH>
                  <TH className="text-right">Visits</TH>
                  <TH className="text-right">Pages</TH>
                  <TH className="text-right">Time</TH>
                  <TH>Last seen</TH>
                  <TH className="w-24 text-right">Actions</TH>
                </tr>
              </thead>
              <tbody>
                {visitors.map((visitor) => (
                  <tr key={visitor.visitor_id} className="transition-colors hover:bg-white/60">
                    <TD>
                      <button
                        type="button"
                        onClick={() => setOpenId(visitor.visitor_id)}
                        className="flex flex-col items-start gap-1 text-left"
                      >
                        <span className="font-mono text-[0.75rem] text-ink underline decoration-signal/50 decoration-2 underline-offset-2">
                          {visitor.visitor_id.slice(0, 10)}
                        </span>
                        <span className="flex gap-1.5">
                          {visitor.converted === 1 && <Badge tone="good">Got in touch</Badge>}
                          {visitor.sessions > 1 && <Badge tone="signal">Returned</Badge>}
                        </span>
                      </button>
                    </TD>
                    <TD className="text-ink-soft">
                      {visitor.device}
                      <span className="block text-[0.8125rem]">
                        {visitor.browser} · {visitor.os}
                      </span>
                    </TD>
                    <TD className="max-w-[12rem] truncate text-ink-soft">
                      {visitor.referrer || "Direct"}
                      <span className="block truncate text-[0.8125rem]">{visitor.landing_path}</span>
                    </TD>
                    <TD className="text-right [font-variant-numeric:tabular-nums]">{visitor.sessions}</TD>
                    <TD className="text-right [font-variant-numeric:tabular-nums]">{visitor.pageviews}</TD>
                    <TD className="text-right text-ink-soft [font-variant-numeric:tabular-nums]">
                      {formatDuration(visitor.total_duration_ms)}
                    </TD>
                    <TD className="whitespace-nowrap text-ink-soft" title={formatDateTime(visitor.last_seen)}>
                      {formatAgo(visitor.last_seen)}
                    </TD>
                    <TD className="text-right">
                      <Btn variant="subtle" onClick={() => setOpenId(visitor.visitor_id)}>
                        Open
                      </Btn>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>

      <VisitorDrawer id={openId} onClose={() => setOpenId(null)} onForget={forget} />
    </Page>
  );
}

function VisitorDrawer({ id, onClose, onForget }) {
  const { data, loading, error } = useFetch(`/admin/visitors/${id}`, { enabled: Boolean(id) });

  return (
    <Drawer
      open={Boolean(id)}
      title="Visitor"
      lead={id ? `Id ${id.slice(0, 12)}` : undefined}
      onClose={onClose}
      footer={
        <ConfirmBtn
          onConfirm={() => onForget(id)}
          label="Erase this visitor"
          confirmLabel="Really erase everything?"
        />
      }
    >
      {loading && <Loading />}
      {error && <Alert tone="error">{error}</Alert>}

      {data && (
        <div className="space-y-6">
          <dl className="grid grid-cols-2 gap-4">
            <Fact label="First seen" value={formatDateTime(data.visitor.first_seen)} />
            <Fact label="Last seen" value={formatDateTime(data.visitor.last_seen)} />
            <Fact label="Device" value={`${data.visitor.device} · ${data.visitor.browser}`} />
            <Fact label="Came from" value={data.visitor.referrer || "Direct"} />
            <Fact label="Visits" value={formatNumber(data.visitor.sessions)} />
            <Fact label="Pages read" value={formatNumber(data.visitor.pageviews)} />
          </dl>

          {(data.submissions.students.length > 0 || data.submissions.enquiries.length > 0) && (
            <section>
              <h3 className="eyebrow text-ink-soft">What they sent</h3>
              <ul className="mt-3 space-y-2">
                {[...data.submissions.students, ...data.submissions.enquiries].map((item) => (
                  <li key={`${item.id}-${item.name}`} className="rounded-xl border border-signal/30 bg-signal/8 px-4 py-3">
                    <p className="font-semibold text-ink">{item.name}</p>
                    <p className="mt-0.5 text-[0.8125rem] text-ink-soft">
                      {item.phone} {item.email && `· ${item.email}`}
                    </p>
                    {item.message && (
                      <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-soft">{item.message}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className="eyebrow text-ink-soft">Visits</h3>
            <ul className="mt-3 space-y-2">
              {data.sessions.map((session) => (
                <li key={session.session_id} className="rounded-xl border border-rule bg-white/60 px-4 py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-[0.875rem] font-semibold text-ink">
                      {formatDateTime(session.started_at)}
                    </p>
                    <Badge tone={session.engaged ? "good" : "neutral"}>
                      {session.engaged ? "Engaged" : "Glanced"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[0.8125rem] text-ink-soft">
                    {session.pageviews} {session.pageviews === 1 ? "page" : "pages"} ·{" "}
                    {formatDuration(session.duration_ms)} · {session.events}{" "}
                    {session.events === 1 ? "action" : "actions"}
                    {session.screen && ` · ${session.screen}`}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="eyebrow text-ink-soft">Pages, most recent first</h3>
            <ul className="mt-3 divide-y divide-rule/60">
              {data.pageviews.map((view) => (
                <li key={view.id} className="flex items-baseline justify-between gap-3 py-2">
                  <span className="min-w-0 truncate text-[0.875rem] text-ink">{view.path}</span>
                  <span className="shrink-0 text-[0.8125rem] text-ink-soft">
                    {view.duration_ms > 0 && `${formatDuration(view.duration_ms)} · `}
                    {formatAgo(view.created_at)}
                  </span>
                </li>
              ))}
              {data.pageviews.length === 0 && (
                <li className="py-2 text-[0.875rem] text-ink-soft">None recorded.</li>
              )}
            </ul>
          </section>

          <section>
            <h3 className="eyebrow text-ink-soft">What they did</h3>
            <ul className="mt-3 divide-y divide-rule/60">
              {data.events.map((event) => (
                <li key={event.id} className="py-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[0.875rem] font-semibold text-ink">{event.name}</span>
                    <span className="shrink-0 text-[0.8125rem] text-ink-soft">
                      {formatAgo(event.created_at)}
                    </span>
                  </div>
                  <p className="text-[0.8125rem] text-ink-soft">
                    {event.path}
                    {Object.keys(event.meta ?? {}).length > 0 &&
                      ` · ${Object.entries(event.meta)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ")}`}
                  </p>
                </li>
              ))}
              {data.events.length === 0 && (
                <li className="py-2 text-[0.875rem] text-ink-soft">Nothing recorded.</li>
              )}
            </ul>
          </section>
        </div>
      )}
    </Drawer>
  );
}

function Fact({ label, value }) {
  return (
    <div>
      <dt className="eyebrow text-ink-soft">{label}</dt>
      <dd className="mt-1 truncate text-[0.875rem] font-semibold text-ink" title={value}>
        {value}
      </dd>
    </div>
  );
}
