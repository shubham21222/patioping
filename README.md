# PatioPing

New backyard project permit alerts (pools, fences, patios) for contractors. Full product plan: [`docs/PLAN.md`](docs/PLAN.md).

**Stack:** Next.js 15 (App Router) · Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare) · Supabase (Auth + Postgres) · Whop (payments) · Tailwind CSS v4

## Structure

```
src/
  app/
    page.tsx              Landing page
    login/, signup/       Auth pages + server actions (password + magic link)
    auth/callback         PKCE code exchange (email confirm, magic link, OAuth)
    auth/confirm          token_hash verification (custom email templates)
    auth/signout          POST → sign out
    (app)/                Signed-in app (shared shell)
      leads/              Leads inbox, lead detail, CSV export
      onboarding/         Trade (+ waitlist), zip codes, alert time
      settings/billing/   Plans + Whop checkout
    (marketing)/[trade]   SEO pages: /pool-service, /fence, /landscaping
    api/webhooks/whop     Whop membership webhook → orgs.plan
  lib/supabase/           Browser, server, middleware and service-role clients
  lib/whop.ts             Checkout configuration + webhook verification
  lib/trades.ts           Live + coming-soon trades, classifier keywords
  components/brand/       Logo, mark, waterline band
public/brand/             Logo files (SVG + PNG)
  middleware.ts           Session refresh + route protection
supabase/
  migrations/             Database schema + RLS
  seed.sql                Tier-1 jurisdictions
wrangler.jsonc            Cloudflare Worker config
open-next.config.ts       OpenNext adapter config
```

## Setup

### 1. Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. Run the migration: SQL Editor → paste `supabase/migrations/20261104000000_init.sql`, or with the CLI:
   ```bash
   npx supabase link --project-ref YOUR_REF
   npx supabase db push
   ```
3. Auth → URL Configuration: set **Site URL** to `https://patioping.com` and add redirect URLs
   `http://localhost:3000/auth/callback`, `https://patioping.com/auth/callback`, and your `*.workers.dev` URL.

On signup, a database trigger automatically creates an `orgs` row and an owner `profiles` row.

### 2. Whop (payments)
1. In the Whop dashboard create a product with three monthly plans: Starter $49, Growth $149, Pro $299. Copy each `plan_…` id into `WHOP_PLAN_STARTER/GROWTH/PRO`.
2. Create an API key → `WHOP_API_KEY`.
3. Developer → Webhooks → Create webhook, API version **v1**, URL `https://patioping.com/api/webhooks/whop`, events `membership.activated`, `membership.deactivated`, `membership.updated`. Copy the `ws_…` secret → `WHOP_WEBHOOK_SECRET`.
4. Run all migrations in `supabase/migrations/` in order.

Checkout passes `org_id` and `plan` as metadata; the webhook reads them back and updates `orgs.plan` / `plan_status`. Users can't write billing columns themselves.

### 3. Local dev
```bash
cp .env.example .env.local     # fill in Supabase URL + anon key
cp .dev.vars.example .dev.vars # same values, used by `npm run preview`
npm install
npm run dev
```

### 4. Deploy to Cloudflare
```bash
npx wrangler login
npm run deploy
```
`NEXT_PUBLIC_*` vars are inlined at build time, so they must be present in `.env.local` / the build environment when running `npm run deploy` (or set them in Workers Builds → Build variables if deploying from Git).
Server-only secrets:
```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put WHOP_API_KEY
npx wrangler secret put WHOP_WEBHOOK_SECRET
npx wrangler secret put WHOP_PLAN_STARTER   # and _GROWTH, _PRO
```

Custom domain: Cloudflare dashboard → Workers → patioping → Settings → Domains & Routes → add `patioping.com`.

## Scripts
| Script | What it does |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run preview` | Build with OpenNext and run in local Workers runtime |
| `npm run deploy` | Build and deploy to Cloudflare |
| `npm run cf-typegen` | Generate `cloudflare-env.d.ts` for bindings |

## Permit ingest (Phase 1)

Official open-data APIs only (Socrata SODA, ArcGIS REST), no scraping behind logins.

```
src/lib/ingest/
  configs.ts     source registry: endpoint, dataset id, field mapping (single source of truth)
  sources.ts     Socrata + ArcGIS connectors (paging, retries on 429/5xx, polite delays) + discover
  normalize.ts   raw record → permits row, keyword classifier, weekly counts, PII redaction
  enrich.ts      fills missing zips from the US Census Geocoder (Mesa, Orlando have no zip column)
  run.ts         store permits + raw payloads, match leads, record source health
scripts/ingest.ts           CLI
workers/ingest/             Cloudflare cron Worker (daily 09:15 UTC)
supabase/migrations/…_ingest.sql   match_leads(), territory backfill trigger, health columns
```

Only pool, spa, fence and outdoor permits are stored; everything else is dropped. Raw payloads are stored
without owner/applicant names, phones or emails.

Sources: Austin (`3syk-w9eu`), Orlando (`ryhf-m453`), Mesa (`dzpk-hxfb`), Scottsdale (layer URL still needed).

```bash
npm run ingest -- discover austin             # real columns + sample rows: check the mapping
npm run ingest -- dry-run austin --days 90    # weekly counts, no database: Phase 0 go/no-go
npm run ingest -- sync-config                 # write configs.ts into jurisdictions
npm run ingest -- run austin --days 90        # backfill into Supabase and create leads
npm run ingest:deploy                         # deploy the daily cron Worker
npm test                                      # pipeline tests (synthetic fixtures)
```

Adding a source: add it to `configs.ts`, run `discover`, fix the mapping, `dry-run`, then `sync-config` and
`update jurisdictions set status = 'active' where name = '…'`. A source that throws is marked `failing` with
`last_error`; `last_synced_at` and `last_fetched_count` show health.

## Design

Direction "Hill Country mist": pale sky ground, layered blue ridges, white working surfaces. Geist for UI, Instrument Serif italic for one accent word per heading. One blue (`--water`) for actions; sun amber marks high-value leads only. Tokens live in `src/app/globals.css`.

The landscape images in `public/art/` are generated, not stock: `python3 scripts/generate-hills.py public/art` (numpy + Pillow, seeded, so output is reproducible).

- `hills-hero.webp` — hero and auth background
- `hills-front.webp` — transparent foreground ridges that overlap the hero dashboard mock
- `hills-band.webp` — closing CTA background
