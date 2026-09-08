// ─────────────────────────────────────────────────────────────────────────────
// Details shared by BOTH sectors — the agency and the academy.
// Change a phone number here and it updates everywhere on the site.
//
// Lines marked REPLACE are placeholders written to make the layout readable.
// Swap them for verified details before this site goes live.
// ─────────────────────────────────────────────────────────────────────────────

export const company = {
  name: "Digital World Pvt.Ltd",
  short: "Digital World",
  tagline: "One and only your digital partner",
  email: "dworld9622@gmail.com",
  phone: "+977 98XX-XXXXXX", // REPLACE — real phone number
  address: "Kathmandu, Nepal", // REPLACE — real street address
  hours: "Sun–Fri, 10am – 6pm", // REPLACE — real opening hours
};

// The two sectors. Used by the landing page and the header switcher.
export const sectors = {
  agency: {
    key: "agency",
    path: "/agency",
    suffix: "Agency",
    label: "Digital Marketing Agency",
    blurb: "We run your social, search and paid campaigns — and show you what each one returned.",
    forWhom: "For business owners who want more customers.",
    cta: { label: "Get a free audit", href: "/agency#contact" },
  },
  institute: {
    key: "institute",
    path: "/institute",
    suffix: "Academy",
    label: "Digital Marketing Institute",
    blurb: "A three-month course that takes you from zero to running real campaigns for real budgets.",
    forWhom: "For students and career changers who want the skill.",
    cta: { label: "See the course", href: "/institute#syllabus" },
  },
};

// REPLACE — real profile URLs
export const socials = [
  { label: "Facebook", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
];
