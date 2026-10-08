// First-run seed.
//
// The seed content is imported straight from `src/data/*.js` — the files the
// site used before it had a database. That is deliberate: the database starts
// out holding exactly what the site already showed, so switching the pages
// over to the API changes nothing visible, and those files stay useful as the
// offline fallback the browser renders if the API is unreachable.
//
// Every insert here is guarded on the table being empty. Restarting the
// server never overwrites an edit made in the admin panel.

import bcrypt from "bcryptjs";
import { db, countRows, getSetting, putSetting } from "./db.js";
import { config } from "./env.js";
import { company, sectors, socials } from "../src/data/company.js";
import * as agency from "../src/data/agency.js";
import * as institute from "../src/data/institute.js";

/** Only writes a settings key that has never been written. */
function seedSetting(key, value) {
  if (getSetting(key) === null) putSetting(key, value);
}

function seedAdminAccount() {
  if (countRows("admins") > 0) return;
  const hash = bcrypt.hashSync(config.seedAdmin.password, 12);
  db.prepare("INSERT INTO admins (email, name, password_hash) VALUES (?, ?, ?)").run(
    config.seedAdmin.email.toLowerCase(),
    config.seedAdmin.name,
    hash,
  );
  console.log(`  · created the first admin: ${config.seedAdmin.email}`);
}

function seedContentBlocks() {
  seedSetting("company", company);
  seedSetting("sectors", sectors);
  seedSetting("socials", socials);

  seedSetting("agency.nav", agency.nav);
  seedSetting("agency.hero", agency.hero);
  seedSetting("agency.about", agency.about);
  seedSetting("agency.servicesIntro", pick(agency.services, ["eyebrow", "heading", "lead"]));
  seedSetting("agency.processIntro", pick(agency.process, ["eyebrow", "heading", "lead"]));
  seedSetting(
    "agency.testimonialsIntro",
    pick(agency.testimonials, ["eyebrow", "heading", "lead"]),
  );
  seedSetting("agency.contact", agency.contact);

  seedSetting("institute.nav", institute.nav);
  seedSetting("institute.hero", institute.hero);
  seedSetting("institute.outcomesIntro", pick(institute.outcomes, ["eyebrow", "heading", "lead"]));
  seedSetting("institute.syllabusIntro", pick(institute.syllabus, ["eyebrow", "heading", "lead"]));
  seedSetting("institute.audienceIntro", pick(institute.audience, ["eyebrow", "heading", "lead"]));
  seedSetting("institute.batchesSection", institute.batchesSection);
  seedSetting("institute.instructorIntro", pick(institute.instructor, ["eyebrow", "heading"]));
  seedSetting("institute.faqIntro", pick(institute.faq, ["eyebrow", "heading", "lead"]));
  seedSetting("institute.enrol", institute.enrol);
}

function pick(source, keys) {
  const out = {};
  for (const key of keys) out[key] = source[key] ?? "";
  return out;
}

function seedLists() {
  let courseId = null;

  if (countRows("courses") === 0) {
    const c = institute.course;
    const result = db
      .prepare(
        `INSERT INTO courses
           (title, duration, format, mode, fee, instalments, seats, certificate, language, position)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      )
      .run(
        c.title,
        c.duration,
        c.format,
        c.mode,
        c.fee,
        c.instalments,
        c.seats,
        c.certificate,
        c.language,
      );
    courseId = result.lastInsertRowid;
  } else {
    courseId = db.prepare("SELECT id FROM courses ORDER BY position, id LIMIT 1").get()?.id ?? null;
  }

  if (countRows("syllabus_modules") === 0) {
    const insert = db.prepare(
      `INSERT INTO syllabus_modules (course_id, number, title, body, topics, position)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );
    institute.syllabus.modules.forEach((m, i) => {
      insert.run(courseId, m.number, m.title, m.body, JSON.stringify(m.topics ?? []), i);
    });
  }

  if (countRows("instructors") === 0) {
    const i = institute.instructor;
    db.prepare(
      "INSERT INTO instructors (name, role, bio, points, position) VALUES (?, ?, ?, ?, 0)",
    ).run(i.name, i.role, JSON.stringify(i.bio ?? []), JSON.stringify(i.points ?? []));
  }

  if (countRows("batches") === 0) {
    const insert = db.prepare(
      `INSERT INTO batches (course_id, name, starts, timing, seats, status, position)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    institute.batches.forEach((b, i) => {
      insert.run(courseId, b.name, b.starts, b.timing, b.seats, b.status, i);
    });
  }

  if (countRows("faqs") === 0) {
    const insert = db.prepare(
      "INSERT INTO faqs (sector, question, answer, position) VALUES (?, ?, ?, ?)",
    );
    institute.faq.items.forEach((item, i) => insert.run("institute", item.q, item.a, i));
  }

  if (countRows("outcomes") === 0) {
    const insert = db.prepare(
      "INSERT INTO outcomes (title, body, glyph, position) VALUES (?, ?, ?, ?)",
    );
    institute.outcomes.items.forEach((o, i) => insert.run(o.title, o.body, o.glyph, i));
  }

  if (countRows("audience") === 0) {
    const insert = db.prepare("INSERT INTO audience (title, body, position) VALUES (?, ?, ?)");
    institute.audience.items.forEach((a, i) => insert.run(a.title, a.body, i));
  }

  if (countRows("services") === 0) {
    const insert = db.prepare(
      "INSERT INTO services (name, body, glyph, position) VALUES (?, ?, ?, ?)",
    );
    agency.services.items.forEach((s, i) => insert.run(s.name, s.body, s.glyph, i));
  }

  if (countRows("process_steps") === 0) {
    const insert = db.prepare("INSERT INTO process_steps (title, body, position) VALUES (?, ?, ?)");
    agency.process.steps.forEach((s, i) => insert.run(s.title, s.body, i));
  }

  if (countRows("testimonials") === 0) {
    const insert = db.prepare(
      "INSERT INTO testimonials (quote, name, role, position) VALUES (?, ?, ?, ?)",
    );
    agency.testimonials.items.forEach((t, i) => insert.run(t.quote, t.name, t.role, i));
  }

  if (countRows("stats") === 0) {
    const insert = db.prepare(
      "INSERT INTO stats (sector, value, suffix, label, decimals, position) VALUES (?, ?, ?, ?, ?, ?)",
    );
    agency.stats.forEach((s, i) =>
      insert.run("agency", String(s.value), s.suffix ?? "", s.label, s.decimals ?? 0, i),
    );
  }
}

/** Runs the whole seed in one transaction — a half-seeded database is worse
 *  than an empty one, because the empty-table guards would then skip the rest. */
export const seed = db.transaction(() => {
  seedAdminAccount();
  seedContentBlocks();
  seedLists();
});
