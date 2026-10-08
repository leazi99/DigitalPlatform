// The content the site renders before the API answers, and if it never does.
//
// It is built from `src/data/*.js` — the files that were the site's only
// content before there was a database, and which the database was seeded from.
// Arranged here into the exact shape `GET /api/content` returns, so a page
// section cannot tell which of the two it is reading.
//
// This is why the site does not go blank if the API is down: it falls back to
// the content it shipped with. Editing these files still changes that fallback,
// but it no longer changes the live site — the admin panel does that.

import { company, sectors, socials } from "../data/company";
import * as agencyData from "../data/agency";
import * as instituteData from "../data/institute";

export const fallbackContent = {
  company,
  sectors,
  socials,

  agency: {
    nav: agencyData.nav,
    hero: agencyData.hero,
    about: agencyData.about,
    contact: agencyData.contact,
    stats: agencyData.stats,
    services: agencyData.services,
    process: agencyData.process,
    testimonials: agencyData.testimonials,
    faq: { items: [] },
  },

  institute: {
    nav: instituteData.nav,
    hero: instituteData.hero,
    enrol: instituteData.enrol,
    batchesSection: instituteData.batchesSection,
    course: instituteData.course,
    outcomes: instituteData.outcomes,
    syllabus: instituteData.syllabus,
    audience: instituteData.audience,
    batches: instituteData.batches,
    faq: instituteData.faq,

    // The one shape that differs: the site now supports more than one
    // instructor, so the single instructor in the data file becomes a list of
    // one. The eyebrow and heading stay alongside it.
    instructor: {
      eyebrow: instituteData.instructor.eyebrow,
      heading: instituteData.instructor.heading,
      people: [
        {
          name: instituteData.instructor.name,
          role: instituteData.instructor.role,
          bio: instituteData.instructor.bio,
          points: instituteData.instructor.points,
        },
      ],
    },
  },
};
