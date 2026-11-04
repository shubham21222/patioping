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
  /** Classifier pass 1: lowercase substrings matched against permit type + description */
  keywords: string[];
  /** Substrings that veto a keyword hit (e.g. "pool" in "carpool") */
  exclude?: string[];
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
    exclude: ["carpool", "spanish", "spacing", "space"],
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
        pitch: {
      headline: "New fence permits in your area, every morning.",
      body: "A fence permit means a homeowner is ready to spend, and many local codes require a barrier around new pools. See the address and job value, plus the builder where the city publishes it, while the job is still fresh.",
      why: "Many pool permits bring barrier and gate work with them. You see those too.",
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
    exclude: ["parking deck", "roof deck"],
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

/** Classifier pass 1. Returns matched categories; empty means "ask Haiku" or drop. */
export function classifyByKeywords(text: string): PermitCategory[] {
  const t = text.toLowerCase();
  const hits = new Set<PermitCategory>();
  for (const trade of LIVE_TRADES) {
    // Blank out excluded phrases ("carpool", "parking deck") before matching keywords.
    const clean = (trade.exclude ?? []).reduce((acc, x) => acc.split(x).join(" "), t);
    const matched = trade.keywords.filter((k) => clean.includes(k));
    if (!matched.length) continue;
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
