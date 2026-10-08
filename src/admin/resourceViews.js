// How each resource is presented: what the screen is called, what it explains,
// and which columns are worth a table column.
//
// Everything else — the form, the validation messages, the controls each field
// gets — comes from the server's field descriptions. This file is only about
// what a person needs to see to find the row they came for.

export const resourceViews = {
  courses: {
    title: "Courses",
    lead: "The course the academy page is built around. The first published course in this list is the one the website shows — the rest can be drafts of what comes next. Deleting a course deletes its syllabus modules too; unpublish it instead to take it off the site and keep both.",
    columns: ["title", "duration", "fee", "published"],
    primary: "title",
  },

  syllabus: {
    title: "Syllabus",
    lead: "The modules on the academy page, in the order they are taught. Each module's topics are the bullet list inside it.",
    columns: ["number", "title", "course_id", "topics"],
    primary: "title",
    filterLabels: { course_id: "Course" },
  },

  instructors: {
    title: "Instructors",
    lead: "Who teaches the course. Add more than one and the academy page shows a card for each.",
    columns: ["name", "role", "published"],
    primary: "name",
  },

  batches: {
    title: "Batches",
    lead: "The timings on offer. Unpublish a batch to take it off the website without losing its details — and if nothing is published, the page invites visitors to register interest instead of advertising dates that do not exist.",
    columns: ["name", "starts", "timing", "seats", "status", "published"],
    primary: "name",
    filterLabels: { course_id: "Course", status: "Status" },
  },

  faqs: {
    title: "Questions and answers",
    lead: "The FAQ accordion. Answers a visitor reads instead of phoning to ask.",
    columns: ["sector", "question"],
    primary: "question",
    filterLabels: { sector: "Sector" },
  },

  outcomes: {
    title: "Outcomes",
    lead: "What a student leaves the course with — the “what you leave with” band on the academy page.",
    columns: ["title", "glyph"],
    primary: "title",
  },

  audience: {
    title: "Who it is for",
    lead: "The groups the course is aimed at.",
    columns: ["title"],
    primary: "title",
  },

  services: {
    title: "Services",
    lead: "What the agency sells. These also fill the “what do you need help with?” dropdown on the contact form.",
    columns: ["name", "glyph"],
    primary: "name",
  },

  process: {
    title: "Process",
    lead: "The four steps of how the agency works. They are numbered on the page by their order here.",
    columns: ["title"],
    primary: "title",
  },

  testimonials: {
    title: "Testimonials",
    lead: "What clients say. Only publish a quote you actually have permission to use — an invented one is a real problem, not a cosmetic one.",
    columns: ["name", "role", "published"],
    primary: "quote",
  },

  stats: {
    title: "Statistics",
    lead: "The big numbers in the dark band. The value counts up on the page, so it has to be a number — put any wording in the suffix.",
    columns: ["sector", "value", "suffix", "label"],
    primary: "label",
    filterLabels: { sector: "Sector" },
  },
};

/** The order the content screens appear in the sidebar. */
export const contentOrder = {
  Academy: ["courses", "syllabus", "batches", "instructors", "outcomes", "audience", "faqs"],
  Agency: ["services", "process", "testimonials", "stats"],
};
