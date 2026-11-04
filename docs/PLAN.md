# PatioPing — Product Plan

> **Ek line mein:** US shehron ke public building permit data se roz naye **pool aur backyard projects** dhoondho, aur pool service companies (baad mein fence, landscaping, solar) ko subah alert bhejo, ek built-in CRM ke saath jisme woh leads ko customer tak le ja sakein.

**Tagline:** New pool & backyard permit alerts for contractors
**Domain:** PatioPing.com
**Stack:** Next.js (Cloudflare Workers via OpenNext) + Supabase (Auth + Postgres) + Claude API (Haiku) + Whop (payments) + Resend (email)

---

## 1. Core idea aur customer

### Kiske liye
- **Pehla customer (ICP):** US ki chhoti pool service/maintenance companies (1–15 log), Sun Belt states mein: Texas, Arizona, Florida, California.
- **Kyun ye log:** Permit nikalne tak homeowner apna pool *builder* chun chuka hota hai. Lekin pool *cleaning/maintenance* wala abhi tak nahi chuna hota. Har naya pool unke liye saalon ka recurring customer hai (lagbhag $150/month).
- **Baad mein:** fence, landscaping, screen enclosure, outdoor lighting, solar (roof permits se).

### Customer ka ROI
- PatioPing: ~$79/month
- Ek converted lead: ~$1,800/saal
- **Ek lead convert hui = poore saal ka subscription vasool.** Yahi line har pitch mein use karni hai.

### Kya NAHI karna
- Homeowners ko khud se calls, SMS ya emails nahi bhejna (US mein TCPA rules lagte hain). Tool sirf data, alerts aur postcards dega.
- Kisi website ka login ke peeche wala data scrape nahi karna.

---

## 2. Phase-wise plan

### Phase 0: Data proof + landing page
**Goal:** Ye confirm karna ki data mein dum hai, aur waitlist shuru karna.

- [ ] 4 Tier-1 sources se pichhle 3 mahine ka data kheencho (Austin, Mesa, LA, Miami-Dade)
- [ ] Pool/spa permits filter karke **har hafte ka count** nikaalo
- [ ] PatioPing.com pe landing page + waitlist live karo
- [ ] Social handles lock karo (X, LinkedIn, Facebook, Instagram)
- [ ] USPTO pe "PatioPing" trademark search

**Exit criteria:**
- ✅ Kam se kam 3 jurisdictions mein **20+ pool permits/week** → Phase 1
- ❌ Kam volume → same pipeline mein trade badlo (solar/roofing), code waste nahi hoga

---

### Phase 1: Data pipeline
**Goal:** Roz automatic, saaf aur classified permits database mein.

- [ ] Connectors: Socrata (SODA API) + ArcGIS FeatureServer
- [ ] Har source ke columns ko ek **normalized schema** mein map karna
- [ ] **Classifier:**
  1. Keywords se pehla filter (pool, spa, swimming, gunite, fence, solar, reroof…)
  2. Unclear descriptions ke liye Claude Haiku (sasta aur fast)
- [ ] Dedupe (same permit dobara na aaye), geocoding (lat/long), zip code nikaalna
- [ ] Roz chalne wala cron job (Cloudflare Cron Triggers ya Supabase Edge Functions)
- [ ] Har source ke liye health monitoring: agar data aana band ho jaaye, toh alert aaye

**Exit criteria:** 6 sources roz bina manual kaam ke update ho rahe hain.

---

### Phase 2: Product MVP
**Goal:** Pehla paying customer use kar sake.

**Must-have (pehle yahi):**
- [x] Signup/login (Supabase Auth) — scaffolded
- [ ] Onboarding: trade chuno, zip codes ya radius se territory chuno
- [ ] Daily email alert (subah 7 baje customer ke timezone mein)
- [ ] Leads ki list + filters + lead detail page
- [ ] Basic CRM (section 4 dekho)
- [ ] CSV export
- [x] Whop billing (checkout + webhook) + 7 din free trial — scaffolded

**Baad mein (customer demand pe):**
- [ ] Map view
- [ ] AI lead score
- [ ] SMS alert (sirf subscriber ko)
- [ ] Zapier/webhook export

**Exit criteria:** Ek real customer bina tumhari madad ke signup karke alert le raha hai.

---

### Phase 3: Launch + pehle customers
**Goal:** 5–15 paying customers.

- [ ] **Pricing live:**
  - Starter: $49/month, 1 county
  - Growth: $149/month, 3 counties + CRM team access
  - Pro: $299/month, unlimited territory + priority sources
- [ ] **Cold outreach:** Google Maps se pool service companies ki list, aur har email mein **unke area ke asli leads ka sample** bhejo
- [ ] Pool service Facebook groups aur forums mein value-first posts
- [ ] **Programmatic SEO:** "New pool permits in [city]" pages, free preview (last week ke 3 leads blurred), signup CTA
- [ ] Hook: "Pehla hafta free, bina card ke"

**Exit criteria:** 5+ paying customers, aur pehle mahine ka churn 10% se kam.

---

### Phase 4: Expand
**Goal:** $1K → $5K MRR.

- [ ] Tier 2 county portals (Florida, Texas, Arizona). Ye asli moat banega
- [ ] Naye trades: fence, landscaping, screen enclosure, solar
- [ ] **Postcard feature:** ek click mein homeowner ko postcard (Lob ya PostGrid API). Per-postcard markup = extra revenue
- [ ] AI lead score + map view
- [ ] Jobber/HubSpot jaise CRMs ke integrations
- [ ] "Won deals" ROI dashboard (customer ko dikhe ki PatioPing se kitna business mila)

---

### Phase 5: UK
**Goal:** Doosra English-speaking market.

- [ ] PlanIt API se UK planning applications
- [ ] Positioning: chhote builders ke liye sasta Glenigan/Barbour ABI alternative
- [ ] **GDPR-safe design:**
  - B2B contacts (agents, architects, developers) ke saath kaam
  - Homeowners tak sirf postal outreach, cold email/SMS nahi
  - Privacy policy mein "legitimate interest" clearly likhna
- [ ] GBP pricing

---

## 3. Design

### Design principles
1. **Mobile-first.** Pool service wale din bhar field mein hote hain. Phone pe sab kuch aaram se chalna chahiye.
2. **Ek nazar mein value.** Dashboard kholte hi bada number dikhe: "Aaj 5 naye pools".
3. **Simple > fancy.** Customers tech-savvy nahi hain. Kam buttons, bade text, saaf labels.
4. **Har screen pe agla step clear.** Lead dekha → "Contacted mark karo" ya "Postcard bhejo".

### Brand
| Cheez | Choice |
|---|---|
| Primary color | Pool blue / teal (#0EA5E9 ya #14B8A6 type) |
| Accent | Sunny yellow/orange, "🔥 High-value" ke liye |
| Background | White + light gray, dark mode optional |
| Font | Inter ya Geist (saaf, readable) |
| Icon | 🔔 ping/bell + water drop combo |
| Tone | Friendly, seedha, contractor ki bhasha ("jobs", "leads", "your area") |

### Pages / screens

**1. Landing page (`/`)**
- Hero: "Know about every new pool in your area, before your competitors do." + email signup
- Live demo: ek blurred lead card + "Austin mein is hafte 34 naye pools"
- How it works (3 steps): area chuno → roz alert pao → customer banao
- ROI line: "One new customer pays for a year of PatioPing"
- Pricing table
- FAQ (data kahan se aata hai, legal hai ya nahi, cancel kaise karein)

**2. Onboarding (3 steps)**
- Step 1: Trade chuno (Pool service / Fence / Landscaping…)
- Step 2: Territory: zip codes daalo ya map pe radius kheencho
- Step 3: Alert settings: email/SMS, time
- End mein: "Tumhare area mein pichhle 30 din mein X leads" dikhao (instant value)

**3. Dashboard / Leads inbox (`/leads`)**
- Upar stats: Aaj ke naye leads | Is hafte | High-value 🔥
- Lead cards/list: address, project type, value, builder ka naam, date, status badge
- Filters: date, value, zip, status, project type
- Bulk actions: export, assign, postcard

**4. Lead detail (`/leads/[id]`)**
- Permit ki poori details (type, value, description, builder, issue date)
- Mini map
- Status dropdown (CRM stage)
- Notes, follow-up reminder, activity timeline
- Actions: Mark contacted, Send postcard, Export

**5. CRM board (`/pipeline`)**
- Kanban view (section 4)

**6. Map view (`/map`)** *(Phase 4)*
- Territory ke saare leads pins mein, color = status

**7. Settings**
- Territories, alert preferences, team members, billing (Whop checkout, cancel from Whop account)

### Daily alert email design
```
Subject: 🔔 5 new pools in your area today

Good morning Mike,

🔥 2 high-value  |  5 total  |  Zip: 78701, 78704, 78745

1. 🔥 1234 Oak St, Austin 78704 — Pool + spa — $85,000 — Builder: Blue Haven Pools
2. 🔥 ...
3.    ...

[View all leads →]

You're receiving this because you subscribed to PatioPing alerts.
```
- Plain aur fast load, mobile pe readable
- Har lead pe direct link

---

## 4. CRM design (built-in, lightweight)

**Kyun built-in:** Chhoti pool companies aksar koi CRM use hi nahi karti, ya Excel/WhatsApp pe chalti hain. Built-in CRM se customer roz app kholega, aur churn kam hoga.

### Pipeline stages (Kanban)
```
New → Contacted → Postcard sent → Quoted → Won ✅ → Lost ❌
```
- Card drag-and-drop se stage badlo
- "Won" pe customer **monthly value** daale (jaise $150/month). Isse ROI dashboard banega

### Lead fields
| Field | Source |
|---|---|
| Address, zip, lat/long | Permit data |
| Project type (pool/spa/fence…) | Classifier |
| Project value | Permit data |
| Builder / contractor | Permit data |
| Permit date, permit number, source link | Permit data |
| AI score (High/Medium/Low) | AI layer (Phase 4) |
| Stage | User |
| Assigned to | User (team) |
| Notes | User |
| Next follow-up date | User |
| Won value ($/month) | User |
| Tags | User |

### Activities
- Note add karna
- Follow-up reminder (email/notification us din)
- Activity timeline: "Stage badla", "Postcard bheja", "Note add kiya"

### ROI dashboard (sabse important retention feature)
- "Is mahine PatioPing se **3 naye customers = $450/month** ka business"
- Leads → Contacted → Won ka funnel
- Ye number har mahine email mein bhi bhejo, taaki customer cancel na kare

### Team (Growth/Pro plan)
- Multiple users, lead assign karna, "My leads" filter

### Integrations
- CSV export (Phase 2)
- Zapier/webhook (Phase 2–4)
- Jobber, HubSpot (Phase 4)

---

## 5. Data sources: kaunsi sites scrape karni hain

> **Rule:** Pehle official API/open data. Scraping last option hai. Har portal ki ToS aur robots.txt check karo. Socrata pe free **app token** le lo, rate limits se bachne ke liye.

### 🟢 Tier 1: Official open-data APIs (Phase 0–1)

**Sun Belt (pool-heavy), sabse pehle:**
| Jurisdiction | Portal | Type | Note |
|---|---|---|---|
| Austin, TX | data.austintexas.gov | Socrata | Contractor field kaafi bhara hota hai |
| Mesa, AZ | citydata.mesaaz.gov | Socrata | Phoenix metro |
| Los Angeles, CA | data.lacity.org | Socrata | Contractor column nahi |
| Miami-Dade County, FL | County ArcGIS | ArcGIS | Sirf unincorporated areas |
| Maricopa County, AZ | County ArcGIS | ArcGIS | Sirf unincorporated, valuation nahi |
| Nashville, TN | Metro ArcGIS | ArcGIS | Daily update |

**Doosre trades ke liye (Phase 4):**
| Jurisdiction | Portal | Type |
|---|---|---|
| Chicago, IL | data.cityofchicago.org | Socrata |
| New York, NY | data.cityofnewyork.us (DOB) | Socrata |
| San Francisco, CA | data.sfgov.org | Socrata |
| Seattle, WA | data.seattle.gov | Socrata |
| Cincinnati, OH | data.cincinnati-oh.gov | Socrata |
| Washington, DC | maps2.dcgis.dc.gov | ArcGIS |
| Philadelphia, Boston, Baton Rouge, Marin County | City portals | Socrata/ArcGIS/CKAN |

**Dataset ID kaise dhoondhein:** Portal pe permits dataset kholo → Export → SODA API → 4x4 ID copy karo (jaise Chicago ka building permits dataset `ydr8-5enu`).

**Naye shehar dhoondhne ke liye index:** openpermitdata.com (35 US cities ke open-data portals list karta hai).

### 🟡 Tier 2: County permit portals bina open data ke (Phase 4)
- Florida, Texas, Arizona ki counties jinke paas sirf apna permit search portal hai (jaise Tampa Bay area ki counties)
- Phoenix, Houston, San Antonio, Dallas: pehle check karo ki open-data API hai ya nahi, warna Tier 2
- **Ye mushkil hai, isliye yahi moat hai.** Har portal ki ToS/robots.txt check karke hi scrape karna, polite rate limits ke saath

### 🇬🇧 UK (Phase 5)
| Source | Kya |
|---|---|
| planit.org.uk | ~420 councils ka aggregator, public JSON API (`/api/applics/json`), roz rescrape |

### Prototype shortcut
Phase 0 mein Apify ke ready-made "US building permits" actors se jaldi data le sakte ho. Phase 1 mein apna pipeline banao, taaki cost aur control tumhare paas rahe.

---

## 6. Database schema (Supabase)

Implemented in [`supabase/migrations/20261104000000_init.sql`](../supabase/migrations/20261104000000_init.sql). Note: plan ka `users` table `profiles` naam se bana hai (Supabase ke `auth.users` se 1:1 linked).

```
jurisdictions     id, name, state, country, source_type (socrata/arcgis/scrape),
                  endpoint, dataset_id, field_mapping (jsonb), last_synced_at, status

permits_raw       id, jurisdiction_id, external_id, payload (jsonb), fetched_at

permits           id, jurisdiction_id, permit_number, permit_type, description,
                  category (pool/spa/fence/solar/roof/other), valuation,
                  address, zip, lat, lng, contractor_name, issued_at,
                  source_url, ai_score, created_at
                  UNIQUE(jurisdiction_id, permit_number)

orgs              id, name, trade, plan, plan_status, whop_membership_id,
                  whop_user_id, current_period_end, created_at
users             id, org_id, email, role (owner/member)
territories       id, org_id, type (zip/radius), zips[], center_lat, center_lng, radius_km

leads             id, org_id, permit_id, stage, assigned_to, next_follow_up,
                  won_value_monthly, tags[], created_at
                  UNIQUE(org_id, permit_id)

lead_activities   id, lead_id, user_id, type (note/stage_change/postcard/export), body, created_at
alerts_log        id, org_id, sent_at, channel, lead_count
postcards         id, lead_id, provider_id, status, cost, sent_at      (Phase 4)
```

**Flow:** cron → `permits_raw` → normalize + classify → `permits` → territory match → `leads` (har org ke liye) → daily alert.

---

## 7. Pricing (shuruaat)

| Plan | Price | Kya milega |
|---|---|---|
| Starter | $49/mo | 1 county, daily email alerts, basic CRM, CSV |
| Growth | $149/mo | 3 counties, team access, ROI dashboard |
| Pro | $299/mo | Unlimited territory, priority sources, API/webhook |
| Postcards | Per postcard | Print + postage + markup (Phase 4) |

- 7 din ka free trial
- Annual plan pe 2 mahine free

---

## 8. Kya track karna hai

| Metric | Kyun |
|---|---|
| Har customer ke territory mein naye leads/week | Kam hua toh customer chala jaayega |
| Trial → paid conversion | Pitch aur onboarding kitne achhe hain |
| Lead → Won rate (CRM se) | Product ki asli value |
| Monthly churn | 10% se upar = problem |
| Naya jurisdiction jodne ka time | Scale karne ki speed |
| Source health (har source roz data de raha hai?) | Data reliability |

---

## 9. Risks

| Risk | Level | Solution |
|---|---|---|
| Kuch shehron mein lead volume kam | 🔴 | High-volume Sun Belt se shuru, Phase 0 mein data count |
| Data copy karna aasaan (competitors) | 🟠 | Moat = Tier 2 counties + CRM + customer relationships |
| India se US customers ko bechna | 🟠 | Email/Loom sales, US virtual phone number |
| API band ya format change | 🟡 | Source health monitoring, alerts |
| Sardiyon mein kam pools | 🟡 | Sun Belt focus, aur naye trades |

---

## 10. Go / No-go checkpoints

| Kab | Check | Fail hua toh |
|---|---|---|
| Phase 0 end | 3+ jurisdictions mein 20+ pool permits/week? | Trade badlo (solar/roofing) |
| Phase 2 end | Ek real customer khud signup karke use kar raha hai? | Onboarding/product theek karo |
| Launch + 6–8 weeks | Kam se kam 1 paying customer? | Ruk ke socho: pitch, customer type ya idea badlo |
| Launch + ~6 months | ~$1K MRR aur churn < 10%? | Haan → double down. Nahi → pivot ya band |

---

## 11. Competition (reference)

| Player | Kya karta hai | Hamara farak |
|---|---|---|
| Shovels | Permit data API, enterprise focus, push alerts nahi | Chhote contractors ke liye alerts + CRM |
| Construction Monitor | 50 states ka permit data, pool data bhi, 30+ saal purana | Sasta, modern, pool *service* focus, built-in CRM |
| Permit Ledger | Weekly CSV, $14.99 se | Daily alerts + CRM + postcards |
| Permitlify | Daily AI-scored permit alerts | Niche focus (pool/backyard) + CRM + postcards |
| Apify scrapers | Raw data, per-record pricing | Ready-to-use product, technical knowledge ki zaroorat nahi |
