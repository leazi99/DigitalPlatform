/**
 * The page's signature mark: the flyer's node-network redrawn as a plotted
 * growth curve. Nodes are the six services; the line is what they add up to.
 * Draws itself in on load, and is already drawn when motion is reduced.
 */
const NODES = [
  { x: 40, y: 300 },
  { x: 118, y: 246 },
  { x: 196, y: 262 },
  { x: 274, y: 172 },
  { x: 352, y: 196 },
  { x: 424, y: 66 },
];

const LINE = "M40 300 C 80 288, 92 250, 118 246 S 176 276, 196 262 S 250 186, 274 172 S 330 208, 352 196 S 404 108, 424 66";

export default function GrowthCurve({ className = "" }) {
  return (
    <svg
      viewBox="0 0 464 340"
      fill="none"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* y-axis gradations, the same device the page bands sit on */}
      <g stroke="var(--color-rule)" strokeWidth="1">
        {[60, 120, 180, 240, 300].map((y) => (
          <line key={y} x1="16" y1={y} x2="448" y2={y} />
        ))}
      </g>

      <path
        d={`${LINE} L424 320 L40 320 Z`}
        fill="url(#curveFill)"
        className="curve-area"
      />
      <path
        d={LINE}
        stroke="var(--color-signal)"
        strokeWidth="3"
        strokeLinecap="round"
        className="curve-line"
      />

      {NODES.map((n, i) => (
        <g key={i} className="curve-node" style={{ animationDelay: `${850 + i * 90}ms` }}>
          <circle cx={n.x} cy={n.y} r="9" fill="var(--color-signal)" opacity="0.16" />
          <circle cx={n.x} cy={n.y} r="4.5" fill="var(--color-mist)" stroke="var(--color-signal)" strokeWidth="2.5" />
        </g>
      ))}

      <defs>
        <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-signal)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--color-signal)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <style>{`
        .curve-line {
          stroke-dasharray: 720;
          stroke-dashoffset: 720;
          animation: draw 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.25s forwards;
        }
        .curve-area { opacity: 0; animation: fade 1.2s ease 1s forwards; }
        .curve-node { opacity: 0; animation: fade 0.45s ease forwards; }
        @keyframes draw { to { stroke-dashoffset: 0; } }
        @keyframes fade { to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .curve-line { stroke-dashoffset: 0; animation: none; }
          .curve-area, .curve-node { opacity: 1; animation: none; }
        }
      `}</style>
    </svg>
  );
}
