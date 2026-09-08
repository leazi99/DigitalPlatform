# Digital World Pvt.Ltd — website

Two sectors on one site, built with Vite + React + Tailwind CSS v4. No backend.

```
/            brand landing — two doors
/agency      Digital World Agency    — the marketing agency
/institute   Digital World Academy   — the digital marketing course
```

Same logo, typefaces and cyan accent throughout; the wordmark suffix
(`Agency` / `Academy`) and the nav are what tell a visitor which side they
are on. The header carries a persistent link to the other sector.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production files in dist/
npm run preview  # serve the built files locally
npm run lint
```

## Editing the content

All copy lives in three files under `src/data/`. Nothing else needs touching
for a normal content update.

| File | What it holds |
|---|---|
| `company.js` | Name, email, phone, address, hours, socials, the two sector definitions. **Shared by both sectors** — change a phone number here and it updates everywhere. |
| `agency.js` | Everything on `/agency`: hero, stats, about, services, process, testimonials, contact. |
| `institute.js` | Everything on `/institute`: the course, syllabus, batches, instructor, FAQ, enrolment. |

### Placeholders to replace before going live

Every line below is invented copy written to make the layout readable. None of
it is a verified figure, a real client, or a real course detail. Each one is
marked `REPLACE` in the data files.

**`company.js`**

| What | Where |
|---|---|
| Phone number, street address, opening hours | `company.phone`, `company.address`, `company.hours` |
| Facebook / Instagram / LinkedIn profile URLs | `socials` |

**`agency.js`**

| What | Where |
|---|---|
| Hero micro-stats (6 channels / 1 point of contact / 14 days) | `hero.ticks` |
| The four big numbers in the dark band | `stats` |
| All three testimonials, names and companies | `testimonials.items` |

**`institute.js`** — none of this is real yet:

| What | Where |
|---|---|
| Fee, instalment terms, class size, certificate wording | `course` |
| Hero micro-stats | `hero.ticks` |
| Batch names, start dates, timings, seats | `batches` |
| Instructor name, role, bio | `instructor` |
| Certificate, attendance and job-help policies | `faq.items` |

**If no batch is scheduled yet, set `batches = []`.** The Batches section then
shows a "register interest" band instead of advertising dates that do not
exist, and the hero drops its "next batch" line. This is the honest default —
use it rather than inventing a date.

`company.email` (`dworld9622@gmail.com`) is taken from the flyer and is
treated as real.

## Wiring up the forms

Both forms — the agency enquiry form and the academy enrolment form — post
through one helper, `src/lib/submitEnquiry.js`.

1. Create two forms at [Formspree](https://formspree.io), one per sector, so
   agency enquiries and course enrolments land in separate inboxes.
2. Copy `.env.example` to `.env` and paste the two endpoints:

   ```
   VITE_FORMSPREE_AGENCY=https://formspree.io/f/xxxxxxxx
   VITE_FORMSPREE_INSTITUTE=https://formspree.io/f/yyyyyyyy
   ```

3. Restart the dev server — Vite only reads `.env` at startup.

`.env` is gitignored. The variables are read in `src/config.js`.

**Until they are set**, the forms render and validate normally, but submitting
shows an error telling the visitor to email or call instead. That is
deliberate: a form that silently drops enquiries is worse than one that admits
it is not connected. The email address and phone number are live links beside
both forms and in the footer, so visitors can always reach you.

Both forms send a `sector` field (`agency` / `institute`), so submissions
remain distinguishable even if you point both at one endpoint.

## Deploying

The site uses client-side routing, so the host must serve `index.html` for
unknown paths — otherwise a refresh on `/institute` returns a 404.

- **Netlify** — `public/_redirects` is committed and handles this.
- **Vercel** — `vercel.json` is committed and handles this.
- **nginx** — add to your server block:

  ```nginx
  location / {
    try_files $uri $uri/ /index.html;
  }
  ```

- **Apache** — add a `.htaccess` rewriting all non-file requests to `/index.html`.

`npm run preview` reproduces this locally, so test a hard refresh on
`/institute` there before deploying somewhere new.

## Structure

```
src/
  App.jsx               routes only
  config.js             form endpoints from .env
  lib/
    submitEnquiry.js    the site's only network call
  data/                 all copy: company.js, agency.js, institute.js
  layouts/
    AppShell.jsx        header + page + footer, scroll handling
    Header.jsx          sector-aware nav, CTA and wordmark
    Footer.jsx
    useSector.js        derives the active sector from the route
  pages/                LandingPage, AgencyPage, InstitutePage
  sections/
    agency/             one file per section of /agency
    institute/          one file per section of /institute
  components/           shared by both sectors
  index.css             design tokens: colours, fonts, type scale
```

The two sector pages are lazily loaded, so a visitor reading about the course
does not download the agency page to do it.

Colours and typefaces are defined once as tokens in `src/index.css` under
`@theme`. Change `--color-signal` there and the accent updates everywhere, on
both sectors.

## React Scan

[React Scan](https://react-scan.com) is wired into `npm run dev` only. Start the
dev server and its toolbar appears bottom-right; click the target icon to
highlight components as they re-render.

It is injected as a script tag by a small plugin in `vite.config.js` rather than
imported in `main.jsx`, so it loads ahead of React (which it needs in order to
instrument the first render) and never reaches a production build.

## Design notes

The page is drawn like a growth chart: faint horizontal gradations run behind
each band, and the hero mark is the flyer's node network redrawn as a rising
line. Motion is limited to the hero draw-in, scroll reveals, and hover lifts —
all of it switched off for visitors who ask for reduced motion.

The syllabus and FAQ accordions are built on native `<details>`/`<summary>`,
so keyboard handling, ARIA semantics and find-in-page work without custom code.
