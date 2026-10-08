import { useEffect, useRef, useState } from "react";
import {
  formatNumber,
} from "./format";

/**
 * The visits-per-day chart.
 *
 * Form: stacked columns, one per day. Height is the number of visits that day;
 * the filled part is the visits that engaged. That is a part-to-whole where one
 * part is the point, so the colour job is emphasis — the accent for engaged
 * visits, a recessive grey for the rest — rather than two competing hues.
 *
 * Every figure the hover reveals is also in the table underneath, so nothing is
 * reachable only by pointer.
 */

const ENGAGED = "#12a5ce"; // --color-signal
const REST = "#aac0cc"; // a recessive step of the rule family
const GRID = "#cbd9e0"; // --color-rule

const PADDING = { top: 16, right: 8, bottom: 26, left: 46 };
const HEIGHT = 260;

/** Renders at the container's real pixel width, so axis text is the size it
 *  says it is instead of being scaled down with the drawing on a phone. */
function useMeasure() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}

export function DailyChart({ series }) {
  const [ref, width] = useMeasure();
  const [hovered, setHovered] = useState(null);

  const days = series ?? [];
  const plotWidth = Math.max(0, width - PADDING.left - PADDING.right);
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const peak = Math.max(1, ...days.map((d) => d.sessions));
  const top = niceCeiling(peak);
  const ticks = [0, top / 4, top / 2, (top * 3) / 4, top];

  const band = days.length > 0 ? plotWidth / days.length : 0;
  const barWidth = Math.max(2, Math.min(24, band - 3));
  const scale = (value) => (value / top) * plotHeight;

  return (
    <figure className="m-0">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 sm:px-6">
        <figcaption className="text-[0.8125rem] text-ink-soft">
          Visits per day. The filled part of each column engaged.
        </figcaption>
        <Legend />
      </div>

      <div ref={ref} className="relative px-5 pb-2 sm:px-6">
        {width > 0 && days.length > 0 && (
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={`Visits per day for the last ${days.length} days. The table below lists every figure.`}
            className="block"
          >
            {/* Gridlines and the y scale. Hairline, solid, recessive. */}
            {ticks.map((tick) => {
              const y = PADDING.top + plotHeight - scale(tick);
              return (
                <g key={tick}>
                  <line
                    x1={PADDING.left}
                    x2={width - PADDING.right}
                    y1={y}
                    y2={y}
                    stroke={GRID}
                    strokeWidth="1"
                  />
                  <text
                    x={PADDING.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-[#3f5162] font-mono text-[10px] [font-variant-numeric:tabular-nums]"
                  >
                    {formatNumber(Math.round(tick))}
                  </text>
                </g>
              );
            })}

            {days.map((day, index) => {
              const x = PADDING.left + index * band + (band - barWidth) / 2;
              const total = day.sessions;
              const engaged = Math.min(day.engaged, total);
              const rest = Math.max(0, total - engaged);

              const engagedHeight = scale(engaged);
              const restHeight = scale(rest);
              const baseline = PADDING.top + plotHeight;
              const isHovered = hovered === index;

              return (
                <g
                  key={day.day}
                  tabIndex={0}
                  role="button"
                  aria-label={describe(day)}
                  onPointerEnter={() => setHovered(index)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                  className="cursor-default focus:outline-none"
                >
                  {/* The hit target is the whole column slot, not the painted
                      pixels — a one-visit day is three pixels tall. */}
                  <rect
                    x={PADDING.left + index * band}
                    y={PADDING.top}
                    width={Math.max(band, 6)}
                    height={plotHeight}
                    fill={isHovered ? "#0b1b2b" : "transparent"}
                    fillOpacity={isHovered ? 0.04 : 0}
                  />

                  {rest > 0 && (
                    <rect
                      x={x}
                      y={baseline - engagedHeight - restHeight}
                      width={barWidth}
                      // The 2px separator between the segments is the card
                      // showing through, not a stroke — negative space, so the
                      // chart gains no extra ink.
                      height={Math.max(1, restHeight - (engaged > 0 ? 2 : 0))}
                      rx="3"
                      fill={REST}
                      fillOpacity={isHovered ? 1 : 0.9}
                    />
                  )}

                  {engaged > 0 && (
                    <rect
                      x={x}
                      y={baseline - engagedHeight}
                      width={barWidth}
                      height={Math.max(1, engagedHeight)}
                      // Rounded at the data end only when it is the top of the
                      // column; square where the grey segment sits above it.
                      rx={rest > 0 ? 0 : 3}
                      fill={ENGAGED}
                    />
                  )}

                  {total === 0 && (
                    <rect x={x} y={baseline - 1} width={barWidth} height="1" fill={GRID} />
                  )}
                </g>
              );
            })}

            {/* Baseline, drawn over the bars so they sit on a clean line. */}
            <line
              x1={PADDING.left}
              x2={width - PADDING.right}
              y1={PADDING.top + plotHeight}
              y2={PADDING.top + plotHeight}
              stroke={GRID}
              strokeWidth="1"
            />

            {xLabels(days, 6).map(({ day, index }) => (
              <text
                key={day.day}
                x={PADDING.left + index * band + band / 2}
                y={HEIGHT - 8}
                textAnchor="middle"
                className="fill-[#3f5162] font-mono text-[10px]"
              >
                {shortDay(day.day)}
              </text>
            ))}
          </svg>
        )}

        {days.length === 0 && (
          <p className="py-16 text-center text-[0.875rem] text-ink-soft">
            No visits recorded for this period yet.
          </p>
        )}

        {hovered !== null && days[hovered] && (
          <Tooltip
            day={days[hovered]}
            left={PADDING.left + hovered * band + band / 2}
            containerWidth={width}
          />
        )}
      </div>

    </figure>
  );
}

function Legend() {
  return (
    <ul className="flex items-center gap-4">
      {[
        { label: "Engaged", color: ENGAGED },
        { label: "Visited only", color: REST },
      ].map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: item.color }}
          />
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink-soft">
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Tooltip({ day, left, containerWidth }) {
  // Keep the card inside the chart rather than letting it hang off the edge.
  const clamped = Math.min(Math.max(left, 90), Math.max(90, containerWidth - 90));

  return (
    <div
      className="pointer-events-none absolute top-2 z-10 w-44 -translate-x-1/2 rounded-xl border border-rule bg-white px-3 py-2.5 shadow-lg"
      style={{ left: clamped }}
    >
      <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink-soft">
        {longDay(day.day)}
      </p>
      <dl className="mt-2 space-y-1.5">
        <Row color={ENGAGED} label="Engaged" value={day.engaged} />
        <Row color={REST} label="Visits" value={day.sessions} />
        <Row label="People" value={day.visitors} />
        <Row label="Pages" value={day.pageviews} />
      </dl>
    </div>
  );
}

function Row({ color, label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="flex items-center gap-1.5 text-[0.75rem] text-ink-soft">
        {color ? (
          <span aria-hidden="true" className="h-0.5 w-3 rounded-full" style={{ backgroundColor: color }} />
        ) : (
          <span aria-hidden="true" className="w-3" />
        )}
        {label}
      </dt>
      <dd className="font-display text-[0.875rem] font-bold text-ink [font-variant-numeric:tabular-nums]">
        {formatNumber(value)}
      </dd>
    </div>
  );
}

/** A bar chart of horizontal rows — used for pages, referrers and devices.
 *  One series, so one colour and no legend: the card's title names it. */
export function RankBars({ rows, labelKey, valueKey, format = formatNumber, emptyLabel }) {
  const list = rows ?? [];
  const peak = Math.max(1, ...list.map((row) => Number(row[valueKey]) || 0));

  if (list.length === 0) {
    return <p className="px-5 py-10 text-center text-[0.875rem] text-ink-soft sm:px-6">{emptyLabel}</p>;
  }

  return (
    <ul className="divide-y divide-rule/60">
      {list.map((row) => {
        const value = Number(row[valueKey]) || 0;
        const label = String(row[labelKey] ?? "—");

        return (
          <li key={label} className="px-5 py-2.5 sm:px-6">
            <div className="flex items-baseline justify-between gap-4">
              <span className="min-w-0 truncate text-[0.875rem] text-ink" title={label}>
                {label}
              </span>
              <span className="shrink-0 font-display text-[0.875rem] font-bold text-ink [font-variant-numeric:tabular-nums]">
                {format(value)}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-rule/50">
              <div
                className="h-full rounded-full"
                style={{ width: `${(value / peak) * 100}%`, backgroundColor: ENGAGED }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Round the top of the scale up to something a person would choose, so the
 *  axis reads 0 / 5 / 10 rather than 0 / 3.25 / 6.5. */
function niceCeiling(value) {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 2.5, 5, 10]) {
    const candidate = step * magnitude;
    if (candidate >= value) return candidate;
  }
  return 10 * magnitude;
}

/** At most `count` date labels, evenly spaced, always including the last day. */
function xLabels(days, count) {
  if (days.length === 0) return [];
  const stride = Math.max(1, Math.ceil(days.length / count));
  const picked = [];
  for (let i = days.length - 1; i >= 0; i -= stride) picked.unshift({ day: days[i], index: i });
  return picked;
}

function shortDay(iso) {
  const date = new Date(`${iso}T00:00:00Z`);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", timeZone: "UTC" });
}

function longDay(iso) {
  const date = new Date(`${iso}T00:00:00Z`);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function describe(day) {
  return `${longDay(day.day)}: ${day.sessions} visits, ${day.engaged} engaged, ${day.visitors} people, ${day.pageviews} pages`;
}
