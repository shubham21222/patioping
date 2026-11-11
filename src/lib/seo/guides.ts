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
  {
    slug: "swimming-pool-owner-lists-vs-new-pool-permits",
    title: "Swimming pool owner lists vs. new pool permits",
    seoTitle: "Swimming Pool Owner Lists vs. New Pool Permits: Which Finds Customers?",
    description:
      "Pool owner mailing lists tell you who has a pool. New pool permits tell you who is getting one. How each works, what they cost you in wasted mail, and when to use which.",
    targets: ["swimming pool owners list", "pool owner mailing list", "new pool owners list", "new homeowners with pools", "pool service direct mail"],
    updated: "2026-11-11",
    readMinutes: 5,
    body: [
      { p: "If you run a pool service company, you have probably been offered a “pool owner list”: thousands of addresses of homes with a pool, ready for a postcard campaign. It is a reasonable product, but it answers a different question from a new pool permit. Knowing the difference saves a lot of postage." },
      { h2: "What a pool owner list is" },
      { p: "Data brokers build these lists from property records, aerial imagery and marketing data, then sell them by area, home value or home age. Some offer a “new homeowners with a pool” segment: people who recently bought a house that already has one." },
      { ul: [
        "Good for: broad seasonal campaigns, and reaching people who just moved into a house with a pool.",
        "Weak spot: most homes on the list have had their pool for years, and many already have a service company they are happy with.",
        "Freshness: depends on how often the broker updates, which is worth asking before you buy.",
      ] },
      { h2: "What a new pool permit is" },
      { p: "A building permit for a new pool is issued before the pool is dug. It is a public record with the address, the work, the date and usually the job value and builder. The owner has just committed to the pool and, in most cases, hasn’t chosen who will maintain it." },
      { ul: [
        "Good for: reaching owners at the moment they make the service decision, with almost no competition.",
        "Weak spot: volume is lower than a list. Even a big pool market issues new pool permits by the dozen each week, not by the thousand.",
        "Freshness: as fresh as the city’s publishing schedule. Some large cities update their open data daily.",
      ] },
      { h2: "Which one to use" },
      { p: "They work best together. Use permits as your always-on pipeline: every new pool in your zip codes gets a card soon after the permit and a second one near the end of the build. Use an owner list for one or two seasonal pushes, like the weeks before pool season opens, and for new movers." },
      { h2: "Make every postcard count" },
      { ul: [
        "Mention the street or neighborhood. “Congrats on the new pool on Ridgeview Dr” beats “Need pool service?”.",
        "Offer something specific to a new pool: start-up, the first chemical balance, or a first-month price.",
        "Track which addresses you mailed and which called back. After a season you will know what each source is worth.",
      ] },
      { p: "Mail to the property address is the low-risk way to reach homeowners. Automated calls and texts to consumers are restricted under federal law, so don’t cold text numbers from a purchased list. This is general information, not legal advice." },
      { cta: true },
    ],
    sources: [
      { label: "USPS Every Door Direct Mail", url: "https://www.usps.com/business/every-door-direct-mail.htm" },
      { label: "FCC: Telephone Consumer Protection Act", url: "https://www.fcc.gov/general/telemarketing-and-robocalls" },
    ],
  },
  {
    slug: "fence-contractor-leads-from-permits",
    title: "Fence contractor leads: finding new fence jobs in permit data",
    seoTitle: "Fence Contractor Leads: How to Find New Fence Jobs in Permit Data",
    description:
      "Which fence jobs need a permit, what a fence permit record tells you, how pool barrier rules create fence work, and how fence companies turn permits into quotes.",
    targets: ["fence contractor leads", "fence leads", "fencing company lead generation", "fence permit leads", "new fence permits", "pool fence leads"],
    updated: "2026-11-11",
    readMinutes: 5,
    body: [
      { p: "Most fence leads are bought one at a time: a homeowner fills in a form, and several installers get the same request. Permit data works the other way around. It shows you the fence jobs that are already planned in your area, including ones where the homeowner hasn’t picked an installer, for the cost of reading the records." },
      { h2: "Which fences need a permit" },
      { p: "It depends on the city, but the pattern is similar in most places. A permit is commonly required for:" },
      { ul: [
        "Fences above a set height, often somewhere around 6 to 8 feet, or any fence in a front yard over a lower limit",
        "Masonry, stone and screen walls, and retaining walls",
        "Barriers around swimming pools and spas",
        "Fences in historic districts or near public right-of-way",
      ] },
      { p: "Low wood or chain-link fences in a back yard are often exempt, so permit data skews toward the larger and higher-value fence jobs. Check your own city’s rules: they are usually on the building department’s website." },
      { h2: "Pool barriers are fence work" },
      { p: "Many local codes are based on the International Swimming Pool and Spa Code, which requires a barrier at least 48 inches high around a residential pool, with self-closing, self-latching gates. That means a new pool permit often means a pool fence is coming too. Some homeowners hire the pool builder for it; many hire a fence company." },
      { h2: "What a fence permit record tells you" },
      { ul: [
        "The street address and zip, so you know if it is on your route",
        "The work description, such as “6 ft cedar privacy fence” or “CMU screen wall”",
        "The job value, where the city publishes it",
        "The contractor on the permit, if one is listed. If it is the homeowner, they may still want a second bid or gates installed",
      ] },
      { h2: "Turning permits into jobs" },
      { ul: [
        "Owner-builder permits: offer to quote the install, or the gates and hardware they may not want to do themselves.",
        "Permits with a contractor: offer staining, sealing, gate automation or a maintenance plan after the install.",
        "Masonry and screen walls: these are high-value; a short, specific letter to the address is worth the stamp.",
      ] },
      { p: "Reach out by mail or in person. Automated calls and texts to consumers are restricted under federal law. This is general information, not legal advice." },
      { cta: true },
    ],
    sources: [
      { label: "ICC: International Swimming Pool and Spa Code", url: "https://codes.iccsafe.org/content/ISPSC2021P1" },
      { label: "FCC: Telephone Consumer Protection Act", url: "https://www.fcc.gov/general/telemarketing-and-robocalls" },
    ],
  },
  {
    slug: "landscaping-leads-from-patio-deck-permits",
    title: "Landscaping leads from patio, deck and pergola permits",
    seoTitle: "Landscaping Leads From Patio, Deck and Pergola Permits",
    description:
      "Patio covers, decks, pergolas, outdoor kitchens and retaining walls usually need a permit. How landscapers and outdoor contractors use those permits to find backyard projects early.",
    targets: ["landscaping leads", "patio contractor leads", "deck builder leads", "pergola leads", "outdoor living leads", "hardscape leads"],
    updated: "2026-11-11",
    readMinutes: 5,
    body: [
      { p: "A homeowner who pulls a permit for a covered patio, a deck or an outdoor kitchen is in the middle of a backyard project. The structure is only the first phase: planting, irrigation, lighting, pavers and upkeep usually follow. For a landscaper or an outdoor living contractor, the permit is an early, public signal of exactly that kind of job." },
      { h2: "Which outdoor projects usually need a permit" },
      { ul: [
        "Raised decks, typically above a set height off the ground",
        "Patio covers and covered patios attached to the house",
        "Pergolas, gazebos and other accessory structures over a size limit",
        "Outdoor kitchens with gas, electric or plumbing work",
        "Retaining walls over a set height",
      ] },
      { p: "Ground-level pavers and small flat patios are often exempt, and the thresholds vary by city. Denver, for example, publishes separate rules for residential decks, porches, patios and pergolas. The upshot: permit data shows the larger, structural outdoor projects." },
      { h2: "Filter out the noise" },
      { p: "If you search a city’s permit data for “patio”, most results will be new houses: builders list “covered rear patio” on almost every new single-family permit. Those aren’t landscaping leads; the home builder handles the patio. The useful permits are additions, patio covers, decks and outdoor kitchens on existing homes." },
      { p: "Watch for false matches too. A plain text search for “arbor” finds every address on Harbor Drive, and “deck” finds re-roofs that mention roof decking." },
      { h2: "What to offer" },
      { ul: [
        "Patio cover or pergola: plantings, lighting and ceiling fans or misting once it’s built.",
        "New deck: skirting, planting beds, low-voltage lighting, and a staining schedule.",
        "Outdoor kitchen: hardscape around it, shade, and landscape lighting.",
        "Retaining wall: drainage, planting and erosion control on the terraces.",
      ] },
      { h2: "Timing" },
      { p: "Reach out soon after the permit with a short note, then again as the structure is finishing. That second touch lands when the homeowner is looking at bare dirt around their new patio." },
      { cta: true },
    ],
    sources: [
      {
        label: "Denver: Residential decks, porches, patios and pergolas",
        url: "https://www.denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Community-Planning-and-Development/Plan-Review-Permits-and-Inspections/Single-Family-and-Duplex-Projects/Residential-Decks",
      },
    ],
  },
  {
    slug: "are-building-permits-public-records",
    title: "Are building permits public records?",
    seoTitle: "Are Building Permits Public Records? What Contractors Can See and Use",
    description:
      "Building permits are public records in the US. What a permit record includes, where cities publish them, what is usually left out, and how contractors can use them responsibly.",
    targets: ["are building permits public record", "building permit search", "building permit data", "open data building permits", "how to look up building permits"],
    updated: "2026-11-11",
    readMinutes: 4,
    body: [
      { p: "Yes. In the US, building permits are generally public records under state public records laws. Anyone can look up the permits issued for an address, and many cities go further and publish every permit they issue as open data." },
      { h2: "What you can usually see" },
      { ul: [
        "Permit number, type and status",
        "Street address, and often the parcel number",
        "Description of the work and the estimated job value",
        "Applied, issued and finaled dates",
        "The contractor on the permit, in many cities",
      ] },
      { h2: "What is often left out" },
      { p: "Cities vary. Some don’t publish owner names, or only show them on request. Some leave out the contractor. Counties often only publish permits for unincorporated areas, so homes inside a city show up in the city’s system instead. Plans and drawings are usually not online, even when the permit is." },
      { h2: "Where to look them up" },
      { ul: [
        "The city or county open-data portal, if it has one. Cities such as Austin, Orlando and Mesa publish issued permits as open data you can search and download.",
        "The building department’s permit search page, for one address at a time.",
        "A public records request, for anything that isn’t published.",
      ] },
      { h2: "Using permits responsibly" },
      { p: "Public doesn’t mean anything goes. Use permits to decide where to market, then reach homeowners by mail or in person. Automated calls and texts to consumers are restricted by federal law, and numbers on the Do Not Call registry are off limits for telemarketing. PatioPing doesn’t publish or sell homeowner names, phone numbers or emails. This is general information, not legal advice." },
      { cta: true },
    ],
    sources: [
      { label: "City of Austin: Issued Construction Permits", url: "https://data.austintexas.gov/d/3syk-w9eu" },
      { label: "City of Orlando: Permit Applications", url: "https://data.cityoforlando.net/d/ryhf-m453" },
      { label: "National Do Not Call Registry", url: "https://www.donotcall.gov" },
      { label: "FCC: Telephone Consumer Protection Act", url: "https://www.fcc.gov/general/telemarketing-and-robocalls" },
    ],
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
