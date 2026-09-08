# Two-sector platform — design

**Date:** 2026-08-24
**Project:** DigitalPlatform (Digital World Pvt.Ltd)
**Status:** approved design, awaiting implementation plan

## Problem

The site today is a single scrolling page selling one thing: a digital
marketing agency. The business has two sectors — the agency and a digital
marketing institute — and the institute has no presence at all. One page
cannot sell two offerings to two audiences (business owners buying
campaigns, and students buying a course) without one crowding the other.

## Decisions taken

| Question | Decision |
|---|---|
| Structure | Brand landing page splitting into two routes |
| Institute offering | One flagship course, sold as a single enrolment |
| Branding | Sub-brand: same logo, typefaces and cyan accent; wordmark suffix distinguishes the sectors |
| Forms | Both wired to Formspree through one shared helper |
| Routing | `react-router-dom` — real URLs, with host rewrite configs |

Rejected: a single page with an institute band appended (two audiences on
one page); a course catalogue (the business sells one programme); a
distinct institute brand (doubles brand work, no name available); hash
routing and Vite multi-page builds (see Routing below).

## Architecture

### Routes

```
/            AppShell -> LandingPage    brand splash, two doors
/agency      AppShell -> AgencyPage     current page, content unchanged
/institute   AppShell -> InstitutePage  new
*            NotFound -> redirect to /
```

`AppShell` owns `Header` and `Footer` and renders an `<Outlet />`. The
header is sector-aware: it derives the active sector from the route and
swaps three things — the nav links, the primary CTA
(`Get a free audit` / `Enrol now`), and the wordmark suffix
(`Agency` / `Academy`). On `/` it renders the logo alone, with no nav and
no CTA.

Anchor links inside a sector page keep working as they do now
(`#services`, `#contact`); `scroll-padding-top` in `index.css` already
accounts for the fixed header. Cross-sector links are route links.

### Routing choice

`react-router-dom` gives clean, indexable URLs. The site's own product is
SEO, so `#/institute` (hash routing) and its weaker crawlability is the
wrong trade for a ~15kb dependency. A Vite multi-page build would also
give real URLs but forces a full page reload between sectors and
duplicates the shell across entries.

Cost of the choice: static hosts must rewrite unknown paths to
`index.html`, or a refresh on `/institute` 404s. Implementation adds
`public/_redirects` (Netlify), `vercel.json` (Vercel) and a documented
nginx `try_files` snippet in the README, so the site is deployable
wherever it lands.

Routes are lazily loaded (`React.lazy` + `Suspense`) so a visitor to one
sector does not download the other.

### File layout

```
src/
  App.jsx                  router definition only
  config.js                env-derived form endpoints
  lib/
    submitEnquiry.js       shared form POST helper
  data/
    company.js             shared: name, email, phone, address, socials
    agency.js              current site.js content, agency-specific
    institute.js           new: course, syllabus, batches, instructor, FAQ
  layouts/
    AppShell.jsx           header + outlet + footer
  pages/
    LandingPage.jsx
    AgencyPage.jsx         assembles src/sections/agency/*
    InstitutePage.jsx      assembles src/sections/institute/*
    NotFound.jsx
  sections/
    agency/                existing section files, moved verbatim
    institute/             new section files
  components/              unchanged, shared by both sectors
```

Existing section files move into `sections/agency/` with their content
untouched; only import paths change. `src/data/site.js` is deleted, its
contents distributed across the three new data files with no copy
rewritten.

### Data model

`src/data/company.js` holds what both sectors share, so contact details
live in exactly one place:

```js
export const company = { name, short, tagline, email, phone, address, hours };
export const socials = [...];
```

`src/data/agency.js` holds `nav`, `hero`, `stats`, `about`, `services`,
`process`, `testimonials`, `contact` — moved verbatim from `site.js`,
including their existing `REPLACE` markers.

`src/data/institute.js` is new:

```js
export const nav = [...];                 // institute nav links
export const hero = {...};                // course name, duration, next batch, CTAs
export const course = {                   // the single flagship programme
  title, duration, format, fee, seats, certificate,
};
export const outcomes = [...];            // what a graduate can do
export const syllabus = [                 // six modules
  { module, title, body, topics: [...] },
];
export const audience = {...};            // who the course is for
export const batches = [...];             // date, timing, seats remaining
export const instructor = {...};          // name, role, bio
export const faq = [...];                 // question / answer pairs
export const enrol = {...};               // form headings and lead copy
```

Every invented value carries a `REPLACE` comment, matching the
convention already used in `site.js`.

### Institute page sections

Built from the existing shared components (`Container`, `Reveal`,
`SectionHeading`, `Counter`, `Button`, `useReveal`) so the institute
cannot drift visually from the agency.

1. `Hero` — course name, duration, next batch date, two CTAs
2. `Outcomes` — what a graduate will be able to do
3. `Syllabus` — six modules as an accordion, one open by default
4. `WhoItsFor` — the audiences the course suits
5. `Batches` — dates, timings, fee, seats
6. `Instructor` — who teaches it
7. `FAQ` — accordion, disclosure semantics
8. `Enrol` — the enrolment form

The accordions are keyboard-operable and use native `<details>`/`<summary>`
or buttons with `aria-expanded`; they respect the reduced-motion handling
already established in `useReveal`.

### Landing page

Deliberately thin: logo, the company tagline, and two large doors — one to
the agency, one to the academy — each with a one-line description of who
it is for. Reuses the gridline treatment from `index.css` so it reads as
the same site. No stats, no testimonials, no form.

### Forms

`src/lib/submitEnquiry.js` is the single network boundary:

```js
export async function submitEnquiry(values, endpoint)
// resolves on a 2xx; throws a typed error on a missing endpoint,
// a non-2xx response, or a network failure
```

`src/config.js` reads `VITE_FORMSPREE_AGENCY` and
`VITE_FORMSPREE_INSTITUTE` from the environment and exposes them as
`formEndpoints.agency` / `formEndpoints.institute`.

Both `sections/agency/Contact.jsx` and `sections/institute/Enrol.jsx`
keep their own field sets and client-side validation, and both call
`submitEnquiry` with their own endpoint. Each form handles three states:
submitting (button disabled, label changes), error (a message with the
`mailto:` and phone as a fallback route), and success (the existing
success panel).

The institute form collects: name, phone, email, preferred batch, and an
optional message.

When an endpoint is unset, `submitEnquiry` throws a configuration error
rather than posting nowhere, so a misconfigured deploy is visible rather
than silent. A `.env.example` documents both variables.

### Documentation

`README.md` currently documents `src/data/site.js` as the single content
file and describes the contact form as unwired. Both statements become
false. The README is updated in the same change: the new data-file layout,
the routing and host-rewrite note, the two environment variables, and a
`REPLACE` table for `institute.js` matching the existing agency table.

## Blocking inputs needed from the user

1. Two Formspree form IDs — one per sector. Everything else can be built
   without them; the forms render and validate but cannot submit until
   they are set.
2. Real course details: fee, batch dates, timings, instructor name,
   certificate wording. Placeholders marked `REPLACE` stand in until then.

If batches are not yet scheduled, the `Batches` section reduces to a
"register interest" band rather than displaying invented dates. This is a
content decision the user makes when filling in `institute.js`; the
section supports an empty `batches` array by rendering that band.

## Testing and verification

- `npm run lint` (oxlint) clean
- `npm run build` clean
- Dev server: all three routes render; header nav, CTA and wordmark change
  per sector; anchor links scroll correctly within each sector page
- Hard refresh on `/institute` against the preview server confirms the
  rewrite configuration
- Both forms: validation errors, submit-in-flight state, an error path
  with an unset endpoint, and the success panel
- Keyboard pass over the syllabus and FAQ accordions and the mobile menu
- Reduced-motion preference honoured across the new sections

## Out of scope

Course catalogue or multiple courses; student login or payment; a CMS or
backend; blog; internship or placement pathway; changes to the agency
page's copy or design beyond the file move and the form wiring.
