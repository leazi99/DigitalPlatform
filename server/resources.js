// What the admin panel can add, edit, reorder and delete.
//
// Every one of these is the same four operations over a different table, so
// they are described as data here and turned into routes by `crud.js`. The
// alternative — sixteen near-identical route files — is sixteen places for a
// validation rule to drift out of step.

/**
 * Column types:
 *   text   trimmed string
 *   long   trimmed string, expected to be a paragraph
 *   int    integer
 *   bool   stored 0/1, sent as true/false
 *   json   stored as a JSON string, sent as an array or object
 *   ref    integer foreign key, or null
 *   enum   one of `values`
 */
export const resources = {
  courses: {
    table: "courses",
    label: "Course",
    plural: "Courses",
    ordered: true,
    search: ["title"],
    columns: {
      title: { type: "text", required: true, label: "Title" },
      duration: { type: "text", label: "Duration" },
      format: { type: "text", label: "Format" },
      mode: { type: "text", label: "Mode" },
      fee: { type: "text", label: "Fee" },
      instalments: { type: "text", label: "Instalments" },
      seats: { type: "text", label: "Class size" },
      certificate: { type: "text", label: "Certificate" },
      language: { type: "text", label: "Language" },
      published: { type: "bool", default: true, label: "Published" },
    },
  },

  syllabus: {
    table: "syllabus_modules",
    label: "Module",
    plural: "Syllabus",
    ordered: true,
    search: ["title", "body"],
    filters: ["course_id"],
    columns: {
      course_id: { type: "ref", ref: "courses", label: "Course" },
      number: { type: "text", label: "Number" },
      title: { type: "text", required: true, label: "Title" },
      body: { type: "long", label: "Summary" },
      topics: { type: "json", default: [], label: "Topics" },
    },
  },

  instructors: {
    table: "instructors",
    label: "Instructor",
    plural: "Instructors",
    ordered: true,
    search: ["name", "role"],
    columns: {
      name: { type: "text", required: true, label: "Name" },
      role: { type: "text", label: "Role" },
      bio: { type: "json", default: [], label: "Bio paragraphs" },
      points: { type: "json", default: [], label: "Highlights" },
      published: { type: "bool", default: true, label: "Published" },
    },
  },

  batches: {
    table: "batches",
    label: "Batch",
    plural: "Batches",
    ordered: true,
    search: ["name", "starts", "timing"],
    filters: ["course_id", "status"],
    columns: {
      course_id: { type: "ref", ref: "courses", label: "Course" },
      name: { type: "text", required: true, label: "Name" },
      starts: { type: "text", label: "Starts" },
      timing: { type: "text", label: "Timing" },
      seats: { type: "text", label: "Seats" },
      status: {
        type: "enum",
        values: ["open", "filling", "closed"],
        default: "open",
        label: "Status",
      },
      published: { type: "bool", default: true, label: "Published" },
    },
  },

  faqs: {
    table: "faqs",
    label: "Question",
    plural: "FAQs",
    ordered: true,
    search: ["question", "answer"],
    filters: ["sector"],
    columns: {
      sector: {
        type: "enum",
        values: ["institute", "agency"],
        default: "institute",
        label: "Sector",
      },
      question: { type: "text", required: true, label: "Question" },
      answer: { type: "long", label: "Answer" },
    },
  },

  outcomes: {
    table: "outcomes",
    label: "Outcome",
    plural: "Outcomes",
    ordered: true,
    search: ["title", "body"],
    columns: {
      title: { type: "text", required: true, label: "Title" },
      body: { type: "long", label: "Body" },
      glyph: { type: "enum", values: GLYPHS(), default: "growth", label: "Icon" },
    },
  },

  audience: {
    table: "audience",
    label: "Audience group",
    plural: "Audience",
    ordered: true,
    search: ["title", "body"],
    columns: {
      title: { type: "text", required: true, label: "Title" },
      body: { type: "long", label: "Body" },
    },
  },

  services: {
    table: "services",
    label: "Service",
    plural: "Services",
    ordered: true,
    search: ["name", "body"],
    columns: {
      name: { type: "text", required: true, label: "Name" },
      body: { type: "long", label: "Body" },
      glyph: { type: "enum", values: GLYPHS(), default: "growth", label: "Icon" },
    },
  },

  process: {
    table: "process_steps",
    label: "Step",
    plural: "Process steps",
    ordered: true,
    search: ["title", "body"],
    columns: {
      title: { type: "text", required: true, label: "Title" },
      body: { type: "long", label: "Body" },
    },
  },

  testimonials: {
    table: "testimonials",
    label: "Testimonial",
    plural: "Testimonials",
    ordered: true,
    search: ["quote", "name", "role"],
    columns: {
      quote: { type: "long", required: true, label: "Quote" },
      name: { type: "text", label: "Name" },
      role: { type: "text", label: "Role and company" },
      published: { type: "bool", default: true, label: "Published" },
    },
  },

  stats: {
    table: "stats",
    label: "Statistic",
    plural: "Statistics",
    ordered: true,
    search: ["label"],
    filters: ["sector"],
    columns: {
      sector: { type: "enum", values: ["agency", "institute"], default: "agency", label: "Sector" },
      value: { type: "text", required: true, label: "Value" },
      suffix: { type: "text", label: "Suffix" },
      label: { type: "text", label: "Label" },
      decimals: { type: "int", default: 0, label: "Decimal places" },
    },
  },

  students: {
    table: "students",
    label: "Student",
    plural: "Students",
    ordered: false,
    defaultSort: "created_at DESC, id DESC",
    search: ["name", "email", "phone", "message", "notes"],
    filters: ["status", "batch_id", "course_id"],
    columns: {
      name: { type: "text", required: true, label: "Name" },
      email: { type: "text", label: "Email" },
      phone: { type: "text", label: "Phone" },
      course_id: { type: "ref", ref: "courses", label: "Course" },
      batch_id: { type: "ref", ref: "batches", label: "Batch" },
      batch_name: { type: "text", label: "Batch requested" },
      status: {
        type: "enum",
        values: ["enquiry", "contacted", "enrolled", "studying", "completed", "dropped"],
        default: "enquiry",
        label: "Status",
      },
      source: { type: "text", default: "website", label: "Source" },
      message: { type: "long", label: "Their message" },
      notes: { type: "long", label: "Internal notes" },
      session_id: { type: "text", readOnly: true, label: "Visitor session" },
    },
  },

  enquiries: {
    table: "enquiries",
    label: "Enquiry",
    plural: "Enquiries",
    ordered: false,
    defaultSort: "created_at DESC, id DESC",
    search: ["name", "email", "phone", "message", "notes"],
    filters: ["status", "sector"],
    columns: {
      name: { type: "text", required: true, label: "Name" },
      email: { type: "text", label: "Email" },
      phone: { type: "text", label: "Phone" },
      service: { type: "text", label: "Service wanted" },
      message: { type: "long", label: "Their message" },
      sector: { type: "enum", values: ["agency", "institute"], default: "agency", label: "Sector" },
      status: {
        type: "enum",
        values: ["new", "contacted", "quoted", "won", "lost"],
        default: "new",
        label: "Status",
      },
      notes: { type: "long", label: "Internal notes" },
      session_id: { type: "text", readOnly: true, label: "Visitor session" },
    },
  },
};

/** The icons `ServiceGlyph` can draw. Kept here so the admin's icon picker
 *  can only offer names that actually render. */
function GLYPHS() {
  return ["social", "search", "meta", "google", "click", "growth"];
}

export const glyphNames = GLYPHS();

/** Turn a database row into the JSON the admin panel receives. */
export function toJson(spec, row) {
  if (!row) return null;
  const out = { id: row.id };

  for (const [name, col] of Object.entries(spec.columns)) {
    const raw = row[name];
    if (col.type === "json") {
      try {
        out[name] = JSON.parse(raw ?? "null") ?? col.default ?? [];
      } catch {
        out[name] = col.default ?? [];
      }
    } else if (col.type === "bool") {
      out[name] = Boolean(raw);
    } else {
      out[name] = raw ?? null;
    }
  }

  if (spec.ordered) out.position = row.position;
  if ("created_at" in row) out.created_at = row.created_at;
  if ("updated_at" in row) out.updated_at = row.updated_at;
  return out;
}

/**
 * Validate and coerce a request body into column values.
 *
 * `partial` is true for a PATCH: fields the request left out are not
 * defaulted, they are simply not touched.
 *
 * Returns `{ values, errors }`. `errors` is keyed by field so the admin form
 * can show each message under the input it belongs to.
 */
export function fromJson(spec, body, { partial = false } = {}) {
  const values = {};
  const errors = {};
  const input = body && typeof body === "object" ? body : {};

  for (const [name, col] of Object.entries(spec.columns)) {
    // A read-only column belongs to whatever created the row — the session id
    // is written by the public form's route, not by anything the admin sends.
    if (col.readOnly) continue;

    const present = Object.hasOwn(input, name);
    if (!present) {
      if (partial) continue;
      if (col.required) {
        errors[name] = `${col.label ?? name} is required.`;
        continue;
      }
      values[name] = defaultFor(col);
      continue;
    }

    const value = coerce(col, input[name]);

    if (col.required && (value === null || value === "")) {
      errors[name] = `${col.label ?? name} is required.`;
      continue;
    }
    if (col.type === "enum" && value && !col.values.includes(value)) {
      errors[name] = `${col.label ?? name} must be one of: ${col.values.join(", ")}.`;
      continue;
    }

    values[name] = value;
  }

  return { values, errors };
}

function defaultFor(col) {
  if (col.default !== undefined) {
    return col.type === "json" ? JSON.stringify(col.default) : encode(col, col.default);
  }
  if (col.type === "json") return "[]";
  if (col.type === "bool") return 0;
  if (col.type === "int") return 0;
  if (col.type === "ref") return null;
  return "";
}

function encode(col, value) {
  if (col.type === "bool") return value ? 1 : 0;
  return value;
}

function coerce(col, value) {
  switch (col.type) {
    case "json": {
      // Accept either a real array/object or a JSON string, and drop blank
      // entries — an empty trailing row in the admin's list editor should not
      // render as an empty bullet on the site.
      let parsed = value;
      if (typeof value === "string") {
        try {
          parsed = JSON.parse(value);
        } catch {
          parsed = [];
        }
      }
      if (Array.isArray(parsed)) {
        parsed = parsed.filter((item) =>
          typeof item === "string" ? item.trim() !== "" : item != null,
        );
        parsed = parsed.map((item) => (typeof item === "string" ? item.trim() : item));
      }
      return JSON.stringify(parsed ?? []);
    }
    case "bool":
      return value === true || value === 1 || value === "1" || value === "true" ? 1 : 0;
    case "int": {
      const n = Number.parseInt(value, 10);
      return Number.isFinite(n) ? n : 0;
    }
    case "ref": {
      if (value === "" || value === null || value === undefined) return null;
      const n = Number.parseInt(value, 10);
      return Number.isFinite(n) ? n : null;
    }
    default:
      return value === null || value === undefined ? "" : String(value).trim();
  }
}
