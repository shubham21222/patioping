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

## Design

Direction "Waterline": deep pool water for the hero, a mosaic waterline band, pale concrete deck for working screens, depth-marker numerals (Archivo, semi-condensed) for counts and prices. Sun yellow marks high-value leads only. Light theme because crews use it on a phone in full sun.
