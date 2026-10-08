// Composes the public site's content from the database.
//
// The shape returned here is deliberately identical to what `src/data/*.js`
// exported before there was a database, so the page sections did not have to
// be rewritten around a new data shape — and so those files remain a usable
// offline fallback if the API is down.

import { db, getSetting } from "./db.js";

const published = (table, extra = "") =>
  db.prepare(`SELECT * FROM ${table} WHERE published = 1 ${extra} ORDER BY position, id`).all();

const ordered = (table) => db.prepare(`SELECT * FROM ${table} ORDER BY position, id`).all();

function parseList(raw, fallback = []) {
  try {
    const parsed = JSON.parse(raw ?? "null");
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function buildContent() {
  const courses = published("courses");

  // The site is built around one course. The admin can keep several — a draft
  // of next year's, say — so the one shown is the first published course in
  // the ordering. The admin panel labels it, rather than leaving it a guess.
  const course = courses[0] ?? null;
  const courseId = course?.id ?? null;

  // A module or batch with no course attached belongs to whichever course is
  // live. That keeps the seeded content working and means a new module does
  // not vanish because its course was left blank.
  const belongsToLiveCourse = (row) => row.course_id === null || row.course_id === courseId;

  const modules = ordered("syllabus_modules").filter(belongsToLiveCourse);
  const batchRows = published("batches").filter(belongsToLiveCourse);
  const instructorRows = published("instructors");

  const faqRows = ordered("faqs");
  const statRows = ordered("stats");

  return {
    company: getSetting("company", {}),
    sectors: getSetting("sectors", {}),
    socials: getSetting("socials", []),

    agency: {
      nav: getSetting("agency.nav", []),
      hero: getSetting("agency.hero", {}),
      about: getSetting("agency.about", {}),
      contact: getSetting("agency.contact", {}),
      stats: statRows
        .filter((s) => s.sector === "agency")
        .map((s) => ({
          value: toNumber(s.value),
          suffix: s.suffix,
          label: s.label,
          decimals: s.decimals,
        })),
      services: {
        ...getSetting("agency.servicesIntro", {}),
        items: ordered("services").map((s) => ({ name: s.name, body: s.body, glyph: s.glyph })),
      },
      process: {
        ...getSetting("agency.processIntro", {}),
        steps: ordered("process_steps").map((s) => ({ title: s.title, body: s.body })),
      },
      testimonials: {
        ...getSetting("agency.testimonialsIntro", {}),
        items: published("testimonials").map((t) => ({
          quote: t.quote,
          name: t.name,
          role: t.role,
        })),
      },
      faq: {
        items: faqRows.filter((f) => f.sector === "agency").map((f) => ({ q: f.question, a: f.answer })),
      },
    },

    institute: {
      nav: getSetting("institute.nav", []),
      hero: getSetting("institute.hero", {}),
      enrol: getSetting("institute.enrol", {}),
      batchesSection: getSetting("institute.batchesSection", {}),

      course: course
        ? {
            id: course.id,
            title: course.title,
            duration: course.duration,
            format: course.format,
            mode: course.mode,
            fee: course.fee,
            instalments: course.instalments,
            seats: course.seats,
            certificate: course.certificate,
            language: course.language,
          }
        : null,

      outcomes: {
        ...getSetting("institute.outcomesIntro", {}),
        items: ordered("outcomes").map((o) => ({ title: o.title, body: o.body, glyph: o.glyph })),
      },
      syllabus: {
        ...getSetting("institute.syllabusIntro", {}),
        modules: modules.map((m) => ({
          number: m.number,
          title: m.title,
          body: m.body,
          topics: parseList(m.topics),
        })),
      },
      audience: {
        ...getSetting("institute.audienceIntro", {}),
        items: ordered("audience").map((a) => ({ title: a.title, body: a.body })),
      },
      batches: batchRows.map((b) => ({
        id: b.id,
        name: b.name,
        starts: b.starts,
        timing: b.timing,
        seats: b.seats,
        status: b.status,
      })),
      instructor: {
        ...getSetting("institute.instructorIntro", {}),
        people: instructorRows.map((i) => ({
          id: i.id,
          name: i.name,
          role: i.role,
          bio: parseList(i.bio),
          points: parseList(i.points),
        })),
      },
      faq: {
        ...getSetting("institute.faqIntro", {}),
        items: faqRows
          .filter((f) => f.sector === "institute")
          .map((f) => ({ q: f.question, a: f.answer })),
      },
    },
  };
}

/** Stats count up, so their value has to be a number. An admin who types
 *  "forty" gets 0 rather than a crashed page. */
function toNumber(value) {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/** The settings keys the admin panel may write, with the form each one gets.
 *  Anything not listed here cannot be written through the settings endpoint. */
export const settingsSchema = {
  company: {
    label: "Company details",
    group: "Shared",
    fields: [
      { name: "name", label: "Legal name", type: "text" },
      { name: "short", label: "Short name", type: "text" },
      { name: "tagline", label: "Tagline", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "address", label: "Address", type: "text" },
      { name: "hours", label: "Opening hours", type: "text" },
    ],
  },
  socials: {
    label: "Social profiles",
    group: "Shared",
    list: true,
    fields: [
      { name: "label", label: "Network", type: "text" },
      { name: "href", label: "URL", type: "text" },
    ],
  },
  sectors: {
    label: "Landing page doors",
    group: "Shared",
    map: ["agency", "institute"],
    fields: [
      { name: "suffix", label: "Wordmark suffix", type: "text" },
      { name: "label", label: "Label", type: "text" },
      { name: "blurb", label: "Blurb", type: "long" },
      { name: "forWhom", label: "Who it is for", type: "text" },
    ],
  },

  "agency.nav": { label: "Agency nav", group: "Agency", list: true, fields: NAV_FIELDS() },
  "agency.hero": { label: "Agency hero", group: "Agency", fields: HERO_FIELDS() },
  "agency.about": {
    label: "Agency about",
    group: "Agency",
    fields: [
      ...INTRO_FIELDS(),
      { name: "body", label: "Paragraphs", type: "lines" },
      {
        name: "points",
        label: "Points",
        type: "objects",
        fields: [
          { name: "title", label: "Title", type: "text" },
          { name: "body", label: "Body", type: "long" },
        ],
      },
    ],
  },
  "agency.servicesIntro": { label: "Services heading", group: "Agency", fields: INTRO_FIELDS() },
  "agency.processIntro": { label: "Process heading", group: "Agency", fields: INTRO_FIELDS() },
  "agency.testimonialsIntro": {
    label: "Testimonials heading",
    group: "Agency",
    fields: INTRO_FIELDS(),
  },
  "agency.contact": { label: "Contact heading", group: "Agency", fields: INTRO_FIELDS() },

  "institute.nav": { label: "Academy nav", group: "Academy", list: true, fields: NAV_FIELDS() },
  "institute.hero": { label: "Academy hero", group: "Academy", fields: HERO_FIELDS() },
  "institute.outcomesIntro": { label: "Outcomes heading", group: "Academy", fields: INTRO_FIELDS() },
  "institute.syllabusIntro": { label: "Syllabus heading", group: "Academy", fields: INTRO_FIELDS() },
  "institute.audienceIntro": { label: "Audience heading", group: "Academy", fields: INTRO_FIELDS() },
  "institute.batchesSection": {
    label: "Batches section",
    group: "Academy",
    fields: [
      ...INTRO_FIELDS(),
      { name: "emptyHeading", label: "Heading when no batch is scheduled", type: "text" },
      { name: "emptyBody", label: "Body when no batch is scheduled", type: "long" },
    ],
  },
  "institute.instructorIntro": {
    label: "Instructor heading",
    group: "Academy",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "heading", label: "Heading", type: "text" },
    ],
  },
  "institute.faqIntro": { label: "FAQ heading", group: "Academy", fields: INTRO_FIELDS() },
  "institute.enrol": { label: "Enrol heading", group: "Academy", fields: INTRO_FIELDS() },
};

function INTRO_FIELDS() {
  return [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "heading", label: "Heading", type: "text" },
    { name: "lead", label: "Lead paragraph", type: "long" },
  ];
}

function NAV_FIELDS() {
  return [
    { name: "label", label: "Label", type: "text" },
    { name: "href", label: "Anchor", type: "text" },
  ];
}

function HERO_FIELDS() {
  return [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "lines", label: "Headline lines", type: "lines" },
    { name: "lead", label: "Lead paragraph", type: "long" },
    {
      name: "primaryCta",
      label: "Primary button",
      type: "object",
      fields: [
        { name: "label", label: "Label", type: "text" },
        { name: "href", label: "Link", type: "text" },
      ],
    },
    {
      name: "secondaryCta",
      label: "Secondary button",
      type: "object",
      fields: [
        { name: "label", label: "Label", type: "text" },
        { name: "href", label: "Link", type: "text" },
      ],
    },
    {
      name: "ticks",
      label: "Micro-stats",
      type: "objects",
      fields: [
        { name: "value", label: "Value", type: "text" },
        { name: "label", label: "Label", type: "text" },
      ],
    },
  ];
}
