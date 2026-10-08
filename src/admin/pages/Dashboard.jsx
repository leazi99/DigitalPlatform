import { useState } from "react";
import { Link } from "react-router-dom";
import { DailyChart, RankBars } from "../Chart";
import { useFetch } from "../useAdmin";
import {
  Alert,
  Btn,
  Card,
  Loading,
  Page,
  Stat,
  TD,
  TH,
  Table,
} from "../ui";
import {
  formatDuration,
  formatNumber,
} from "../format";

const RANGES = [
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
];

/**
 * How many people came, and how many of them engaged.
 *
 * The date range sits above everything and scopes all of it, so no two figures
 * on the screen are ever measured over different periods.
 */
export default function Dashboard() {
  const [days, setDays] = useState(30);
  const { data, loading, error } = useFetch(`/admin/analytics/overview?days=${days}`);
  const { data: summary } = useFetch("/admin/summary");

  const totals = data?.totals;

  return (
    <Page
      title="Dashboard"
      lead="Who visited the website, what they looked at, and how many of them did something."
    >
      <div className="space-y-5">
        {/* Filters: one row, above everything they scope. */}
        <div className="flex flex-wrap items-center gap-2">
          {RANGES.map((range) => (
            <Btn
              key={range.days}
              variant={range.days === days ? "primary" : "subtle"}
              onClick={() => setDays(range.days)}
              aria-pressed={range.days === days}
            >
              {range.label}
            </Btn>
          ))}
          {loading && (
            <span className="ml-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-soft">
              Updating…
            </span>
          )}
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        {/* While a new range loads, the previous render is held at reduced
            opacity rather than replaced by a skeleton — no layout jump. */}
        <div className={loading && data ? "opacity-60 transition-opacity" : "transition-opacity"}>
          {!data && loading ? (
            <Card>
              <Loading label="Reading the visitor log…" />
            </Card>
          ) : (
            data && (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Stat
                    label="People"
                    value={formatNumber(totals.visitors)}
                    hint={`${formatNumber(totals.sessions)} visits · ${formatNumber(totals.newVisitors)} first-time`}
                  />
                  <Stat
                    label="Engaged"
                    tone="signal"
                    value={`${totals.engagementRate}%`}
                    hint={`${formatNumber(totals.engagedSessions)} of ${formatNumber(totals.sessions)} visits went past a glance`}
                  />
                  <Stat
                    label="Pages read"
                    value={formatNumber(totals.pageviews)}
                    hint={`${formatDuration(totals.avgDurationSec * 1000)} on the site per visit`}
                  />
                  <Stat
                    label="Got in touch"
                    tone="signal"
                    value={formatNumber(totals.students + totals.enquiries)}
                    hint={`${formatNumber(totals.students)} seat requests · ${formatNumber(totals.enquiries)} agency enquiries`}
                  />
                </div>

                <Card className="overflow-hidden">
                  <DailyChart series={data.series} />
                  <DayTable series={data.series} />
                </Card>

                <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
                  <Card title="Most read pages" lead="Views over the period, and how long each held attention.">
                    <PageTable rows={data.topPages} />
                  </Card>

                  <Card title="Where they came from" lead="The site that sent them, by visit.">
                    <RankBars
                      rows={data.topReferrers}
                      labelKey="source"
                      valueKey="sessions"
                      emptyLabel="No visits recorded yet."
                    />
                  </Card>

                  <Card title="What they clicked" lead="Buttons pressed, forms started, how far they scrolled.">
                    <RankBars
                      rows={data.topEvents}
                      labelKey="name"
                      valueKey="count"
                      emptyLabel="No actions recorded yet."
                    />
                  </Card>

                  <Card title="What they used" lead="Visits by device, then by browser.">
                    <RankBars
                      rows={data.devices}
                      labelKey="name"
                      valueKey="sessions"
                      emptyLabel="No visits recorded yet."
                    />
                    {data.browsers.length > 0 && (
                      <div className="border-t border-rule">
                        <RankBars
                          rows={data.browsers}
                          labelKey="name"
                          valueKey="sessions"
                          emptyLabel=""
                        />
                      </div>
                    )}
                  </Card>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                  <Card title="What these numbers mean">
                    <div className="space-y-3 px-5 py-4 text-[0.875rem] leading-relaxed text-ink-soft sm:px-6">
                      <p>
                        <strong className="font-semibold text-ink">A visit</strong> is one browser
                        session. It ends after thirty minutes of inactivity, so the same person
                        returning tomorrow counts as a second visit and one person.
                      </p>
                      <p>
                        <strong className="font-semibold text-ink">Engaged</strong> means{" "}
                        {data.engagedDefinition.toLowerCase()} Opening the page and leaving does not
                        count — that is the difference this figure exists to show.
                      </p>
                      <p>
                        Visitors whose browser asks not to be tracked are not recorded at all, and
                        neither are obvious bots. These figures are therefore a slight undercount
                        rather than every request the server saw.
                      </p>
                      <p>
                        No IP addresses, cookies or third-party scripts are involved. A visitor is a
                        random id their own browser stores and can clear.
                      </p>
                    </div>
                  </Card>

                  <Card title="Right now">
                    <div className="px-5 py-4 sm:px-6">
                      <p className="font-display text-4xl font-black tracking-tight text-ink">
                        {formatNumber(summary?.live?.visitors ?? 0)}
                      </p>
                      <p className="mt-1 text-[0.875rem] text-ink-soft">
                        {(summary?.live?.visitors ?? 0) === 1 ? "person" : "people"} on the site in
                        the last five minutes
                      </p>

                      {summary?.live?.paths?.length > 0 && (
                        <ul className="mt-4 space-y-1.5 border-t border-rule pt-4">
                          {summary.live.paths.map((row) => (
                            <li key={row.path} className="flex justify-between gap-3 text-[0.8125rem]">
                              <span className="truncate text-ink">{row.path}</span>
                              <span className="shrink-0 text-ink-soft">{row.views}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="mt-5 flex flex-wrap gap-2 border-t border-rule pt-4">
                        <Btn as={Link} to="/admin/visitors" variant="subtle">
                          Every visitor
                        </Btn>
                        <Btn as={Link} to="/admin/students" variant="subtle">
                          Seat requests
                        </Btn>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </Page>
  );
}

/** The chart's figures as a table. Collapsed by default, but present — the
 *  chart's hover is a convenience, not the only way to read the data. */
function DayTable({ series }) {
  const [open, setOpen] = useState(false);
  const withVisits = series.filter((day) => day.sessions > 0);

  return (
    <div className="border-t border-rule">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-3 text-left text-[0.8125rem] font-semibold text-ink hover:bg-white/60 sm:px-6"
      >
        {open ? "Hide the day-by-day figures" : "Show the day-by-day figures"}
        <span aria-hidden="true" className="text-ink-soft">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <>
          {withVisits.length === 0 ? (
            <p className="px-5 pb-5 text-[0.875rem] text-ink-soft sm:px-6">
              No visits in this period.
            </p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <TH>Day</TH>
                  <TH className="text-right">People</TH>
                  <TH className="text-right">Visits</TH>
                  <TH className="text-right">Engaged</TH>
                  <TH className="text-right">Pages</TH>
                </tr>
              </thead>
              <tbody>
                {[...withVisits].reverse().map((day) => (
                  <tr key={day.day}>
                    <TD>{day.day}</TD>
                    <TD className="text-right [font-variant-numeric:tabular-nums]">{day.visitors}</TD>
                    <TD className="text-right [font-variant-numeric:tabular-nums]">{day.sessions}</TD>
                    <TD className="text-right [font-variant-numeric:tabular-nums]">{day.engaged}</TD>
                    <TD className="text-right [font-variant-numeric:tabular-nums]">{day.pageviews}</TD>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </div>
  );
}

function PageTable({ rows }) {
  if (!rows || rows.length === 0) {
    return <p className="px-5 py-10 text-center text-[0.875rem] text-ink-soft sm:px-6">No page views recorded yet.</p>;
  }

  return (
    <Table minWidth="min-w-[26rem]">
      <thead>
        <tr>
          <TH>Page</TH>
          <TH className="text-right">Views</TH>
          <TH className="text-right">People</TH>
          <TH className="text-right">Time on page</TH>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.path}>
            <TD className="max-w-[16rem] truncate text-ink">{row.path}</TD>
            <TD className="text-right [font-variant-numeric:tabular-nums]">{formatNumber(row.views)}</TD>
            <TD className="text-right [font-variant-numeric:tabular-nums]">{formatNumber(row.visitors)}</TD>
            <TD className="text-right text-ink-soft [font-variant-numeric:tabular-nums]">
              {row.avg_duration_ms > 0 ? formatDuration(row.avg_duration_ms) : "—"}
            </TD>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
