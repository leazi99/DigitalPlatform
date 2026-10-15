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

  await seedList(
    "syllabus_modules",
    institute.syllabus.modules.map((m) => ({
      course_id: courseId,
      number: m.number,
      title: m.title,
      body: m.body,
      topics: m.topics ?? [],
    })),
  );

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

export async function seed() {
  await seedAdminAccount();

  // Claim the content seed. Whoever inserts the marker seeds; everyone else
  // (a parallel cold start, or any later start) skips straight past.
  try {
    await col("counters").insertOne({ _id: "seed", at: now() });
  } catch (error) {
    if (error.code === 11000) return;
    throw error;
  }

  try {
    await seedContentBlocks();
    await seedLists();
  } catch (error) {
    // Release the claim so the next start tries again, rather than leaving a
    // half-seeded database that is never finished.
    await col("counters").deleteOne({ _id: "seed" });
    throw error;
  }
}
