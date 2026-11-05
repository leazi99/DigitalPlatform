// First-run seed.
//
// The seed content is imported straight from `src/data/*.js` — the files the
// site used before it had a database. That is deliberate: the database starts
// out holding exactly what the site already showed, so switching the pages
// over to the API changes nothing visible, and those files stay useful as the
// offline fallback the browser renders if the API is unreachable.
//
// Every insert here is guarded on the collection being empty. Restarting the
// server never overwrites an edit made in the admin panel.
//
// On Vercel several cold starts can run this at the same moment against an
// empty database. The admin account is protected by the unique email index;
// the content is protected by a `seed` marker only one of them can claim.

import bcrypt from "bcryptjs";
import { col, countRows, getSetting, nextId, now, putSetting } from "./db.js";
import { config } from "./env.js";
import { company, sectors, socials } from "../src/data/company.js";
import * as agency from "../src/data/agency.js";
import * as institute from "../src/data/institute.js";

/** Only writes a settings key that has never been written. */
async function seedSetting(key, value) {
  if ((await getSetting(key)) === null) await putSetting(key, value);
}

async function seedAdminAccount() {
  if ((await countRows("admins")) > 0) return;
  const hash = bcrypt.hashSync(config.seedAdmin.password, 12);
  try {
    await col("admins").insertOne({
      id: await nextId("admins"),
      email: config.seedAdmin.email.toLowerCase(),
      name: config.seedAdmin.name,
      password_hash: hash,
      token_version: 0,
      created_at: now(),
      last_login_at: null,
    });
    console.log(`  · created the first admin: ${config.seedAdmin.email}`);
  } catch (error) {
    // Another cold start created it a moment ago.
    if (error.code !== 11000) throw error;
  }
}

async function seedContentBlocks() {
  await seedSetting("company", company);
  await seedSetting("sectors", sectors);
  await seedSetting("socials", socials);

  await seedSetting("agency.nav", agency.nav);
  await seedSetting("agency.hero", agency.hero);
  await seedSetting("agency.about", agency.about);
  await seedSetting("agency.servicesIntro", pick(agency.services, ["eyebrow", "heading", "lead"]));
  await seedSetting("agency.processIntro", pick(agency.process, ["eyebrow", "heading", "lead"]));
  await seedSetting(
    "agency.testimonialsIntro",
    pick(agency.testimonials, ["eyebrow", "heading", "lead"]),
  );
  await seedSetting("agency.contact", agency.contact);

  await seedSetting("institute.nav", institute.nav);
  await seedSetting("institute.hero", institute.hero);
  await seedSetting(
    "institute.outcomesIntro",
    pick(institute.outcomes, ["eyebrow", "heading", "lead"]),
  );
  await seedSetting(
    "institute.syllabusIntro",
    pick(institute.syllabus, ["eyebrow", "heading", "lead"]),
  );
  await seedSetting(
    "institute.audienceIntro",
    pick(institute.audience, ["eyebrow", "heading", "lead"]),
  );
  await seedSetting("institute.batchesSection", institute.batchesSection);
  await seedSetting("institute.instructorIntro", pick(institute.instructor, ["eyebrow", "heading"]));
  await seedSetting("institute.faqIntro", pick(institute.faq, ["eyebrow", "heading", "lead"]));
  await seedSetting("institute.enrol", institute.enrol);
}

function pick(source, keys) {
  const out = {};
  for (const key of keys) out[key] = source[key] ?? "";
  return out;
}

/** Insert `rows` into an empty collection, giving each an id, a position in
 *  list order, and timestamps. */
async function seedList(name, rows) {
  if ((await countRows(name)) > 0 || rows.length === 0) return;
  const stamp = now();
  const docs = [];
  for (const [i, row] of rows.entries()) {
    docs.push({ id: await nextId(name), ...row, position: i, created_at: stamp, updated_at: stamp });
  }
  await col(name).insertMany(docs);
}

async function seedLists() {
  let courseId = null;

  if ((await countRows("courses")) === 0) {
    const c = institute.course;
    courseId = await nextId("courses");
    await col("courses").insertOne({
      id: courseId,
      title: c.title,
      duration: c.duration,
      format: c.format,
      mode: c.mode,
      fee: c.fee,
      instalments: c.instalments,
      seats: c.seats,
      certificate: c.certificate,
      language: c.language,
      published: true,
      position: 0,
      created_at: now(),
      updated_at: now(),
    });
  } else {
    const first = await col("courses").findOne({}, { sort: { position: 1, id: 1 } });
    courseId = first?.id ?? null;
  }

  await seedList("syllabus_modules", syllabusRows(courseId));

  const i = institute.instructor;
  await seedList("instructors", [
    { name: i.name, role: i.role, bio: i.bio ?? [], points: i.points ?? [], published: true },
  ]);

  await seedList(
    "batches",
    institute.batches.map((b) => ({
      course_id: courseId,
      name: b.name,
      starts: b.starts,
      timing: b.timing,
      seats: b.seats,
      status: b.status,
      published: true,
    })),
  );

  await seedList(
    "faqs",
    institute.faq.items.map((item) => ({ sector: "institute", question: item.q, answer: item.a })),
  );

  await seedList(
    "outcomes",
    institute.outcomes.items.map((o) => ({ title: o.title, body: o.body, glyph: o.glyph })),
  );

  await seedList(
    "audience",
    institute.audience.items.map((a) => ({ title: a.title, body: a.body })),
  );

  await seedList(
    "services",
    agency.services.items.map((s) => ({ name: s.name, body: s.body, glyph: s.glyph })),
  );

  await seedList(
    "process_steps",
    agency.process.steps.map((s) => ({ title: s.title, body: s.body })),
  );

  await seedList(
    "testimonials",
    agency.testimonials.items.map((t) => ({
      quote: t.quote,
      name: t.name,
      role: t.role,
      published: true,
    })),
  );

  await seedList(
    "stats",
    agency.stats.map((s) => ({
      sector: "agency",
      value: String(s.value),
      suffix: s.suffix ?? "",
      label: s.label,
      decimals: s.decimals ?? 0,
    })),
  );
}

/** The syllabus in `src/data/institute.js`, as database rows. */
function syllabusRows(courseId) {
  return institute.syllabus.modules.map((m) => ({
    course_id: courseId,
    number: m.number,
    weeks: m.weeks ?? "",
    title: m.title,
    tagline: m.tagline ?? "",
    glyph: m.glyph ?? "growth",
    poster: m.poster ?? "",
    body: m.body,
    topics: m.topics ?? [],
    framework_name: m.frameworkName ?? "",
    framework: m.framework ?? [],
    tools: m.tools ?? [],
    activities: m.activities ?? [],
    project: m.project ?? "",
    practice: m.practice ?? "",
  }));
}

/**
 * One-off content updates for a database that was seeded before the change.
 *
 * Each is claimed with a marker in `counters`, like the seed itself, so it runs
 * exactly once — later edits in the admin panel are never overwritten.
 */
async function migrate() {
  await runOnce("migration:syllabus-8-modules", async () => {
    // The 12-week course replaced the old six-module syllabus outright.
    const first = await col("courses").findOne({}, { sort: { position: 1, id: 1 } });
    const courseId = first?.id ?? null;
    await col("syllabus_modules").deleteMany({});
    const stamp = now();
    const docs = [];
    for (const [i, row] of syllabusRows(courseId).entries()) {
      docs.push({ id: await nextId("syllabus_modules"), ...row, position: i, created_at: stamp, updated_at: stamp });
    }
    await col("syllabus_modules").insertMany(docs);

    // The intro and the hero figures describe the syllabus, so they move with it
    // — but only where they still hold the old seeded wording.
    const intro = await getSetting("institute.syllabusIntro");
    if (intro?.heading === "Six modules, two weeks each.") {
      await putSetting("institute.syllabusIntro", pick(institute.syllabus, ["eyebrow", "heading", "lead"]));
    }
    const hero = await getSetting("institute.hero");
    if (hero?.ticks?.some((t) => t.value === "6" && t.label === "modules")) {
      await putSetting("institute.hero", { ...hero, ticks: institute.hero.ticks });
    }
    if (first && first.duration === "3 months") {
      await col("courses").updateOne({ id: first.id }, { $set: { duration: institute.course.duration, updated_at: stamp } });
    }
  });

  await runOnce("migration:academy-revision-2026-11", async () => {
    // Module 7 became Marketing Automation and CRM, Module 8 Analytics and Live
    // Project, and every module gained tools and practical activities — so the
    // syllabus is replaced again, as a whole.
    await replaceSyllabus();

    // The rest moves only where it still holds the wording seeded before.
    await replaceIfUnchanged("institute.syllabusIntro", "heading", "Eight modules over twelve weeks.", () =>
      pick(institute.syllabus, ["eyebrow", "heading", "lead"]),
    );
    await replaceIfUnchanged(
      "institute.outcomesIntro",
      "heading",
      "By the end, you can run a campaign on your own.",
      (current) => ({ ...current, heading: institute.outcomes.heading }),
    );
    await replaceIfUnchanged(
      "institute.hero",
      "lead",
      "A three-month, hands-on digital marketing course taught by the people who run campaigns for a living. You finish with a portfolio, not just a certificate.",
      (current) => ({ ...current, lead: institute.hero.lead, ticks: institute.hero.ticks }),
    );
    await replaceIfUnchanged(
      "institute.audienceIntro",
      "lead",
      "If you can use a phone and a browser, you can start. What matters is turning up for three months.",
      (current) => ({ ...current, lead: institute.audience.lead }),
    );
    await replaceIfUnchanged(
      "institute.batchesSection",
      "lead",
      "Same course, same instructor, three timings. Seats are held in the order enquiries arrive.",
      (current) => ({ ...current, lead: institute.batchesSection.lead }),
    );
    const sectorsNow = await getSetting("sectors");
    if (sectorsNow?.institute?.blurb?.includes("three-month")) {
      await putSetting("sectors", {
        ...sectorsNow,
        institute: { ...sectorsNow.institute, blurb: sectors.institute.blurb },
      });
    }

    const stamp = now();
    await col("courses").updateMany(
      { duration: { $in: ["12 weeks", "3 months"] } },
      { $set: { duration: institute.course.duration, updated_at: stamp } },
    );

    // The Day Batch is closed until a new intake is confirmed.
    await col("batches").updateMany(
      { name: { $regex: /^day batch$/i } },
      { $set: { status: "closed", starts: "To be confirmed", updated_at: stamp } },
    );

    // FAQs: the duration question is added first; "three months" becomes 12 weeks.
    const [durationFaq] = institute.faq.items;
    if (!(await col("faqs").findOne({ sector: "institute", question: durationFaq.q }))) {
      const top = await col("faqs").findOne({}, { sort: { position: 1 } });
      await col("faqs").insertOne({
        id: await nextId("faqs"),
        sector: "institute",
        question: durationFaq.q,
        answer: durationFaq.a,
        position: (top?.position ?? 0) - 1,
        created_at: stamp,
        updated_at: stamp,
      });
    }
    const backgroundFaq = institute.faq.items.find((f) => f.q === "Do I need a marketing background?");
    await col("faqs").updateMany(
      { sector: "institute", question: backgroundFaq.q, answer: { $regex: /five days a week for three months\.$/ } },
      { $set: { answer: backgroundFaq.a, updated_at: stamp } },
    );
  });
}

/** Replace every syllabus module with the ones in `src/data/institute.js`. */
async function replaceSyllabus() {
  const first = await col("courses").findOne({}, { sort: { position: 1, id: 1 } });
  await col("syllabus_modules").deleteMany({});
  const stamp = now();
  const docs = [];
  for (const [i, row] of syllabusRows(first?.id ?? null).entries()) {
    docs.push({ id: await nextId("syllabus_modules"), ...row, position: i, created_at: stamp, updated_at: stamp });
  }
  await col("syllabus_modules").insertMany(docs);
}

/** Rewrite a settings key with `next(current)` only if `field` still holds
 *  the seeded `oldValue` — an admin's own wording is left alone. */
async function replaceIfUnchanged(key, field, oldValue, next) {
  const current = await getSetting(key);
  if (current?.[field] === oldValue) await putSetting(key, next(current));
}

async function runOnce(marker, task) {
  try {
    await col("counters").insertOne({ _id: marker, at: now() });
  } catch (error) {
    if (error.code === 11000) return;
    throw error;
  }
  try {
    await task();
  } catch (error) {
    await col("counters").deleteOne({ _id: marker });
    throw error;
  }
}

export async function seed() {
  await seedAdminAccount();

  // Claim the content seed. Whoever inserts the marker seeds; everyone else
  // (a parallel cold start, or any later start) skips straight past. A failed
  // seed releases the claim so the next start tries again, rather than leaving
  // a half-seeded database that is never finished.
  await runOnce("seed", async () => {
    await seedContentBlocks();
    await seedLists();
  });

  await migrate();
}
