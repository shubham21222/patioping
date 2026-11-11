# PatioPing SEO plan

Researched Nov 2026 with web search. No keyword-volume tool was available, so priorities below come from
**search intent and what competitors rank with**, not measured volumes. Check volumes in Google Search
Console (after launch) or a keyword tool before writing more pages.

## 1. Who ranks today, and with what

| Competitor | What ranks | Angle we can beat |
|---|---|---|
| [Construction Monitor](https://shop.constructionmonitor.com/pool-permit-data/) | "Pool Permit Data & Leads" product page | Old, broad, sold by market + category. We're pool/backyard-only, daily, with a CRM |
| [Apify actors](https://apify.com/leadsignal-data/austin-new-construction-permits/examples/austin-new-pool-permits) | **City pages**: "Austin New Swimming Pool Permits", "Mesa AZ New Swimming Pool Permits" | Shows city × trade queries get traffic. Ours are for non-technical buyers, with real counts |
| [PermitSignal](https://permitsignal.connorbuck.com/) | "New construction leads for North DFW pool & landscape companies", free tier → $49/mo | Single region. We cover more cities and three trades |
| [Permit Leads Pro](https://permitleadspro.com/) | Pool vendors, Austin metro | Same city as us: win with live counts + better page depth |
| [Permit Feeds](https://permitfeeds.com/) | Utah, pool/fence/barrier scoring | Different region |
| [Permit Ledger](https://permitledger.com/blog/building-permit-database-comparison) | **Comparison content**: "Shovels vs BuildZoom vs Construction Monitor", "Construction Monitor pricing vs …" | Comparison queries are worth a page: we have `/alternatives` |
| [ScoutData](https://scoutdata.com/guides/buildzoom-alternatives) | "BuildZoom alternatives", "PermitStack alternatives" guides | Same: alternatives intent |
| [Shovels](https://www.shovels.ai/compare/construction-monitor) | `/compare/*` pages | Enterprise data API, not a direct competitor for small crews |
| [Pool Founder](https://www.poolfounder.com/pool-construction-starts-data) | Data articles for pool service owners (construction starts, market size by state) | Content angle: data-driven articles from our own permit counts |

**Takeaways**
1. City × trade pages are the main battleground ("new pool permits Austin").
2. Comparison/alternatives pages capture people already shopping.
3. Data articles built from our own numbers earn links (Pool Founder model).

### Nov 11 2026 refresh (web search)

- "pool service leads" is crowded with per-lead sellers (99 Calls state pages), marketplaces (Angi,
  Thumbtack) and software blogs (ServiceTitan, Skimmer). Our angle: leads *before* the owner shops, flat price.
- "pool permit data / pool permit leads": Construction Monitor's product pages.
- "swimming pool owners list / new pool owners": data brokers (Datamangroup) and postcard vendors
  (Cactus Mailing). Nobody explains list vs. permit; we have a guide for it now.
- "fence contractor leads / fencing company lead generation": agency blogs (Kokoquest), UK PlanWatch,
  Levelset per-contractor permit pages. No US fence-permit alert product ranks.
- "landscaping / patio / deck leads from permits": results are city permit-rule pages, no lead product.
  Easy content gap.
- Comparison: CB Insights, vendor `/compare/vs-*` pages, BuildZoom reviews (WebFX, HigherVisibility).

## 2. Keyword map

| Intent | Target queries | Page |
|---|---|---|
| Buy, city | new pool permits [city], [city] pool permit leads, new fence permits [city], patio permits [city] | `/pool-service/austin-tx`, `/fence/austin-tx`, `/landscaping/austin-tx` … |
| Buy, trade | pool service leads, pool permit leads, pool permit data, new pool owners | `/pool-service` (copy in `src/lib/seo/trades.ts`) |
| Buy, trade | fence leads, fence contractor leads, fence permit leads | `/fence` |
| Buy, trade | landscaping leads, patio contractor leads, deck builder leads, pergola / hardscape leads | `/landscaping` |
| Buy, general | building permit leads, permit alerts for contractors, new construction leads | `/` |
| Compare | construction monitor alternative, shovels alternative, permit lead services compared | `/alternatives` |
| Learn | how to get pool service customers | `/guides/pool-service-customers-from-new-pool-permits` |
| Learn | swimming pool owners list, pool owner mailing list, new homeowners with pools | `/guides/swimming-pool-owner-lists-vs-new-pool-permits` |
| Learn | fencing company lead generation, pool fence leads | `/guides/fence-contractor-leads-from-permits` |
| Learn | landscaping leads, deck/patio permit leads | `/guides/landscaping-leads-from-patio-deck-permits` |
| Learn | are building permits public record, building permit search | `/guides/are-building-permits-public-records` |

## 3. What's built (Nov 2026)

- **City × trade pages** `/{trade}/{city}`: live 30-day count, median job value, 12-week chart and busiest zips
  from `city_stats()`; per-city FAQ; BreadcrumbList + FAQPage JSON-LD. **`noindex` and left out of the
  sitemap until the city has real permits**, so we never publish thin pages. Cities come from
  `src/lib/ingest/configs.ts` (Austin, Orlando today).
- **Trade pages** link to every city page; footer links to cities, guides and comparison (internal links).
  Each has a keyword title/description, an explainer, an FAQ, a link to its guide, and BreadcrumbList +
  Service + FAQPage JSON-LD (`src/lib/seo/trades.ts`).
- **Prerendered pages need the OpenNext incremental cache** (`open-next.config.ts`). Without it, every
  `dynamicParams = false` page (trade pages, guides) 404s on Cloudflare.
- **Build with the production site URL.** `.env.local` points at localhost for `next dev`;
  `.env.production.local` (gitignored) sets `NEXT_PUBLIC_SITE_URL=https://patioping.com` for `npm run deploy`,
  otherwise canonicals and the sitemap point at localhost.
- **Guides**: `/guides/pool-service-customers-from-new-pool-permits`,
  `/guides/building-permit-leads-for-contractors` (Article JSON-LD).
- **`/alternatives`**: the four kinds of permit lead tools, no unverified competitor claims or prices.
- **Technical**: title template, canonical URLs, OG image `/og.png`, Organization + SoftwareApplication
  (with plan offers) + FAQPage JSON-LD on `/`, dynamic `sitemap.xml`, `robots.txt` blocking app routes.

## 4. Next, in order

1. **Get data flowing** (Phase 0/1). Every city page stays noindex until permits exist. This is the gate.
2. Add cities as sources go live: Mesa, Los Angeles, Nashville, Miami-Dade (unincorporated), Maricopa
   (unincorporated), Scottsdale, Orlando. Each source adds 3 pages automatically.
3. **Monthly data post**: "New pool permits in Austin, October 2026" from our own counts. Pitch it to local
   pool/landscape associations and local news; this is the main link-earning play.
4. One `/compare/{vendor}` page per competitor **only** with claims checked on their live site that week.
5. Google Search Console + Bing Webmaster: submit `sitemap.xml`, watch which city queries show impressions,
   then deepen those pages first.
   - GSC → Add property → **Domain** → `patioping.com` → verify with the DNS TXT record (Cloudflare can add it
     automatically from the GSC prompt).
   - Sitemaps → submit `https://patioping.com/sitemap.xml`.
   - URL Inspection → Request indexing for `/`, the three trade pages, the city pages and each guide.
   - Bing Webmaster Tools → Import from Google Search Console (also feeds DuckDuckGo and ChatGPT search).
6. Listings: Capterra/G2/GetApp (free listings), Product Hunt, pool-service Facebook groups and forums
   (value-first posts, per the plan), pool trade association directories.

## 5. Rules

- No fabricated numbers, customers or reviews. Counts on city pages come from the database or the page says
  "launching".
- No competitor prices or feature claims unless verified on their site and dated.
- No homeowner names, phones or emails on public pages (some sources publish them; we don't map them).
