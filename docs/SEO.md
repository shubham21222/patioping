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

## 2. Keyword map

| Intent | Target queries | Page |
|---|---|---|
| Buy, city | new pool permits [city], [city] pool permit leads, new fence permits [city], patio permits [city] | `/pool-service/austin-tx`, `/fence/austin-tx`, `/landscaping/austin-tx` … |
| Buy, trade | pool permit leads, pool service leads, fence leads, landscaping leads from permits | `/pool-service`, `/fence`, `/landscaping` |
| Buy, general | building permit leads, permit alerts for contractors, new construction leads | `/` |
| Compare | construction monitor alternative, shovels alternative, permit lead services compared | `/alternatives` |
| Learn | how to get pool service customers, how to find new pool construction, are building permits public | `/guides/*` |

## 3. What's built (Nov 2026)

- **City × trade pages** `/{trade}/{city}`: live 30-day count, median job value, 12-week chart and busiest zips
  from `city_stats()`; per-city FAQ; BreadcrumbList + FAQPage JSON-LD. **`noindex` and left out of the
  sitemap until the city has real permits**, so we never publish thin pages. Cities come from
  `src/lib/ingest/configs.ts` (Austin, Orlando today).
- **Trade pages** link to every city page; footer links to cities, guides and comparison (internal links).
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
6. Listings: Capterra/G2/GetApp (free listings), Product Hunt, pool-service Facebook groups and forums
   (value-first posts, per the plan), pool trade association directories.

## 5. Rules

- No fabricated numbers, customers or reviews. Counts on city pages come from the database or the page says
  "launching".
- No competitor prices or feature claims unless verified on their site and dated.
- No homeowner names, phones or emails on public pages (some sources publish them; we don't map them).
