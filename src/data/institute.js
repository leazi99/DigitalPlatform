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
  eyebrow: "Digital Marketing Academy",
  lines: ["Learn to", "run the", "campaigns"],
  lead: "A 12-week, 8-module hands-on digital marketing course taught by the people who run campaigns for a living. You finish with a portfolio and a live business project, not just a certificate.",
  primaryCta: { label: "Enrol now", href: "#enrol" },
  secondaryCta: { label: "See the syllabus", href: "#syllabus" },
  // REPLACE — all three figures
  ticks: [
    { value: "12", label: "weeks, part-time" },
    { value: "8", label: "modules" },
    { value: "1", label: "live business project" },
  ],
};

// REPLACE — every field below
export const course = {
  title: "Complete Digital Marketing",
  duration: "12 Weeks | 8 Modules",
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
  heading: "By the end of this course, you will be able to plan, launch, manage, and measure a digital marketing campaign independently.",
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

// Each module has:
//   weeks       when it is taught in the 12-week course
//   glyph       the icon drawn on its poster (see ServiceGlyph)
//   poster      the headline printed on its poster
//   tagline     one line under the title
//   body        the overview
//   topics      what students will learn
//   framework   optional — a named method, one step per line as
//               "Letter – Word: what it means"
//   tools       the tools and platforms students use
//   activities  the practical activities and assignments done in class
//   project     the practical project the module ends with
//   practice    the real-world value of the skills
export const syllabus = {
  eyebrow: "Syllabus",
  heading: "8 modules over 12 weeks.",
  lead: "Every module is practical: you learn a skill, use it on a real brand, and finish with a project that goes in your portfolio. The final module is a live project where students apply their digital marketing skills to a real business and prepare a professional performance report.",
  modules: [
    {
      number: "01",
      weeks: "Week 1",
      glyph: "compass",
      poster: "Start with the Strategy",
      title: "Digital Marketing Foundations and Strategy",
      tagline: "Know the map before you spend the money.",
      body: "Students learn how digital marketing really works — how customers discover, compare and buy online, and how each channel plays a part in that journey. They learn to think like a marketer before touching any tool, so every later module has a clear purpose.",
      topics: [
        "Map the customer journey from first click to repeat purchase",
        "Understand how social, search, content, email and ads work together",
        "Define a target audience and build simple buyer personas",
        "Write a clear offer and positioning for a business",
        "Set SMART goals and choose the numbers that prove success",
        "Split a small budget sensibly across channels",
      ],
      tools: ["Google Trends", "Meta Ad Library", "Google Sheets", "Canva"],
      activities: [
        "Map the customer journey of a brand you have bought from",
        "Build two buyer personas for a local business",
        "Split a small monthly budget across channels and explain your choices",
      ],
      project: "Write a one-page digital marketing strategy for a real local business, covering audience, goals, channels and budget.",
      practice: "Before any campaign at work or for a client, you will be able to ask the right questions — who is the customer, what is the goal, where should the money go — and turn the answers into a one-page plan a business owner can approve.",
    },
    {
      number: "02",
      weeks: "Weeks 2–3",
      glyph: "social",
      poster: "Build a Brand People Follow",
      title: "Social Media Marketing",
      tagline: "Show up, stand out, start conversations.",
      body: "Students learn to build and grow a business presence on Facebook, Instagram, TikTok and LinkedIn. The focus is on content that people actually stop for, a consistent posting rhythm, and turning comments and messages into customers.",
      topics: [
        "Choose the right platforms for a brand and its audience",
        "Plan content pillars and a monthly posting calendar",
        "Write hooks and captions that earn attention",
        "Design on-brand posts, carousels and Reels in Canva",
        "Manage comments, DMs and reviews professionally",
        "Read Insights to see what is working and what to change",
      ],
      tools: ["Meta Business Suite", "Instagram", "TikTok", "LinkedIn", "Canva", "CapCut"],
      activities: [
        "Audit a brand's Facebook and Instagram pages and list five improvements",
        "Write ten hooks and captions for one product",
        "Design a carousel and edit a short Reel",
      ],
      project: "Plan, design and schedule two weeks of social media content for a selected brand.",
      practice: "You will be able to take over a company's social media accounts, set a clear content plan, keep the brand voice consistent, and report on growth and engagement every month — one of the most in-demand entry-level skills in marketing.",
    },
    {
      number: "03",
      weeks: "Week 4",
      glyph: "pen",
      poster: "Words That Sell",
      title: "Content Marketing and Copywriting",
      tagline: "Write it clearly. Make them act.",
      body: "Students learn to write marketing copy that is clear, persuasive and true to the brand — from a single ad headline to a full blog post. They learn how good content builds trust over time and moves people from interest to action.",
      topics: [
        "Write headlines, ad copy and calls to action that convert",
        "Plan and write blog posts, emails and landing page copy",
        "Define and keep a consistent brand voice",
        "Tell customer stories and use social proof",
        "Edit your own work for clarity and accuracy",
      ],
      frameworkName: "A.I.D.A.",
      framework: [
        "A – Attention: Stop the scroll with a strong hook.",
        "I – Interest: Show why it matters to the reader.",
        "D – Desire: Make the benefit feel real and personal.",
        "A – Action: Tell them exactly what to do next.",
      ],
      tools: ["Google Docs", "Grammarly", "Hemingway Editor", "WordPress", "Canva"],
      activities: [
        "Rewrite a weak advert using the A.I.D.A. framework",
        "Outline a blog post that answers a real customer question",
        "Peer-edit a classmate's landing page copy",
      ],
      project: "Write a landing page, three ad variations and a welcome email for one product or service.",
      practice: "Every marketing role involves writing. You will be able to write the ad, the post, the email and the web page — and explain to a client why each word is there.",
    },
    {
      number: "04",
      weeks: "Weeks 5–6",
      glyph: "search",
      poster: "Get Found on Google",
      title: "Search Engine Optimisation (SEO)",
      tagline: "Be the answer when customers search.",
      body: "Students learn how search engines decide what to show and how to get a website onto the first page without paying for every click. They work from keyword research through to on-page improvements and local search for Nepali businesses.",
      topics: [
        "Find keywords and understand search intent",
        "Optimise titles, headings, content and images on a page",
        "Fix common technical issues: speed, mobile and indexing",
        "Set up and optimise a Google Business Profile for local search",
        "Earn quality backlinks and mentions",
        "Track rankings and traffic in Google Search Console",
      ],
      tools: ["Google Search Console", "Google Keyword Planner", "Google Business Profile", "PageSpeed Insights", "Ubersuggest"],
      activities: [
        "Research and group keywords for a local service business",
        "Check the on-page SEO of five pages and record the fixes",
        "Optimise a Google Business Profile listing",
      ],
      project: "Carry out an SEO audit of a real website and write an action plan with the ten most valuable fixes.",
      practice: "You will be able to audit a website, find what is holding it back in Google, and make a prioritised list of fixes — a service businesses pay for every month.",
    },
    {
      number: "05",
      weeks: "Week 7",
      glyph: "meta",
      poster: "Turn Scrolls into Sales",
      title: "Meta Ads (Facebook and Instagram Advertising)",
      tagline: "Reach the right people at the right cost.",
      body: "Students learn to plan, launch and improve paid campaigns on Facebook and Instagram — from setting up Business Manager and the pixel to testing creative and reading results. They work on real ad accounts, not screenshots.",
      topics: [
        "Set up Business Manager, ad accounts and the Meta pixel",
        "Choose the right campaign objective for the goal",
        "Build cold, warm and retargeting audiences",
        "Create and test ad creatives and copy",
        "Control budgets and bidding",
        "Read cost per result, ROAS and frequency — and act on them",
      ],
      tools: ["Meta Ads Manager", "Meta Business Manager", "Meta Pixel", "Meta Ad Library", "Canva"],
      activities: [
        "Set up a Business Manager account and install the Meta pixel",
        "Build cold, warm and retargeting audiences for one offer",
        "Read a live campaign report and recommend three changes",
      ],
      project: "Plan and launch a small Meta ad campaign, then report on its results and the changes you would make.",
      practice: "You will be able to run paid social campaigns for a business, spend its money responsibly, and explain clearly what each rupee achieved.",
    },
    {
      number: "06",
      weeks: "Week 8",
      glyph: "spark",
      poster: "Work Smarter with AI",
      title: "AI Tools for Marketers",
      tagline: "Work faster, think sharper, create more.",
      body: "Students will learn how to use artificial intelligence tools to improve the speed, quality, and effectiveness of their digital marketing work. They practise writing clear prompts, use AI to research, draft and design, and learn to check every output before it reaches a customer.",
      topics: [
        "Create advertising copy, blog posts, and marketing content using ChatGPT, Claude, and Gemini",
        "Generate visual content and short videos using AI-powered tools",
        "Conduct keyword research and competitor analysis with AI assistance",
        "Improve content quality, consistency, and brand voice",
        "Use AI responsibly by fact-checking information and reviewing AI-generated content before publishing",
      ],
      frameworkName: "P.A.C.E.",
      framework: [
        "P – Prompt: Give AI clear instructions.",
        "A – Assist: Use AI to support marketing tasks.",
        "C – Check: Verify facts, accuracy, and quality.",
        "E – Evaluate: Review the results and improve the output.",
      ],
      tools: ["ChatGPT", "Claude", "Gemini", "Canva Magic Studio", "CapCut"],
      activities: [
        "Write and compare three prompts for the same advert",
        "Fact-check and edit an AI-written blog post",
        "Produce a short promotional video with AI tools",
      ],
      project: "Create a 30-day AI-powered content calendar for a selected brand.",
      practice: "You will be able to produce more content in less time without losing quality — drafting campaigns, researching competitors and planning content with AI, while keeping the final judgement, facts and brand voice in your own hands.",
    },
    {
      number: "07",
      weeks: "Weeks 9–10",
      glyph: "funnel",
      poster: "Turn Clicks into Customers",
      title: "Marketing Automation and CRM",
      tagline: "Turn clicks into customers, automatically.",
      body: "Students will learn how to build automated marketing systems that capture leads, nurture potential customers, improve follow-ups, and support customer retention. They connect landing pages, a CRM, email and WhatsApp into one journey, so no enquiry is forgotten.",
      topics: [
        "Map the customer journey from first contact to conversion",
        "Understand lead scoring and lead qualification",
        "Create landing pages and lead magnets",
        "Connect landing pages and forms to a CRM, such as HubSpot's free tools where available",
        "Build email marketing sequences using Mailchimp",
        "Plan WhatsApp broadcasts and customer follow-up processes in accordance with applicable consent and messaging rules",
        "Create automated workflows and track campaign performance through reports",
      ],
      frameworkName: "C.N.C.R.",
      framework: [
        "C – Capture: Attract and collect potential customer leads.",
        "N – Nurture: Build relationships through useful content and follow-ups.",
        "C – Convert: Turn qualified leads into customers.",
        "R – Retain: Maintain relationships and encourage repeat business.",
      ],
      tools: ["HubSpot (free CRM)", "Mailchimp", "WhatsApp Business", "Google Forms", "Canva"],
      activities: [
        "Map a C.N.C.R. funnel for a local business",
        "Connect a lead form to a CRM and set up a simple lead score",
        "Write a consent-based WhatsApp follow-up script",
      ],
      project: "Build a working marketing funnel that includes a landing page, a five-email sequence, a WhatsApp follow-up flow, and a one-page performance report.",
      practice: "You will be able to set up the systems that turn enquiries into paying customers — capturing every lead, following up on time without doing it all by hand, and showing a business exactly where its customers come from.",
    },
    {
      number: "08",
      weeks: "Weeks 11–12",
      glyph: "chart",
      poster: "Your Skills. A Real Business. Measurable Results.",
      title: "Analytics and Live Project",
      tagline: "Apply your skills. Measure results. Prove your impact.",
      body: "This is the final module of the course. Students apply the knowledge and skills gained throughout all eight modules by working on a real business project — setting objectives, running the work, measuring the results and presenting a professional performance report.",
      topics: [
        "Set marketing objectives and define key performance indicators (KPIs)",
        "Track website traffic, engagement, leads, conversions, and campaign performance",
        "Interpret marketing data and identify areas for improvement",
        "Evaluate campaign results against the original objectives",
        "Prepare a professional marketing performance report",
        "Present findings and recommend practical next steps for the business",
      ],
      tools: ["Google Analytics 4", "Google Search Console", "Meta Ads Manager", "Looker Studio", "Google Sheets"],
      activities: [
        "Set objectives and KPIs for the live business brief",
        "Build a performance dashboard that tracks those KPIs",
        "Present your findings and recommendations to the class",
      ],
      project: "Work on a real business or an approved live-business brief, apply relevant digital marketing techniques, and produce a final performance report.",
      practice: "You will finish the course with real results you produced for a real business — evidence you can show an employer or a client, and the confidence to plan, run and measure a campaign on your own.",
    },
  ],
};

export const audience = {
  eyebrow: "Who it is for",
  heading: "No marketing background needed.",
  lead: "If you can use a phone and a browser, you can start. What matters is turning up for the full 12 weeks.",
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
    starts: "To be confirmed",
    timing: "1:00 – 3:00 pm · Sun–Thu",
    seats: "20 seats",
    status: "closed",
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
  lead: "Same course, same instructor, different timings. Seats are held in the order enquiries arrive. A closed batch reopens only when a new intake is confirmed.",
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
      q: "How long is the course?",
      a: "Course Duration: 12 Weeks | 8 Modules. Classes run part-time, two hours a day, five days a week. The final module is a live project where students apply their digital marketing skills to a real business and prepare a professional performance report.",
    },
    {
      q: "Do I need a marketing background?",
      a: "No. The course starts from what digital marketing is and builds up. What you do need is a laptop and the time to turn up five days a week for 12 weeks.",
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
