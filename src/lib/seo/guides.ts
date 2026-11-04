export type Block =
  | { p: string }
  | { h2: string }
  | { ul: string[] }
  | { quote: string; note?: string }
  | { cta: true };

export type Guide = {
  slug: string;
  title: string;
  /** <title> and meta description */
  seoTitle: string;
  description: string;
  /** Keywords this page is written for (kept for docs/SEO.md and internal planning) */
  targets: string[];
  updated: string; // YYYY-MM-DD
  readMinutes: number;
  body: Block[];
  sources?: { label: string; url: string }[];
};

export const GUIDES: Guide[] = [
  {
    slug: "pool-service-customers-from-new-pool-permits",
    title: "How to get pool service customers from new pool permits",
    seoTitle: "How to Get Pool Service Customers From New Pool Permits",
    description:
      "New pool permits are public records. Here is how pool service companies find them, when to reach out, what to send, and the outreach rules to respect.",
    targets: ["how to get pool service customers", "pool service leads", "new pool permits", "pool cleaning customers"],
    updated: "2026-11-04",
    readMinutes: 6,
    body: [
      { p: "By the time a homeowner pulls a permit for a new pool, they have already chosen a builder. What most of them have not chosen yet is who will clean and maintain the pool once it is filled. That gap is the opening for a pool service company, and the permit is how you find out about it." },
      { h2: "Why a new pool is a better lead than most" },
      { ul: [
        "It is a recurring customer, not a one-off job: weekly service, chemicals and repairs for as long as they own the pool.",
        "The homeowner has just spent real money on the pool, so they care about keeping it in shape.",
        "Few competitors are in front of them yet. The builder is busy building; the service decision often comes later.",
      ] },
      { h2: "Where new pool permits come from" },
      { p: "Most US cities and some counties publish issued building permits on an open-data portal. Each record usually includes the permit number, the street address, the type of work, the issue date and the estimated job value. Many also include the contractor, though some cities, such as Los Angeles, do not publish that field." },
      { p: "You can search these portals yourself. Filter by work type or description for words like pool, spa, gunite or shotcrete, and sort by issue date. The catch is doing it every week, for every city you serve, and cleaning out the noise: public pool repairs, pool demolitions, and permits that mention a “space” or a “carpool”." },
      { h2: "When to reach out" },
      { p: "Building a new in-ground pool usually takes several weeks to a few months, depending on the type of pool, weather and inspections. Two touches tend to work better than one:" },
      { ul: [
        "Soon after the permit is issued: a short postcard so they know your name before they decide.",
        "Near the end of the build: a second card offering start-up, the first chemical balance or a first-month price.",
      ] },
      { h2: "What to send" },
      { quote: "Congrats on the new pool at [street]. When it’s filled, we’ll handle the start-up and weekly service so you can just swim. First month at [price]. Call or text [number].", note: "A postcard works well: it reaches the address on the permit and doesn’t need a phone number." },
      { p: "Keep it short, local and specific to their address. Mention the neighborhood you already service if you can." },
      { h2: "Outreach rules to respect" },
      { p: "Permits are public records, but how you contact people is regulated. Automated calls and texts to consumers are restricted under the federal Telephone Consumer Protection Act, and many numbers are on the Do Not Call registry. Mail to the property address is the common, low-risk route. Rules vary by state, so check with a professional for your situation. This guide is not legal advice." },
      { h2: "Track every address" },
      { p: "Most small pool companies lose leads in a notebook or a group text. Whatever you use, keep one list with the address, the date you reached out, the next follow-up and the outcome. When a lead turns into a customer, write down the monthly price. After a few months you will know exactly what permit leads are worth to you." },
      { cta: true },
    ],
    sources: [
      { label: "FCC: Telephone Consumer Protection Act", url: "https://www.fcc.gov/general/telemarketing-and-robocalls" },
      { label: "City of Austin open data portal", url: "https://data.austintexas.gov" },
    ],
  },
  {
    slug: "building-permit-leads-for-contractors",
    title: "Building permit leads: a practical guide for contractors",
    seoTitle: "Building Permit Leads for Contractors: What They Are and How to Use Them",
    description:
      "What is in a building permit record, which permits point to work for pool, fence and landscaping companies, where the data comes from, and its limits.",
    targets: ["building permit leads", "permit leads for contractors", "construction leads from permits", "fence leads", "landscaping leads"],
    updated: "2026-11-04",
    readMinutes: 7,
    body: [
      { p: "A building permit is the city’s record that work is about to happen at an address. For a contractor, it is an early signal: someone is spending money on their property, and the permit often points to the next trade they will need." },
      { h2: "What a permit record usually contains" },
      { ul: [
        "Permit number and type (building, electrical, pool, fence)",
        "Street address, and often a parcel number and coordinates",
        "A short description of the work",
        "Estimated job value",
        "Issue date and status",
        "The contractor on the permit, where the city publishes it",
      ] },
      { p: "Fields vary a lot by city. Some publish the contractor and their license; some leave it out. Some counties only publish permits for unincorporated areas, so homes inside city limits are missing. Always check what a source actually covers before you rely on it." },
      { h2: "Which permits point to which jobs" },
      { ul: [
        "New pool or spa: weekly pool service, a pool fence or barrier, landscaping, lighting and patio work around it.",
        "Fence or wall: the homeowner is investing in the yard, often alongside a pool or new landscaping.",
        "Patio, deck, pergola, outdoor kitchen or retaining wall: planting, irrigation, lighting and ongoing yard care.",
      ] },
      { h2: "Where permit data comes from" },
      { p: "The source is the city or county. Many publish permits on open-data platforms such as Socrata or ArcGIS, which offer downloads and APIs. Others only have a search page, publish a monthly report, or share data on request." },
      { p: "On top of that, a few kinds of services exist: permit data APIs built for software teams, lead subscriptions sold by market and category, scrapers that pull raw records from city portals, and alert tools built for one trade. They differ in freshness, coverage and how much cleanup you have to do yourself." },
      { h2: "Freshness matters" },
      { p: "Permit leads lose value as the job moves along. A permit seen the day after it is issued gives you time to get in front of the homeowner; one seen two months later may already be spoken for. Ask any source how often it updates, and how long the city takes to publish." },
      { h2: "Reaching homeowners the right way" },
      { p: "Use permits to decide where to spend your marketing, then reach out by mail or in person. Automated calls and texts to consumers are restricted by federal law, so avoid cold texting numbers from a list. This is general information, not legal advice." },
      { cta: true },
    ],
    sources: [
      { label: "FCC: Telephone Consumer Protection Act", url: "https://www.fcc.gov/general/telemarketing-and-robocalls" },
    ],
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
