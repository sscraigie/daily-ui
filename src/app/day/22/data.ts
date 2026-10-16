/**
 * Day 22 — the Spotlight search index.
 *
 * Everything Spotlight can find lives here: the 100 Daily UI projects
 * (from the portfolio page), macOS apps, mock documents & folders,
 * contacts, and a mini dictionary for "define" lookups.
 */

import type { IconId } from "./icons";

export type ItemKind = "app" | "project" | "document" | "folder" | "contact" | "page";

export type SearchItem = {
  id: string;
  kind: ItemKind;
  title: string;
  /** small gray line under the title in the results list */
  subtitle?: string;
  /** extra searchable words */
  keywords: string[];
  icon: IconId;
  meta: [string, string][];
  /** for projects/pages: route to open on Enter */
  href?: string;
  /** true when a day page actually exists for this project */
  built?: boolean;
  /** special behaviors for a few apps */
  action?: "calculator" | "launchpad" | "spotlight";
};

/* ------------------------- the 100 daily ui projects ---------------------- */

const PROJECT_TITLES: [number, string][] = [
  [1, "Sign Up"],
  [2, "Credit Card Checkout"],
  [3, "Landing Page (Above the Fold)"],
  [4, "Calculator"],
  [5, "App Icon"],
  [6, "User Profile"],
  [7, "Settings"],
  [8, "404 Page"],
  [9, "Music Player"],
  [10, "Social Share"],
  [11, "Flash Message (Success / Error)"],
  [12, "E-Commerce Single Item"],
  [13, "Direct Messaging / Chat"],
  [14, "Countdown Timer"],
  [15, "Onboarding Flow"],
  [16, "Pop-Up / Overlay"],
  [17, "Email Receipt"],
  [18, "Analytics Chart"],
  [19, "Leaderboard"],
  [20, "Location Tracker / Map"],
  [21, "Home Monitoring / Smart Home"],
  [22, "Search Component"],
  [23, "On/Off Switch"],
  [24, "Boarding Pass"],
  [25, "TV App Interface"],
  [26, "Subscribe Form"],
  [27, "Dropdown Menu"],
  [28, "Contact Us Form"],
  [29, "Map View / Pin Drop"],
  [30, "Pricing Table"],
  [31, "File Upload UI"],
  [32, "Crowdfunding Campaign"],
  [33, "Customize Product"],
  [34, "Car Interface / Dashboard"],
  [35, "Blog Post / Article"],
  [36, "Special Offer / Coupon"],
  [37, "Weather App Interface"],
  [38, "Calendar / Date Picker"],
  [39, "Testimonials Carousel"],
  [40, "Recipe UI"],
  [41, "Workout / Fitness App"],
  [42, "To-Do List / Task Management"],
  [43, "Food / Meal Tracker"],
  [44, "Favorite / Bookmark Action"],
  [45, "Info Card / Preview Card"],
  [46, "Invoice UI"],
  [47, "Activity Feed"],
  [48, "Search Results"],
  [49, "Notifications Center"],
  [50, "Job Board / Job Listing"],
  [51, "Press Page"],
  [52, "Dashboard"],
  [53, "Header Navigation"],
  [54, "Confirm Confirmation"],
  [55, "Icon Set"],
  [56, "Breadcrumbs"],
  [57, "Video Player"],
  [58, "Shopping Cart"],
  [59, "Background Pattern"],
  [60, "Workspace / File Upload"],
  [61, "Redeem Coupon"],
  [62, "Workout Tracker"],
  [63, "Best of 20XX / Recap"],
  [64, "User Types / Personas"],
  [65, "Notes Widget"],
  [66, "Statistics / Analytics"],
  [67, "Hotel Booking"],
  [68, "Flight Search"],
  [69, "Trending Topics"],
  [70, "Event Listing"],
  [71, "Scheduling / Calendar"],
  [72, "Image Slider"],
  [73, "Virtual Reality / Augmented Reality"],
  [74, "App Download CTA"],
  [75, "Pre-Order Page"],
  [76, "Loading / Progress State"],
  [77, "Thank You Page"],
  [78, "Security / Authentication"],
  [79, "Itinerary Builder"],
  [80, "Date Picker"],
  [81, "Status Update / Feed Post"],
  [82, "Form Validation State"],
  [83, "Badge / Achievement"],
  [84, "Badge / Trophy Collection"],
  [85, "Pagination Component"],
  [86, "Tooltip"],
  [87, "Tool / Utility Bar"],
  [88, "Avatar / Profile Customizer"],
  [89, "Terms of Service"],
  [90, "Create New Project"],
  [91, "Curated Collection / List"],
  [92, "FAQ Accordion"],
  [93, "Splash Screen"],
  [94, "News / Content Feed"],
  [95, "Product Tour"],
  [96, "Interactive Map"],
  [97, "Game Center / Match Stats"],
  [98, "Advert / Banner"],
  [99, "Categories Navigation"],
  [100, "Redesign / Daily UI Complete"],
];

const BUILT_DAYS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 45, 57]);

const PROJECTS: SearchItem[] = PROJECT_TITLES.map(([day, title]) => {
  const built = BUILT_DAYS.has(day);
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/[\s/-]+/)
    .filter(Boolean);
  return {
    id: `day-${day}`,
    kind: "project" as const,
    title,
    subtitle: `Daily UI · Day ${day}`,
    keywords: [`day ${day}`, `day${day}`, ...words, built ? "built" : "upcoming"],
    icon: "dailyui" as IconId,
    meta: [
      ["Kind", "Daily UI Project"],
      ["Day", `${day} of 100`],
      ["Status", built ? "Built — viewable" : "Coming soon"],
      ["Source", "dailyui.co prompt"],
      ["Where", `/day/${day}`],
    ],
    href: `/day/${day}`,
    built,
  };
});

/* ---------------------------------- apps ---------------------------------- */

type AppDef = {
  id: string;
  name: string;
  icon: IconId;
  action?: SearchItem["action"];
  keywords?: string[];
  size: string;
  category: string;
};

const APPS: AppDef[] = [
  { id: "app-calculator", name: "Calculator", icon: "calculator", action: "calculator", size: "8.4 MB", category: "Utilities" },
  { id: "app-safari", name: "Safari", icon: "safari", keywords: ["browser", "web"], size: "128.2 MB", category: "Internet" },
  { id: "app-mail", name: "Mail", icon: "mail", keywords: ["email", "gmail"], size: "64.1 MB", category: "Productivity" },
  { id: "app-notes", name: "Notes", icon: "notes", keywords: ["memo"], size: "22.7 MB", category: "Productivity" },
  { id: "app-maps", name: "Maps", icon: "maps", keywords: ["directions", "navigation"], size: "214.6 MB", category: "Travel" },
  { id: "app-messages", name: "Messages", icon: "messages", keywords: ["imessage", "chat", "text"], size: "38.9 MB", category: "Social" },
  { id: "app-photos", name: "Photos", icon: "photos", keywords: ["images", "library"], size: "96.3 MB", category: "Creativity" },
  { id: "app-music", name: "Music", icon: "music", keywords: ["itunes", "songs", "player"], size: "88.5 MB", category: "Entertainment" },
  { id: "app-calendar", name: "Calendar", icon: "calendar", keywords: ["events", "ical"], size: "31.2 MB", category: "Productivity" },
  { id: "app-terminal", name: "Terminal", icon: "terminal", keywords: ["shell", "bash", "console"], size: "5.1 MB", category: "Utilities" },
  { id: "app-settings", name: "System Settings", icon: "settings", keywords: ["preferences", "control panel"], size: "12.8 MB", category: "Utilities" },
  { id: "app-reminders", name: "Reminders", icon: "reminders", keywords: ["todo", "tasks"], size: "14.4 MB", category: "Productivity" },
  { id: "app-appstore", name: "App Store", icon: "appstore", keywords: ["install", "apps"], size: "18.9 MB", category: "Utilities" },
  { id: "app-textedit", name: "TextEdit", icon: "textedit", keywords: ["text", "editor", "rtf"], size: "6.2 MB", category: "Productivity" },
  { id: "app-launchpad", name: "Launchpad", icon: "launchpad", action: "launchpad", keywords: ["all apps", "grid"], size: "2.1 MB", category: "Utilities" },
  { id: "app-finder", name: "Finder", icon: "finder", action: "spotlight", keywords: ["files", "file manager"], size: "42.7 MB", category: "Utilities" },
];

const APP_ITEMS: SearchItem[] = APPS.map((app) => ({
  id: app.id,
  kind: "app" as const,
  title: app.name,
  subtitle: "Application",
  keywords: [app.name.toLowerCase(), ...(app.keywords ?? [])],
  icon: app.icon,
  meta: [
    ["Kind", "Application"],
    ["Version", "14.2.1"],
    ["Size", app.size],
    ["Category", app.category],
    ["Where", "/Applications"],
  ],
  action: app.action,
}));

/* -------------------------------- documents -------------------------------- */

type DocDef = {
  id: string;
  name: string;
  icon: IconId;
  kindLabel: string;
  size: string;
  modified: string;
  where: string;
  tags?: string[];
  keywords?: string[];
};

const DOCS: DocDef[] = [
  { id: "doc-lease", name: "Lease Agreement 2026.pdf", icon: "pdf", kindLabel: "PDF Document", size: "1.2 MB", modified: "Oct 2, 2026 at 4:12 PM", where: "~/Documents/contracts", tags: ["Housing"], keywords: ["rent", "apartment", "legal"] },
  { id: "doc-design", name: "Design System Guidelines.pages", icon: "pages", kindLabel: "Pages Document", size: "18.6 MB", modified: "Sep 28, 2026 at 10:03 AM", where: "~/Documents/design", tags: ["Work"], keywords: ["style guide", "components"] },
  { id: "doc-budget", name: "Monthly Budget.numbers", icon: "numbers", kindLabel: "Numbers Spreadsheet", size: "640 KB", modified: "Oct 9, 2026 at 8:47 AM", where: "~/Documents/finance", keywords: ["spreadsheet", "money", "expenses"] },
  { id: "doc-keynote", name: "Spotlight Deep Dive.key", icon: "keynote", kindLabel: "Keynote Presentation", size: "44.1 MB", modified: "Oct 10, 2026 at 6:30 PM", where: "~/Documents/talks", tags: ["Work"], keywords: ["slides", "presentation", "wwdc"] },
  { id: "doc-cover", name: "cover-photo-final-v3.png", icon: "imagedoc", kindLabel: "PNG Image", size: "3.8 MB", modified: "Oct 6, 2026 at 11:58 PM", where: "~/Pictures/screenshots", keywords: ["image", "thumbnail", "export"] },
  { id: "doc-readme", name: "README.md", icon: "markdown", kindLabel: "Markdown Document", size: "4 KB", modified: "Oct 11, 2026 at 9:00 AM", where: "~/daily-ui", keywords: ["docs", "notes"] },
  { id: "doc-invoice", name: "Invoice-2026-014.pdf", icon: "pdf", kindLabel: "PDF Document", size: "88 KB", modified: "Sep 14, 2026 at 1:22 PM", where: "~/Documents/invoices", keywords: ["billing", "freelance"] },
  { id: "doc-archive", name: "daily-ui-backup.zip", icon: "zip", kindLabel: "ZIP Archive", size: "212 MB", modified: "Oct 1, 2026 at 7:15 PM", where: "~/Documents", keywords: ["backup", "archive"] },
  { id: "doc-recipe", name: "weeknight-recipes.pages", icon: "pages", kindLabel: "Pages Document", size: "2.1 MB", modified: "Aug 30, 2026 at 5:40 PM", where: "~/Documents", keywords: ["cooking", "food", "dinner"] },
  { id: "doc-itinerary", name: "Japan Trip Itinerary.numbers", icon: "numbers", kindLabel: "Numbers Spreadsheet", size: "1.9 MB", modified: "Jul 12, 2026 at 9:05 AM", where: "~/Documents/travel", tags: ["Travel"], keywords: ["tokyo", "vacation", "planning"] },
];

const DOC_ITEMS: SearchItem[] = DOCS.map((doc) => ({
  id: doc.id,
  kind: "document" as const,
  title: doc.name,
  subtitle: doc.kindLabel,
  keywords: [doc.name.toLowerCase(), doc.kindLabel.toLowerCase(), ...(doc.keywords ?? []), ...(doc.tags ?? []).map((t) => t.toLowerCase())],
  icon: doc.icon,
  meta: [
    ["Kind", doc.kindLabel],
    ["Size", doc.size],
    ["Modified", doc.modified],
    ["Where", doc.where],
    ["Tags", doc.tags?.join(", ") ?? "—"],
  ],
}));

/* --------------------------------- folders --------------------------------- */

type FolderDef = { id: string; name: string; where: string; items: number; size: string; keywords?: string[] };

const FOLDERS: FolderDef[] = [
  { id: "folder-dailyui", name: "daily-ui", where: "~/dev", items: 104, size: "486 MB", keywords: ["projects", "challenge", "repo"] },
  { id: "folder-screenshots", name: "screenshots", where: "~/Pictures", items: 312, size: "1.4 GB", keywords: ["captures", "shots"] },
  { id: "folder-invoices", name: "invoices", where: "~/Documents", items: 14, size: "9.2 MB", keywords: ["billing"] },
  { id: "folder-design", name: "design assets", where: "~/Documents", items: 86, size: "3.1 GB", keywords: ["figma", "sketch", "fonts"] },
  { id: "folder-travel", name: "travel", where: "~/Documents", items: 23, size: "780 MB", keywords: ["vacation", "trips"] },
  { id: "folder-contracts", name: "contracts", where: "~/Documents", items: 7, size: "12.6 MB", keywords: ["legal", "signed"] },
];

const FOLDER_ITEMS: SearchItem[] = FOLDERS.map((f) => ({
  id: f.id,
  kind: "folder" as const,
  title: f.name,
  subtitle: `Folder — ${f.where}`,
  keywords: [f.name.toLowerCase(), f.where, ...(f.keywords ?? [])],
  icon: "folder" as IconId,
  meta: [
    ["Kind", "Folder"],
    ["Items", String(f.items)],
    ["Size", f.size],
    ["Where", f.where],
    ["Modified", "Oct 10, 2026 at 3:32 PM"],
  ],
}));

/* --------------------------------- contacts -------------------------------- */

const CONTACT_ITEMS: SearchItem[] = [
  {
    id: "contact-spencer",
    kind: "contact",
    title: "Spencer Craigie",
    subtitle: "Daily UI Challenge",
    keywords: ["spencer craigie", "spencer", "craigie", "me"],
    icon: "contact",
    meta: [
      ["Email", "spencer@dailyui.dev"],
      ["Phone", "(206) 555-0147"],
      ["City", "Seattle, WA"],
      ["Notes", "Building 100 UIs in 100 days"],
    ],
  },
  {
    id: "contact-ava",
    kind: "contact",
    title: "Ava Thompson",
    subtitle: "Design Systems Lead",
    keywords: ["ava thompson", "ava", "designer"],
    icon: "contact",
    meta: [
      ["Email", "ava@studioform.co"],
      ["Phone", "(415) 555-0192"],
      ["City", "San Francisco, CA"],
      ["Notes", "Met at SF Design Week"],
    ],
  },
  {
    id: "contact-marcus",
    kind: "contact",
    title: "Marcus Lee",
    subtitle: "Frontend Engineer",
    keywords: ["marcus lee", "marcus", "engineer"],
    icon: "contact",
    meta: [
      ["Email", "marcus.lee@hey.com"],
      ["Phone", "(512) 555-0110"],
      ["City", "Austin, TX"],
      ["Notes", "TypeScript questions → Marcus"],
    ],
  },
];

/* ---------------------------------- pages ---------------------------------- */

const PAGE_ITEMS: SearchItem[] = [
  {
    id: "page-portfolio",
    kind: "page",
    title: "Portfolio",
    subtitle: "Browse all 100 days",
    keywords: ["portfolio", "all projects", "index", "gallery", "overview"],
    icon: "dailyui",
    meta: [
      ["Kind", "Site Page"],
      ["Contains", "100 projects"],
      ["Where", "/portfolio"],
    ],
    href: "/portfolio",
  },
  {
    id: "page-home",
    kind: "page",
    title: "Daily Dev — Home",
    subtitle: "Landing page",
    keywords: ["home", "landing", "daily dev", "start"],
    icon: "dailyui",
    meta: [
      ["Kind", "Site Page"],
      ["Where", "/"],
    ],
    href: "/",
  },
];

/* ------------------------------- dictionary -------------------------------- */

export type Definition = { word: string; phonetic: string; part: string; defs: string[]; example: string };

export const DICTIONARY: Definition[] = [
  { word: "serendipity", phonetic: "/ˌsɛr.ənˈdɪp.ɪ.ti/", part: "noun", defs: ["The occurrence of events by chance in a happy or beneficial way.", "The faculty of finding valuable things not looked for."], example: "“A fortunate stroke of serendipity brought the two friends together.”" },
  { word: "ephemeral", phonetic: "/ɪˈfɛm.ər.əl/", part: "adjective", defs: ["Lasting for a very short time."], example: "“Fashions are ephemeral, but style endures.”" },
  { word: "ubiquitous", phonetic: "/juːˈbɪk.wɪ.əs/", part: "adjective", defs: ["Present, appearing, or found everywhere."], example: "“Smartphones have become ubiquitous.”" },
  { word: "petrichor", phonetic: "/ˈpɛt.rɪ.kɔːr/", part: "noun", defs: ["A pleasant smell that frequently accompanies the first rain after a long period of warm, dry weather."], example: "“The petrichor rose from the pavement as the storm broke.”" },
  { word: "halcyon", phonetic: "/ˈhæl.si.ən/", part: "adjective", defs: ["Denoting a period of time that was idyllically happy and peaceful."], example: "“The halcyon days of his youth.”" },
  { word: "mellifluous", phonetic: "/məˈlɪf.lu.əs/", part: "adjective", defs: ["Sweet-sounding; pleasant to hear."], example: "“Her mellifluous voice filled the hall.”" },
  { word: "effervescent", phonetic: "/ˌɛf.ərˈvɛs.ənt/", part: "adjective", defs: ["Vivacious and enthusiastic.", "(Of a liquid) giving off bubbles; fizzy."], example: "“An effervescent host greeted every guest.”" },
  { word: "quintessential", phonetic: "/ˌkwɪn.tɪˈsɛn.ʃəl/", part: "adjective", defs: ["Representing the most perfect or typical example of a quality or class."], example: "“A quintessential autumn afternoon.”" },
  { word: "zeitgeist", phonetic: "/ˈzaɪt.ɡaɪst/", part: "noun", defs: ["The defining spirit or mood of a particular period of history."], example: "“The film captured the zeitgeist of the 1990s.”" },
  { word: "saudade", phonetic: "/saʊˈdɑː.də/", part: "noun", defs: ["A Portuguese word for a deep emotional state of nostalgic longing for something absent."], example: "“Music was full of saudade for the village he left behind.”" },
  { word: "luminous", phonetic: "/ˈluː.mɪ.nəs/", part: "adjective", defs: ["Bright or shining, especially in the dark.", "Full of light; radiant."], example: "“A single luminous star hung above the ridge.”" },
  { word: "sonder", phonetic: "/ˈsɒn.dər/", part: "noun", defs: ["The realization that each random passerby is living a life as vivid and complex as your own."], example: "“Rush hour was an orchestra of sonder.”" },
];

/* ------------------------------ full index --------------------------------- */

export const SEARCH_INDEX: SearchItem[] = [...APP_ITEMS, ...PAGE_ITEMS, ...FOLDER_ITEMS, ...DOC_ITEMS, ...CONTACT_ITEMS, ...PROJECTS];

export const getItem = (id: string): SearchItem | undefined => SEARCH_INDEX.find((i) => i.id === id);

/** A handful of examples surfaced in the empty state as tappable chips. */
export const EXAMPLE_CHIPS = ["day 12", "2+2*10", "100 usd to eur", "define serendipity", "lease", "72 f to c"];

/** Apps pinned to "Siri Suggestions" in the empty state. */
export const SUGGESTED_APP_IDS = ["app-calculator", "app-safari", "app-notes", "app-terminal", "app-music"];
