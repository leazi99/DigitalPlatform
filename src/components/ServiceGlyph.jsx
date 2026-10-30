/**
 * One line-drawn mark per service, all built from the same vocabulary as the
 * hero curve: nodes, connections and a rising line.
 */
const paths = {
  social: (
    <>
      <circle cx="7" cy="8" r="3" />
      <circle cx="17" cy="5" r="2.5" />
      <circle cx="16" cy="17" r="3" />
      <path d="M9.6 9.2 L13.6 15.4M9.4 6.6 L14.6 5.4" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15 L20 20M8 10.5h5M10.5 8v5" />
    </>
  ),
  meta: (
    <>
      <path d="M3 16c2.5-8 5.5-8 8 0s5.5 8 8 0" />
      <circle cx="19" cy="7" r="2" />
    </>
  ),
  google: (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 12h7M12 5v7" />
    </>
  ),
  click: (
    <>
      <path d="M6 4 L6 17 L9.5 13.5 L12 19 L14.5 18 L12 12.5 L17 12 Z" />
      <path d="M17 5.5 L19.5 3M20 9h3M14 3.5V1" />
    </>
  ),
  growth: (
    <>
      <path d="M4 18 L10 12 L14 15 L20 6" />
      <path d="M15 6h5v5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M15.5 8.5 L13.4 13.4 L8.5 15.5 L10.6 10.6 Z" />
    </>
  ),
  pen: (
    <>
      <path d="M15 4.5 L19.5 9 L9 19.5 L4 20 L4.5 15 Z" />
      <path d="M13 6.5 L17.5 11M13 20h7" />
    </>
  ),
  spark: (
    <>
      <path d="M10 3.5 C10.6 8 12 9.4 16.5 10 C12 10.6 10.6 12 10 16.5 C9.4 12 8 10.6 3.5 10 C8 9.4 9.4 8 10 3.5 Z" />
      <path d="M18 14.5v5M15.5 17h5" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v16h16" />
      <path d="M8 16v-4M12 16V9M16 16v-7" />
    </>
  ),
};

export default function ServiceGlyph({ name, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[name] ?? paths.growth}
    </svg>
  );
}
