// ─────────────────────────────────────────────────────────────────────────────
// INTRO page copy — everything on /, the page a visitor lands on before the
// two-doors page at /home.
//
// Lines marked REPLACE are placeholders written to make the layout readable.
// ─────────────────────────────────────────────────────────────────────────────

export const intro = {
  eyebrow: "Kathmandu, Nepal",
  headline: "Grow your business and skills through digital marketing.",
  lead: "We run digital marketing for businesses, and we teach it to the people who want to do it themselves.",
  cta: { label: "See our services", href: "/home" },

  // The animated poster. Drop the file into /public and name it here, e.g.
  // "/intro-poster.mp4" (video) or "/intro-poster.gif" (image). Left empty,
  // the page draws its own animated banner instead.
  poster: "", // REPLACE — the animated poster shared in the group

  sections: [
    {
      title: "What is Digital World?",
      body: "A digital marketing company with two sides: an agency that runs social, search and paid campaigns for businesses, and an academy that teaches people to run those campaigns themselves.",
    },
    {
      title: "Who are we?",
      body: "A Kathmandu team of working digital marketers — designers, ad specialists and trainers — who treat every client and every student as a long-term partner.",
    },
    {
      title: "How do we work?",
      body: "For businesses: audit, strategy, execution and a monthly report on what each campaign returned. For learners: a three-month, hands-on course built on real campaigns.",
    },
    {
      title: "Who can benefit?",
      body: "Business owners and startups who want more customers, and students, freelancers and career changers who want a skill they can be paid for.",
    },
  ],
};
