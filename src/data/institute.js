// ─────────────────────────────────────────────────────────────────────────────
// ACADEMY sector copy — everything on /institute.
// Shared details (name, email, phone, socials) live in ./company.js.
//
// EVERY line marked REPLACE below is invented. There is no real fee, batch
// date, instructor or graduate figure here yet. Replace them all before this
// page goes live — publishing invented course details is a real problem, not
// a cosmetic one.
// ─────────────────────────────────────────────────────────────────────────────

export const nav = [
  { label: "Course", href: "#course" },
  { label: "Syllabus", href: "#syllabus" },
  { label: "Batches", href: "#batches" },
  { label: "Instructor", href: "#instructor" },
  { label: "Enrol", href: "#enrol" },
];

export const hero = {
  eyebrow: "Digital marketing institute",
  lines: ["Learn to", "run the", "campaigns"],
  lead: "A three-month, hands-on digital marketing course taught by the people who run campaigns for a living. You finish with a portfolio, not just a certificate.",
  primaryCta: { label: "Enrol now", href: "#enrol" },
  secondaryCta: { label: "See the syllabus", href: "#syllabus" },
  // REPLACE — all three figures
  ticks: [
    { value: "3", label: "months, part-time" },
    { value: "6", label: "modules" },
    { value: "1", label: "live client project" },
  ],
};

// REPLACE — every field below
export const course = {
  title: "Complete Digital Marketing",
  duration: "3 months",
  format: "Part-time · 2 hours a day, 5 days a week",
  mode: "In person in Kathmandu, or live online",
  fee: "Rs. XX,XXX", // REPLACE — real fee
  instalments: "Payable in 3 monthly instalments", // REPLACE — real payment terms
  seats: "20 seats per batch", // REPLACE — real class size
  certificate: "Certificate on completion of the final project", // REPLACE
  language: "Nepali and English",
};

export const outcomes = {
  eyebrow: "What you leave with",
  heading: "By the end, you can run a campaign on your own.",
  lead: "Not theory you cannot use. Every module ends with something you have actually built, and it goes in your portfolio.",
  items: [
    {
      title: "A live ad account you have managed",
      body: "You plan the audience, write the copy, set the budget and read the results — on a real account, not a screenshot.",
      glyph: "meta",
    },
    {
      title: "A site that ranks",
      body: "Keyword research, on-page work and content written to answer what people actually search for.",
      glyph: "search",
    },
    {
      title: "A content calendar you built",
      body: "A month of posts for a real business, planned, designed and scheduled.",
      glyph: "social",
    },
    {
      title: "A report a client would pay for",
      body: "Spend, results, and what you would change next month — written so a business owner understands it.",
      glyph: "growth",
    },
  ],
};

export const syllabus = {
  eyebrow: "Syllabus",
  heading: "Six modules, two weeks each.",
  lead: "Each module ends with a piece of work you keep. The last one is a live project on a real business.",
  modules: [
    {
      number: "01",
      title: "Foundations and strategy",
      body: "What digital marketing actually is, how the channels fit together, and how to decide where a budget should go before spending any of it.",
      topics: [
        "The customer journey, end to end",
        "Choosing channels for a business and a budget",
        "Offer, pricing and positioning",
        "Setting goals you can measure",
      ],
    },
    {
      number: "02",
      title: "Social media marketing",
      body: "Building and running a business presence on Facebook, Instagram and TikTok — content that gets seen and replies that convert.",
      topics: [
        "Content pillars and the monthly calendar",
        "Writing captions and hooks",
        "Basic design in Canva",
        "Community management and DMs",
      ],
    },
    {
      number: "03",
      title: "SEO and content",
      body: "Getting found on Google without paying for the click. Keyword research through to publishing pages that rank.",
      topics: [
        "Keyword research and search intent",
        "On-page SEO",
        "Writing for search and for people",
        "Google Business Profile and local SEO",
      ],
    },
    {
      number: "04",
      title: "Meta ads",
      body: "Facebook and Instagram advertising, from the Business Manager setup to a campaign you tune against real conversions.",
      topics: [
        "Business Manager and the pixel",
        "Campaign objectives and structure",
        "Audiences: cold, warm, retargeting",
        "Creative testing and reading the numbers",
      ],
    },
    {
      number: "05",
      title: "Google Ads and PPC",
      body: "Search, display and shopping campaigns — bidding on the moment someone is already looking to buy.",
      topics: [
        "Account structure and match types",
        "Writing ads that earn the click",
        "Landing pages and Quality Score",
        "Negative keywords and budget control",
      ],
    },
    {
      number: "06",
      title: "Analytics and the live project",
      body: "Measuring what happened and saying it plainly. Then four weeks running a real campaign for a real business.",
      topics: [
        "Google Analytics 4 and conversion tracking",
        "Building a monthly client report",
        "The live client project",
        "Freelancing, rates and finding your first client",
      ],
    },
  ],
};

export const audience = {
  eyebrow: "Who it is for",
  heading: "No marketing background needed.",
  lead: "If you can use a phone and a browser, you can start. What matters is turning up for three months.",
  items: [
    {
      title: "Students and fresh graduates",
      body: "A skill you can be paid for, and a portfolio to show, before you start applying for jobs.",
    },
    {
      title: "Business owners",
      body: "Stop guessing at your own marketing, or stop overpaying someone else to guess at it for you.",
    },
    {
      title: "Career changers",
      body: "Part-time hours, so you can learn the work without leaving the job you have.",
    },
    {
      title: "Freelancers",
      body: "Add paid ads and SEO to what you already sell, and raise what you charge for it.",
    },
  ],
};

// REPLACE — every batch below is invented. If nothing is scheduled yet,
// empty this array: the page then shows a "register interest" band instead
// of advertising dates that do not exist.
export const batches = [
  {
    name: "Morning batch",
    starts: "Starts 1 Ashoj",
    timing: "7:00 – 9:00 am · Sun–Thu",
    seats: "20 seats",
    status: "open",
  },
  {
    name: "Day batch",
    starts: "Starts 1 Ashoj",
    timing: "1:00 – 3:00 pm · Sun–Thu",
    seats: "20 seats",
    status: "filling",
  },
  {
    name: "Evening batch",
    starts: "Starts 15 Ashoj",
    timing: "6:00 – 8:00 pm · Sun–Thu",
    seats: "20 seats",
    status: "open",
  },
];

export const batchesSection = {
  eyebrow: "Batches",
  heading: "Pick the hours that fit your day.",
  lead: "Same course, same instructor, three timings. Seats are held in the order enquiries arrive.",
  // Shown instead of the table when `batches` is empty
  emptyHeading: "The next batch is being scheduled.",
  emptyBody: "Leave your details and we will tell you the dates and the fee as soon as they are confirmed — before the seats are opened publicly.",
};

// REPLACE — instructor name, background and figures
export const instructor = {
  eyebrow: "Who teaches it",
  heading: "Taught by people still running campaigns.",
  name: "Placeholder Name",
  role: "Lead instructor · Digital World Pvt.Ltd",
  bio: [
    "The course is taught by the same team that runs client campaigns at the agency. That means the examples are live accounts from this month, not slides from three years ago.",
    "Class sizes are kept small enough that your work gets looked at individually every week.",
  ],
  points: [
    "Real client accounts used as teaching material",
    "Weekly one-to-one feedback on your work",
    "Best students considered for agency internships",
  ],
};

export const faq = {
  eyebrow: "Questions",
  heading: "Before you enrol.",
  items: [
    {
      q: "Do I need a marketing background?",
      a: "No. The course starts from what digital marketing is and builds up. What you do need is a laptop and the time to turn up five days a week for three months.",
    },
    {
      q: "Do I need my own laptop?",
      a: "Yes, for the practical work. Most of the tools we teach run in a browser, so anything that runs Chrome comfortably is enough.",
    },
    {
      q: "Will I have to spend my own money on ads?",
      a: "No. Ad spend for the practical modules is covered — you work on accounts we provide. If you want to run your own campaign alongside, we will help you plan it.",
    },
    {
      q: "Is the certificate recognised?",
      a: "It is a Digital World Pvt.Ltd certificate awarded on completing the final live project. What gets you hired is the portfolio you build alongside it, which is why the course is built around real work.", // REPLACE if you hold an accreditation
    },
    {
      q: "What if I miss a class?",
      a: "Sessions are recorded and shared with your batch, and the instructor holds a weekly catch-up slot. Miss more than a fortnight and we will move you to the next batch rather than let you fall behind.", // REPLACE — real policy
    },
    {
      q: "Do you help with jobs afterwards?",
      a: "We help with your portfolio, your CV and interview practice, and the strongest students each batch are considered for internships at the agency. We do not promise placement, and you should be wary of anyone who does.", // REPLACE — real policy
    },
  ],
};

export const enrol = {
  eyebrow: "Enrol",
  heading: "Hold a seat in the next batch.",
  lead: "Send your details and we will call you back within one working day with the fee, the start date, and what to bring on day one. No payment at this stage.",
};
