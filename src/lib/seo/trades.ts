/**
 * Search copy for the trade pages (/pool-service, /fence, /landscaping): title tag, meta
 * description, and FAQ (rendered on the page and as FAQPage JSON-LD).
 *
 * Keyword targets come from docs/SEO.md. Rules: no competitor prices, no numbers we can't back,
 * no promises the product doesn't keep.
 */
import type { LiveTradeId } from "../trades";

export type TradeSeo = {
  /** <title>, before the layout's " | PatioPing" */
  title: string;
  description: string;
  /** Short label above the H1, carries the head keyword */
  eyebrow: string;
  /** One paragraph under "What a permit lead is", written for the head keyword */
  explainer: string;
  faqs: { q: string; a: string }[];
  /** Guide that goes deeper on this trade (internal link) */
  guide: { slug: string; label: string };
  targets: string[];
};

export const TRADE_SEO: Record<LiveTradeId, TradeSeo> = {
  pool_service: {
    title: "Pool Service Leads From New Pool Permits, Every Morning",
    description:
      "Pool service leads from new pool and spa permits in your zip codes: address, job value and builder, emailed at 7 AM. Flat monthly price, 7 days free.",
    eyebrow: "Pool service leads",
    explainer:
      "A new pool permit is the earliest public sign that a homeowner will soon need weekly pool service. PatioPing reads the permits your city publishes every day, keeps the new pools and spas, and sends you the ones in your zip codes with the address, the job value and the pool builder where the city lists it. You reach the owner while the pool is still being built, before anyone else has offered to service it.",
    faqs: [
      {
        q: "What is a pool service lead from a permit?",
        a: "It is a new pool or spa that a city has just issued a building permit for, in a zip code you serve. The permit is a public record with the street address, the type of work, the issue date and usually the job value and builder. The owner will need start-up, weekly cleaning and repairs once the pool is filled.",
      },
      {
        q: "How is this different from Angi or Thumbtack pool service leads?",
        a: "Marketplace leads are homeowners who are already shopping, and the same request is often sent to several companies, each paying per lead. Permit leads are every new pool in your zip codes, found before the owner starts shopping, for one flat monthly price. Many pool companies use both.",
      },
      {
        q: "Is pool permit data public?",
        a: "Yes. Issued building permits are public records, and many US cities publish them on official open-data portals. PatioPing only uses those official sources. We don't publish or sell homeowner names, phone numbers or emails.",
      },
      {
        q: "Can I just buy a list of pool owners instead?",
        a: "Data brokers sell lists of homes that already have a pool, built from property and marketing records. Those tell you who has a pool, often one that is already under a service contract. A new pool permit tells you who is getting a pool right now, which is when the service decision gets made.",
      },
      {
        q: "Do you count pool repairs and demolitions?",
        a: "We leave out pool demolitions and fill-ins. New pools, spas and pool rebuilds are kept, because each one needs start-up and ongoing service.",
      },
    ],
    guide: { slug: "pool-service-customers-from-new-pool-permits", label: "How to get pool service customers from new pool permits" },
    targets: ["pool service leads", "pool permit leads", "new pool permits", "pool permit data", "new pool owners", "pool cleaning leads"],
  },
  fence: {
    title: "Fence Leads From New Fence Permits for Fence Contractors",
    description:
      "Fence contractor leads from new fence permits in your zip codes: privacy fences, masonry walls and screen walls, emailed at 7 AM. 7 days free.",
    eyebrow: "Fence contractor leads",
    explainer:
      "When a homeowner files a fence permit, the job is real: they have a plan, a property line and usually a budget. PatioPing reads the permits your city publishes every day, keeps the fences, masonry walls and screen walls, and sends you the new ones in your zip codes with the address and job value. You can quote, offer a second bid, or follow up on gates and repairs while the project is fresh.",
    faqs: [
      {
        q: "Does every fence need a permit?",
        a: "No. Rules vary by city. Many require a permit only above a certain height, for masonry or retaining walls, in front yards, or for pool barriers. That means permit data shows the larger fence jobs, which are the ones most worth quoting.",
      },
      {
        q: "What do fence permit leads include?",
        a: "The street address and zip, the type of work, the issue date, and the job value and builder where the city publishes them. We don't publish or sell homeowner names, phone numbers or emails.",
      },
      {
        q: "Do you include temporary construction fences?",
        a: "No. Temporary site fences, tree-protection fences and silt fences are filtered out. They are part of a construction site, not a homeowner's fence job.",
      },
      {
        q: "How is this different from buying fence leads per lead?",
        a: "Pay-per-lead services sell homeowner requests, often to several contractors at once. Permit leads cover every permitted fence job in your area for one flat monthly price, including ones where the homeowner hasn't picked an installer yet.",
      },
    ],
    guide: { slug: "fence-contractor-leads-from-permits", label: "Fence contractor leads: finding new fence jobs in permit data" },
    targets: ["fence leads", "fence contractor leads", "fence permit leads", "fencing company lead generation", "new fence permits"],
  },
  landscaping: {
    title: "Landscaping, Patio & Deck Leads From New Permits",
    description:
      "Landscaping and outdoor leads from new patio cover, deck, pergola, outdoor kitchen and retaining wall permits in your zip codes, emailed at 7 AM.",
    eyebrow: "Landscaping, patio and deck leads",
    explainer:
      "Covered patios, decks, pergolas, outdoor kitchens and retaining walls usually need a building permit, and each one starts a backyard project: planting, irrigation, lighting and upkeep come next. PatioPing reads the permits your city publishes every day, keeps the outdoor projects, and sends you the new ones in your zip codes with the address and job value.",
    faqs: [
      {
        q: "Which permits count as outdoor projects?",
        a: "Patio covers and covered patios, decks, pergolas, gazebos, outdoor kitchens, pavers and hardscape, and retaining walls. We leave out new houses and whole-house remodels that only mention a patio as one feature, because the home builder already does that work.",
      },
      {
        q: "Do patios and decks need a permit?",
        a: "It depends on the city. Raised decks, patio covers attached to the house, and outdoor kitchens with gas or electric work usually need one. Flat pavers and small ground-level patios often don't. So permit data shows the larger, structural outdoor jobs.",
      },
      {
        q: "Who uses outdoor permit leads?",
        a: "Landscapers, irrigation and lighting installers, deck and patio builders looking for second-phase work, and outdoor kitchen and pergola companies.",
      },
      {
        q: "Do you publish homeowner details?",
        a: "No. Leads show the address, the work and the job value from the public permit. We don't publish or sell homeowner names, phone numbers or emails.",
      },
    ],
    guide: { slug: "landscaping-leads-from-patio-deck-permits", label: "Landscaping leads from patio, deck and pergola permits" },
    targets: ["landscaping leads", "patio contractor leads", "deck builder leads", "pergola leads", "outdoor kitchen leads", "hardscape leads"],
  },
};
