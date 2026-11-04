# PatioPing

New pool & backyard permit alerts for contractors. Full product plan: [`docs/PLAN.md`](docs/PLAN.md).

**Stack:** Next.js 15 (App Router) · Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare) · Supabase (Auth + Postgres) · Tailwind CSS v4

## Structure

```
src/
  app/
    page.tsx              Landing page
    login/, signup/       Auth pages + server actions (password + magic link)
    auth/callback         PKCE code exchange (email confirm, magic link, OAuth)
    auth/confirm          token_hash verification (custom email templates)
    auth/signout          POST → sign out
    leads/                Leads inbox (protected)
    onboarding/           Onboarding (protected, Phase 2)
  lib/supabase/           Browser, server and middleware clients (@supabase/ssr)
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

### 2. Local dev
```bash
cp .env.example .env.local     # fill in Supabase URL + anon key
cp .dev.vars.example .dev.vars # same values, used by `npm run preview`
npm install
npm run dev
```

### 3. Deploy to Cloudflare
```bash
npx wrangler login
npm run deploy
```
`NEXT_PUBLIC_*` vars are inlined at build time, so they must be present in `.env.local` / the build environment when running `npm run deploy` (or set them in Workers Builds → Build variables if deploying from Git).
Server-only secrets:
```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

Custom domain: Cloudflare dashboard → Workers → patioping → Settings → Domains & Routes → add `patioping.com`.

## Scripts
| Script | What it does |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run preview` | Build with OpenNext and run in local Workers runtime |
| `npm run deploy` | Build and deploy to Cloudflare |
| `npm run cf-typegen` | Generate `cloudflare-env.d.ts` for bindings |
