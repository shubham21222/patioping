/**
 * Single source of truth for trades: onboarding, landing, SEO pages, waitlist,
 * and (Phase 1) the permit classifier's first-pass keyword filter.
 */
export type PermitCategory = "pool" | "spa" | "fence" | "landscaping" | "solar" | "roof" | "other";

export type LiveTradeId = "pool_service" | "fence" | "landscaping";
export type SoonTradeId = "solar" | "roofing" | "new_home" | "electrical_hvac";
export type TradeId = LiveTradeId | SoonTradeId;

export type LiveTrade = {
  id: LiveTradeId;
  slug: string; // SEO page path
  name: string;
  short: string; // used in sentences: "new ___ permits"
  icon: "waves" | "fence" | "trees";
  /** How a lead is counted in the app: "3 new pools today" */
  noun: [one: string, many: string];
  /** Recurring service (monthly) or one-off jobs, for "won" value */
  wonValue: "monthly" | "job";
  /** Permit categories this trade receives as leads */
  categories: PermitCategory[];
  /** Classifier pass 1: lowercase whole words or phrases (plural/-ed/-ing forms also match) */
  keywords: string[];
  /** Phrases blanked out before matching (e.g. "parking deck" is not a deck job) */
  exclude?: string[];
  /** The keyword is incidental: the permit is really for something else, so this trade gets no lead */
  veto?: RegExp[];
  pitch: { headline: string; body: string; why: string };
  examples: { work: string; value: number; builder: string }[];
};

export type SoonTrade = {
  id: SoonTradeId;
  name: string;
  icon: "sun" | "roof" | "house" | "plug";
  note: string;
};

export const LIVE_TRADES: LiveTrade[] = [
  {
    id: "pool_service",
    slug: "pool-service",
    name: "Pool service",
    short: "pool and spa",
    icon: "waves",
    noun: ["pool", "pools"],
    wonValue: "monthly",
    categories: ["pool", "spa"],
    keywords: ["pool", "spa", "swimming", "gunite", "shotcrete", "hot tub", "plaster pool"],
    exclude: ["day spa", "med spa", "spa building", "spa salon"],
    // Pool demolitions and fill-ins are the end of a pool, not a new one to service.
    // ("Rebuilding demolished pool [Demolition permit #…]" is a new pool, so no bare "demolition".)
    veto: [
      /\btotal demo\b/,
      /\bpool (removal|demo(lition)?)\b/,
      /\b(demo(lition)? of|remove|removal of|fill(ing)? in|demolish(ing)?)( the| an?| existing)* (in-?ground |swimming )?pool\b/,
      // San Diego County: "DEMOLITION PERMIT FOR 400 SQFT …" (not "[Demolition permit #…]" on a rebuild)
      /\bdemolition permit for\b/,
    ],
    pitch: {
      headline: "Every new pool in your zip codes, the morning it’s permitted.",
      body: "By the time a pool is permitted, the homeowner has picked a builder. They haven’t picked who cleans it. That’s years of weekly service, and you hear about it the morning after the permit is issued.",
      why: "New pools need weekly service, chemicals and repairs from the day they’re filled.",
    },
    examples: [
      { work: "Pool + spa", value: 92000, builder: "Sample Pools Co." },
      { work: "Pool", value: 61000, builder: "Example Pool Builders" },
      { work: "Spa", value: 18200, builder: "Owner-builder" },
    ],
  },
  {
    id: "fence",
    slug: "fence",
    name: "Fence",
    short: "fence",
    icon: "fence",
    noun: ["fence job", "fence jobs"],
    wonValue: "job",
    categories: ["fence"],
    keywords: ["fence", "fencing", "privacy wall", "masonry wall", "screen wall", "garden wall"],
    // Site-protection fences put up during construction are not a homeowner's fence job.
    exclude: [
      "temporary protective fence", "temporary fence", "tree protection fence", "construction fence", "silt fence",
      "pedestrian protection fence", "protection fence",
    ],
    // A new house "with fences" is the home builder's job, not a fence lead.
    veto: [/\bnew (two-family |single-family |residential )?dwelling\b/, /\bnew build\b/],
    pitch: {
      headline: "New fence permits in your area, every morning.",
      body: "A fence permit means a homeowner is ready to spend, and many local codes require a barrier around new pools. See the address and job value, plus the builder where the city publishes it, while the job is still fresh.",
      why: "Fence permits are filed for the bigger jobs: tall privacy fences, masonry walls and pool barriers.",
    },
    examples: [
      { work: "Privacy fence, 180 ft", value: 9800, builder: "Owner-builder" },
      { work: "Pool barrier fence", value: 6400, builder: "Sample Fence Co." },
      { work: "Masonry screen wall", value: 14500, builder: "Example Masonry" },
    ],
  },
  {
    id: "landscaping",
    slug: "landscaping",
    name: "Landscaping & outdoor",
    short: "patio, deck and outdoor",
    icon: "trees",
    noun: ["outdoor project", "outdoor projects"],
    wonValue: "job",
    categories: ["landscaping"],
    keywords: ["patio", "deck", "pergola", "retaining wall", "outdoor kitchen", "gazebo", "arbor", "pavers", "hardscape"],
    exclude: [
      "parking deck", "roof deck", "roof decking", "past decking", "no decking",
      // San Diego County's catch-all scope label, attached to window and drywall jobs too
      "antennas, tennis cts, gazebo",
    ],
    // New homes and whole-house remodels list "covered patio" as one feature among many; the
    // builder already does that work. A patio, deck or pergola permit on its own is the lead.
    veto: [
      /\b\d+\s*-?\s*(bed(room)?s?|br|bath(room)?s?|ba)\b/,
      /\bbed(room)?s?\b.*\bbath(room)?s?\b/,
      /\b(new|construct(ion)?( of)?)( an?)?( \d+(-| )story)? (single[- ]family|sfr|sf res|dwelling|duplex|townhome|condo|home|residence)/,
      /\bsingle[- ]family residential new home\b/,
      /\bnew home construction\b/,
      /\b(full|whole)[- ]house (remodel|renovation)\b/,
      /\binterior remodel\b/,
      /\bre[-:]?\s*roof/,
      /\bnew primary residential\b/,
      // Damage repairs: the patio or deck is just where the damage is
      /\b(damaged framing|termite|dry rot|water damage|fire damage|fire rebuild|re-?stucco|leak)\b/,
      /\bshingles?\b/, // roof decking
      /\bfoundation repair\b/,
      /\bwater heater\b/,
      /\bdwelling units\b/,
    ],
    pitch: {
      headline: "Patios, decks and pergolas, the morning they’re permitted.",
      body: "Hardscape permits are the start of a backyard job, not the end. Plantings, lighting, irrigation and upkeep all come after. Reach the homeowner while the project is still fresh.",
      why: "Every patio and pool needs planting, irrigation and lighting around it.",
    },
    examples: [
      { work: "Covered patio + outdoor kitchen", value: 48000, builder: "Sample Outdoor Co." },
      { work: "Composite deck, 400 sq ft", value: 22500, builder: "Owner-builder" },
      { work: "Retaining wall", value: 12800, builder: "Example Hardscapes" },
    ],
  },
];

export const SOON_TRADES: SoonTrade[] = [
  { id: "solar", name: "Solar", icon: "sun", note: "Reroof and solar permits" },
  { id: "roofing", name: "Roofing & gutters", icon: "roof", note: "Reroof and repair permits" },
  { id: "new_home", name: "New home services", icon: "house", note: "Security, blinds, flooring" },
  { id: "electrical_hvac", name: "Electrical & HVAC", icon: "plug", note: "Panel and system upgrades" },
];

export const isLiveTrade = (v: unknown): v is LiveTradeId => LIVE_TRADES.some((t) => t.id === v);
export const isSoonTrade = (v: unknown): v is SoonTradeId => SOON_TRADES.some((t) => t.id === v);
export const tradeBySlug = (slug: string) => LIVE_TRADES.find((t) => t.slug === slug);
export const tradeById = (id: string) => LIVE_TRADES.find((t) => t.id === id);

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Whole words only, so "arbor" doesn't match "Harbor Dr" and "spa" doesn't match "spacious".
const keywordRe = new Map<string, RegExp>();
const wordMatch = (text: string, k: string) => {
  let re = keywordRe.get(k);
  if (!re) keywordRe.set(k, (re = new RegExp(`\\b${escapeRe(k)}(s|es|ed|ing)?\\b`)));
  return re.test(text);
};

/** Classifier pass 1. Returns matched categories; empty means "ask Haiku" or drop. */
export function classifyByKeywords(text: string): PermitCategory[] {
  const t = text.toLowerCase().replace(/\s+/g, " ");
  const hits = new Set<PermitCategory>();
  for (const trade of LIVE_TRADES) {
    // Blank out excluded phrases ("parking deck") before matching keywords.
    const clean = (trade.exclude ?? []).reduce((acc, x) => acc.split(x).join(" "), t);
    const matched = trade.keywords.filter((k) => wordMatch(clean, k));
    if (!matched.length) continue;
    if (trade.veto?.some((re) => re.test(clean))) continue;
    if (trade.id === "pool_service") {
      const poolWords = matched.some((k) => k !== "spa" && k !== "hot tub");
      if (poolWords) hits.add("pool");
      if (matched.includes("spa") || matched.includes("hot tub")) hits.add("spa");
    } else {
      hits.add(trade.categories[0]);
    }
  }
  return [...hits];
}
