// ─────────────────────────────────────────────────────────────────────────────
// AGENCY sector copy — everything on /agency.
// Shared details (name, email, phone, socials) live in ./company.js.
//
// Lines marked REPLACE are placeholders written to make the layout readable.
// They are not real figures or real clients — swap them before going live.
// ─────────────────────────────────────────────────────────────────────────────

export const nav = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Clients", href: "#clients" },
  { label: "Contact", href: "#contact" },
];

export const hero = {
  eyebrow: "Digital marketing agency",
  lines: ["Digital", "Marketing", "Agency"],
  lead: "We run the social, search and paid campaigns that bring customers to your business — and we show you exactly what each one returned.",
  primaryCta: { label: "Get a free audit", href: "#contact" },
  secondaryCta: { label: "See what we do", href: "#services" },
  // REPLACE — all three figures below
  ticks: [
    { value: "6", label: "channels covered" },
    { value: "1", label: "point of contact" },
    { value: "14 days", label: "to first report" },
  ],
};

// REPLACE — every number in this band
export const stats = [
  { value: 40, suffix: "+", label: "Campaigns delivered" },
  { value: 25, suffix: "+", label: "Businesses served" },
  { value: 3.4, suffix: "x", label: "Median return on ad spend", decimals: 1 },
  { value: 14, suffix: " days", label: "From kickoff to first report" },
];

export const about = {
  eyebrow: "Who we are",
  heading: "A small team that treats your ad budget like our own.",
  body: [
    "Digital World Pvt.Ltd is a digital marketing agency working with shops, clinics, schools and service businesses that want more customers without hiring a full marketing department.",
    "You get one point of contact, a plan written in plain language, and a monthly report that says what we spent, what it earned, and what changes next month.",
  ],
  points: [
    {
      title: "One partner, every channel",
      body: "Social, search, and paid all planned together, so your budget is not split across agencies that never talk.",
    },
    {
      title: "Reporting you can read",
      body: "No dashboard homework. A monthly summary in plain sentences, with the raw numbers attached if you want them.",
    },
    {
      title: "Month-to-month",
      body: "No long lock-in. We keep the work by earning it, which keeps our attention where it belongs.",
    },
  ],
};

export const services = {
  eyebrow: "Services",
  heading: "Six ways we bring you customers.",
  lead: "Start with one channel or hand us the whole plan. Each is priced and reported separately, so you always know what is working.",
  items: [
    {
      name: "Social media management",
      body: "Content calendar, posting, and community replies across Facebook, Instagram and TikTok.",
      glyph: "social",
    },
    {
      name: "SEO and content marketing",
      body: "Rank for what your customers actually search, with pages and articles built to answer them.",
      glyph: "search",
    },
    {
      name: "Facebook and Instagram ads",
      body: "Creative, audiences and daily budget management on Meta, tuned against real conversions.",
      glyph: "meta",
    },
    {
      name: "Google Ads",
      body: "Search and shopping campaigns that put you in front of people already looking to buy.",
      glyph: "google",
    },
    {
      name: "Pay-per-click advertising",
      body: "Keyword bidding, landing pages and negative lists — managed so you pay for clicks that convert.",
      glyph: "click",
    },
    {
      name: "Business growth strategy",
      body: "Offer, pricing and funnel review before we spend a rupee, so the ads have something to sell.",
      glyph: "growth",
    },
  ],
};

export const process = {
  eyebrow: "How we work",
  heading: "Four steps, then it repeats.",
  steps: [
    {
      title: "Audit",
      body: "We look at your current channels, competitors and numbers, and tell you where the gap is. Free, and yours to keep.",
    },
    {
      title: "Strategy",
      body: "A written plan: which channels, what budget, what we expect each to return, and how we will know.",
    },
    {
      title: "Execute",
      body: "Creative, copy and campaigns go live. We manage bids and content daily, not once a month.",
    },
    {
      title: "Report",
      body: "A monthly summary of spend, results and what changes next. Then step two again, with better data.",
    },
  ],
};

// REPLACE — all three testimonials, names and companies are placeholders
export const testimonials = {
  eyebrow: "Clients",
  heading: "What working with us sounds like.",
  items: [
    {
      quote:
        "They rebuilt our Instagram from scratch and started answering enquiries the same day. Walk-ins went up within the first month.",
      name: "Placeholder Name",
      role: "Owner, Placeholder Retail",
    },
    {
      quote:
        "The monthly report is the part I did not expect. I finally know which ad brought which booking, and I can plan around it.",
      name: "Placeholder Name",
      role: "Director, Placeholder Clinic",
    },
    {
      quote:
        "We had run Google Ads before and burned the budget. Same budget here, roughly triple the leads.",
      name: "Placeholder Name",
      role: "Manager, Placeholder Services",
    },
  ],
};

export const contact = {
  eyebrow: "Contact",
  heading: "Tell us what you sell. We will tell you where the customers are.",
  lead: "Send the form and we will reply within one working day with a free audit of your current channels.",
};
