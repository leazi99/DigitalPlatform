# Digital World Pvt.Ltd — website and admin panel

Two public sectors and a staff panel, built with Vite + React + Tailwind CSS v4
on an Express + SQLite backend.

```
/            brand landing — two doors
/agency      Digital World Agency    — the marketing agency
/institute   Digital World Academy   — the digital marketing course
/admin       the staff panel — sign-in required
```

Same logo, typefaces and cyan accent throughout; the wordmark suffix
(`Agency` / `Academy`) and the nav are what tell a visitor which side they
are on. The header carries a persistent link to the other sector.

Everything on the two public pages is edited from `/admin`. Nothing needs a
code change or a redeploy to update a fee, add a batch, or take a testimonial
down.

## Run it

```bash
npm install
cp .env.example .env     # then fill in JWT_SECRET and ADMIN_PASSWORD
npm run dev              # API on :4000, site on http://localhost:5173
```

`npm run dev` starts both the API and the Vite dev server in one terminal;
Ctrl-C stops both. To run them apart, use `npm run dev:api` and `npm run dev:site`.

| Command | What it does |
|---|---|
| `npm run dev` | API and site together, both watching for changes |
| `npm run dev:api` | just the API, on `PORT` (4000 by default) |
| `npm run dev:site` | just Vite, on 5173 |
| `npm run build` | production files into `dist/` |
| `npm start` | serves `dist/` **and** the API from one process — how it runs in production |
| `npm run lint` | oxlint |

**The server will not start without `JWT_SECRET` and `ADMIN_PASSWORD` in
`.env`.** That is deliberate: a generated-per-restart secret would log every
admin out on each deploy, and a default password would hand the panel to
anyone who has read this file. It prints exactly what is missing and how to
generate a secret.

## The admin panel

Open `/admin` and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. That account
is created on the first run only — after that, change the password from
**Account**, where you can also add other admins. Editing the `.env` values
later does nothing to an account that already exists.

| Screen | What it manages |
|---|---|
| **Dashboard** | Visitors, engaged visits, pages read, and how many got in touch, over 7 / 30 / 90 days |
| **Visitors** | Every browser that has opened the site, and the pages each one read, in order |
| **Students** | Seat requests from the enrolment form, through to enrolled and completed |
| **Agency enquiries** | Submissions from the agency contact form |
| **Courses · Syllabus · Batches · Instructors · Outcomes · Who it is for · Questions** | The academy page |
| **Services · Process · Testimonials · Statistics** | The agency page |
| **Page copy** | Company details, section headings, hero copy, nav, social links |
| **Account** | Your password, other admins, clearing out old visitor data |

Every list can be added to, edited, reordered and deleted, and most have a
**Published** switch — unpublish to take something off the website without
losing it. Students and enquiries export to CSV.

**The course shown on the website is the first published course in the list.**
Keep others as drafts of what comes next; reorder or unpublish to change which
one is live.

### What is recorded about visitors, and what is not

First-party and deliberately thin. No IP address is stored, no cookie is set,
no third-party script is involved. A visitor is a random id their own browser
keeps and can clear at any time.

- A browser sending **Do Not Track** (or Global Privacy Control) is not
  recorded at all, and neither are obvious bots. The figures are therefore a
  slight undercount rather than every request the server saw, and the
  dashboard says so on screen rather than presenting them as the whole truth.
- **Engaged** means a visit with two or more pages, or thirty seconds or more
  on the site, or at least one tracked action. Opening a page and leaving does
  not count — that difference is the point of the figure.
- A visit ends after thirty minutes of inactivity.
- **Account → Clear out old visitor data** deletes the log past a chosen age,
  and a single visitor can be erased from their own row. Keeping a visitor log
  forever is a liability, not an asset.

## Editing content

Through `/admin`. The files under `src/data/` are no longer what the live site
reads — they are two other things:

1. **The seed.** On the first run, the database is created from them, so the
   site starts out showing exactly what it showed before it had a database.
2. **The offline fallback.** They are bundled into the browser build and
   rendered immediately on load, then replaced by whatever the API sends. If
   the API is unreachable the site shows this content rather than an error.

So editing them changes what a brand-new database is seeded with, and what
visitors see if the API is down. It does not change the live site.

### Placeholders to replace before going live

The database is seeded with the invented copy that was written to make the
layout readable. **None of it is a verified figure, a real client, or a real
course detail.** Replace it in the admin panel before launch:

| Screen | What is still invented |
|---|---|
| Page copy → Company details | Phone number, street address, opening hours |
| Page copy → Social profiles | All three URLs are `#` |
| Page copy → Agency hero / Academy hero | The micro-stats under each hero |
| Statistics | All four numbers in the agency's dark band |
| Testimonials | All three quotes, names and companies |
| Courses | Fee, instalment terms, class size, certificate wording |
| Batches | Names, start dates, timings, seats |
| Instructors | Name, role, bio |
| Questions and answers | Certificate, attendance and job-help policies |

`company.email` (`dworld9622@gmail.com`) is taken from the flyer and is
treated as real.

**If no batch is scheduled yet, unpublish all of them.** The Batches section
then shows a "register interest" band instead of advertising dates that do not
exist, and the hero drops its "next batch" line. This is the honest default —
use it rather than inventing a date.

## Forms

Both forms — the agency enquiry and the academy enrolment — post to the API and
are stored, which is what makes them appear in the admin panel.

`VITE_FORMSPREE_AGENCY` and `VITE_FORMSPREE_INSTITUTE` are now **optional**.
Set them and a copy of each submission is also emailed through
[Formspree](https://formspree.io), so someone gets a nudge without opening the
panel. Leave them blank and the database row is the only record. Either way the
submission is saved before the email is attempted, and a failed email is logged
rather than shown to the visitor.

Each submission carries the visitor's session id, so the admin can see which
visit turned into an enquiry and what that person read first.

## Deploying

**This is no longer a static site.** It needs a host that runs Node and keeps
a file on disk — Render, Railway, Fly, or any VPS. Vercel can serve the app if
the API is deployed as a serverless function, but the SQLite database will be
ephemeral there unless you move it to persistent storage. `public/_redirects`
and `vercel.json` are left in place for the client-side routing they describe.

```bash
npm ci
npm run build
NODE_ENV=production npm start
```

`npm start` serves `dist/` and the API from one process on one port, so the
site and its API are the same origin and no CORS configuration is needed.
The SPA fallback is what makes a hard refresh on `/institute` or
`/admin/students` work.

Set in the host's environment:

| Variable | Notes |
|---|---|
| `JWT_SECRET` | Required, 32+ characters. Changing it signs every admin out. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Required on first deploy only — they create the first account |
| `PORT` | Whatever the host assigns |
| `DB_FILE` | Point at a **persistent disk**, or the database is wiped on every deploy |
| `VITE_API_URL` | Leave **empty** in production: same origin, so a relative `/api` is correct |

`DB_FILE` is the one to get right. On a host with an ephemeral filesystem, a
deploy takes the enrolments with it unless the database is on a mounted volume.

### Backups

The whole thing is one file. Copy it:

```bash
sqlite3 server/data.db ".backup '/somewhere/safe/data-$(date +%F).db'"
```

Use `.backup` rather than `cp` — the database runs in WAL mode, so a plain copy
of the `.db` file alone can miss the most recent writes.

## Structure

```
server/
  index.js            the Express app, and in production the site too
  env.js              configuration, and the checks that refuse to start without it
  db.js               the SQLite schema, opened at startup
  seed.js             first-run content, imported from src/data/
  auth.js             bcrypt passwords, JWT sessions
  resources.js        what the admin can CRUD, described as data
  crud.js             turns one of those descriptions into REST routes
  content.js          composes the public site's content out of the database
  analytics.js        what visitor tracking records, and the dashboard's queries
  rateLimit.js        a small limiter for the public routes
  routes/
    auth.js           sign in, change password
    public.js         content, tracking, the two forms
    admin.js          everything behind the sign-in

src/
  App.jsx             routes only
  config.js           the optional Formspree endpoints
  lib/
    api.js            the browser's side of the API
    track.js          visitor tracking
    submitEnquiry.js  the two public forms
  content/
    ContentProvider.jsx  fetches the live content
    useContent.js        the hooks the pages read it through
    fallback.js          the bundled copy, in the API's shape
  data/                the seed and the fallback: company.js, agency.js, institute.js
  layouts/             AppShell, Header, Footer, useSector
  pages/               LandingPage, AgencyPage, InstitutePage
  sections/            one file per section of each sector page
  components/          shared by both sectors
  admin/               the staff panel — its own bundle, loaded only at /admin
  index.css            design tokens: colours, fonts, type scale
```

The two sector pages and the whole admin panel are lazily loaded, so a visitor
reading about the course downloads neither the agency page nor the panel.

Colours and typefaces are defined once as tokens in `src/index.css` under
`@theme`. Change `--color-signal` there and the accent updates everywhere —
both public sectors and the admin panel.

### Adding something new to the admin panel

Add the table to `server/db.js`, describe its columns in `server/resources.js`,
and give it a row in `src/admin/resourceViews.js` and `contentOrder`. The REST
routes, the form, the validation and the table are generated from those
descriptions — there is no per-resource screen to write.

## React Scan

[React Scan](https://react-scan.com) is wired into the dev server only. Start it
and its toolbar appears bottom-right; click the target icon to highlight
components as they re-render.

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

The dashboard's chart is one column per day, its filled part the visits that
engaged. That is a part-to-whole where one part is the story, so it is drawn as
emphasis — the accent for engaged, a recessive grey for the rest — rather than
as two colours competing to be read. Every figure the hover shows is also in the
table under it, so nothing is reachable only by pointer.
