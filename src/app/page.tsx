import {
  ArrowUpRight,
  BellRing,
  CalendarClock,
  Download,
  KanbanSquare,
  Mail,
  MapPinned,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import { Mark } from "@/components/brand/Logo";
import {
  ClosingBand,
  DashboardPreview,
  SampleAlert,
  SiteHeader,
  STAGE_STYLE,
  TradeCards,
  type AlertItem,
} from "@/components/marketing";
import { PricingPicker } from "@/components/PricingPicker";
import { SoonTrades } from "@/components/SoonTrades";
import { TradeIcon } from "@/components/TradeIcon";
import { ZipCheck } from "@/components/ZipCheck";
import { FOUNDING, PLANS } from "@/lib/plans";
import { JsonLd } from "@/components/JsonLd";
import { SITE } from "@/lib/seo/cities";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "PatioPing: New Pool, Fence & Patio Permit Leads for Contractors" },
  description:
    "Daily 7 AM alerts for new pool, fence and patio permits in your zip codes, from public city and county records. Address, job value and builder where published. 7 days free.",
  alternates: { canonical: "/" },
};

// Illustrative only: every sample is labeled as such where it renders.
const sample: AlertItem[] = [
  { addr: "4812 Ridgeview Dr", zip: "78745", work: "Pool + spa", value: 92000, builder: "Sample Pools Co.", high: true },
  { addr: "1907 Barton Hills Dr", zip: "78704", work: "Covered patio", value: 48000, builder: "Example Outdoor Co." },
  { addr: "6203 Shadow Valley", zip: "78731", work: "Privacy fence", value: 9800, builder: "Owner-builder" },
];

const SOURCES = ["Austin", "Mesa", "Los Angeles", "Miami-Dade", "Maricopa County", "Nashville"];

const faqs = [
  {
    q: "Where does the data come from?",
    a: "Public building-permit records that cities and counties publish on their open-data portals. We read them overnight, keep the pool, fence and outdoor-living permits, and match them to your trade and zip codes.",
  },
  {
    q: "Is it legal to use permit data?",
    a: "Building permits are public records. PatioPing never calls, texts or emails homeowners on your behalf. You decide how to reach out, and we can mail a postcard for you.",
  },
  {
    q: "Which areas do you cover?",
    a: "We're launching with the cities of Austin, Mesa, Los Angeles and Nashville, plus unincorporated Miami-Dade and unincorporated Maricopa County. For those two counties we only get permits from the county itself, so addresses inside the City of Miami, Phoenix and other cities aren't included yet. Los Angeles doesn't publish builder names, so LA leads show address and value only. Type your zip at the top of the page to check, and if your county isn't covered, request it there.",
  },
  {
    q: "How do I cancel?",
    a: "From Settings → Billing, any time. Your plan runs to the end of the period you paid for. No contracts.",
  },
];

export default function Home() {
  return (
    <main className="bg-bg">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "PatioPing",
            url: SITE,
            logo: `${SITE}/brand/patioping-logo.png`,
          },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "PatioPing",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description: "Daily alerts for new pool, fence and patio building permits, with a lead pipeline for contractors.",
            offers: PLANS.map((p) => ({ "@type": "Offer", name: p.name, price: p.price, priceCurrency: "USD", url: `${SITE}/#pricing` })),
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]}
      />
      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-[url(/art/hills-hero.webp)] bg-cover bg-[center_top]" />
        <div className="relative pt-3 sm:pt-4">
          <SiteHeader />
          <div className="mx-auto max-w-4xl px-4 pt-16 text-center sm:pt-24">
            <h1 className="text-[2.6rem] font-medium leading-[1.04] sm:text-6xl lg:text-[4.2rem]">
              New <span className="accent">backyard</span> project alerts: pools, fences, patios and more.
            </h1>
            <p className="mx-auto mt-6 max-w-[56ch] text-lg text-ink-2">
              We read city and county permit records overnight and email you new projects in your zip codes at 7 AM, the
              morning after they&rsquo;re issued, while they&rsquo;re still fresh. Address and job value, plus the builder where the
              city publishes it.
            </p>
            <div className="mt-9">
              <ZipCheck />
            </div>
            <p className="mt-4 text-sm text-ink-3">
              See real permit counts for the last 30 days. 7 days free, no card needed.{" "}
              <a href="#how" className="text-ink-2 underline hover:text-ink">How it works</a>
            </p>
          </div>

          <div className="relative mx-auto mt-16 max-w-5xl px-4 sm:mt-20">
            <DashboardPreview />
          </div>
          {/* Front ridges sit over the bottom of the mock: the product rising out of the hills */}
          <div
            aria-hidden="true"
            className="pointer-events-none relative z-10 -mt-[18vw] h-[30vw] min-h-40 bg-[url(/art/hills-front.webp)] bg-cover bg-top sm:-mt-[16vw]"
          />
        </div>
      </section>

      {/* ───── Sources ───── */}
      <section className="mx-auto max-w-5xl px-4 pb-6 text-center">
        <p className="text-sm text-ink-3">Launching with open permit data from</p>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {SOURCES.map((s) => (
            <li key={s} className="text-lg font-semibold tracking-tight text-[#4f7899]">
              {s}
              {s === "Miami-Dade" || s === "Maricopa County" ? <sup className="ml-0.5 text-xs">*</sup> : null}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ink-3">* Unincorporated areas only, not the cities inside the county.</p>
      </section>

      {/* ───── Trades ───── */}
      <section id="trades" className="mx-auto max-w-5xl scroll-mt-24 px-4 pt-24 sm:px-6">
        <div className="text-center">
          <TradeOrbit />
          <h2 className="mt-8 text-4xl font-medium leading-tight sm:text-5xl">
            Built for every <span className="accent">backyard</span> trade
          </h2>
          <p className="mx-auto mt-3 max-w-[52ch] text-ink-2">
            Each trade gets its own permit filter, so a fence crew never wades through pool permits.
          </p>
        </div>
        <div className="mt-12">
          <TradeCards />
        </div>
        <div className="mt-10 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
            <h3 className="font-medium">Coming soon</h3>
            <p className="text-sm text-ink-2">Tell us what you&rsquo;d use. The trade with the most requests ships next.</p>
          </div>
          <div className="mt-4">
            <SoonTrades source="landing" />
          </div>
        </div>
      </section>

      {/* ───── Benefits ───── */}
      <section id="how" className="mx-auto mt-28 max-w-6xl scroll-mt-24 px-3 sm:px-6">
        <div className="rounded-[32px] bg-mint px-4 py-16 sm:px-10 sm:py-20">
          <div className="text-center">
            <h2 className="text-4xl font-medium leading-tight sm:text-5xl">
              From permit to <span className="accent">paid job</span>
            </h2>
            <p className="mx-auto mt-3 max-w-[50ch] text-ink-2">Three things happen every morning, before your first stop.</p>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            <BenefitCard
              icon={<BellRing size={18} />}
              title="New permits, cleaned up"
              body="Overnight we pull city and county records, keep the ones for your trade and zip codes, and drop the noise."
            >
              <div className="space-y-2">
                {(
                  [
                    ["Pool + spa", "$92,000", true],
                    ["Covered patio", "$48,000", false],
                    ["Interior remodel", "skipped", false],
                  ] as const
                ).map(([w, v, hi]) => (
                  <div key={w} className="flex items-center justify-between rounded-lg border border-line bg-white px-3 py-2 text-[13px]">
                    <span className={`flex items-center gap-2 ${v === "skipped" ? "text-ink-3 line-through" : ""}`}>
                      {hi && <span className="h-1.5 w-1.5 rounded-full bg-sun" />}
                      {w}
                    </span>
                    <span className={`num ${v === "skipped" ? "text-ink-3" : "font-medium"}`}>{v}</span>
                  </div>
                ))}
              </div>
            </BenefitCard>
            <BenefitCard
              icon={<KanbanSquare size={18} />}
              title="A pipeline that fits in a truck"
              body="Mark a lead contacted, set a follow-up, or send a postcard. Big buttons, works one-handed."
            >
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["New", "4812 Ridgeview"],
                  ["Contacted", "1907 Barton"],
                  ["Won", "311 Pecan"],
                ].map(([s, a]) => (
                  <div key={s} className="min-w-0 rounded-lg border border-line bg-white p-2">
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STAGE_STYLE[s]}`}>{s}</span>
                    <p className="mt-2 truncate text-[12px] font-medium">{a}</p>
                  </div>
                ))}
              </div>
            </BenefitCard>
            <BenefitCard
              icon={<ArrowUpRight size={18} />}
              title="See what it brought in"
              body="Log what each job is worth when you win it. Your monthly report adds it up."
            >
              <div className="rounded-lg border border-line bg-white p-3">
                <p className="text-[11px] text-ink-3">Won this month · example</p>
                <p className="marker mt-1 text-2xl">$11,600</p>
                <div className="mt-3 flex h-12 items-end gap-1.5" role="presentation">
                  {[28, 40, 34, 52, 46, 70, 88].map((h, i) => (
                    <span key={i} className={`flex-1 rounded-sm ${i === 6 ? "bg-water" : "bg-water-soft"}`} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </BenefitCard>
          </div>
        </div>
      </section>

      {/* ───── Bento ───── */}
      <section className="mx-auto max-w-6xl px-4 pt-28 sm:px-6">
        <div className="text-center">
          <h2 className="text-4xl font-medium leading-tight sm:text-5xl">
            Made for crews in the <span className="accent">field</span>
          </h2>
          <p className="mx-auto mt-3 max-w-[50ch] text-ink-2">No setup calls, no training. Pick your zip codes and you&rsquo;re done.</p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-6">
          <Bento className="md:col-span-3" icon={<Mail size={18} />} title="The 7 AM alert" body="One email a day with every new project in your area. Each address links straight to the lead.">
            <SampleAlert subject="3 new backyard projects in your area" items={sample} />
          </Bento>
          <Bento className="md:col-span-3" icon={<MapPinned size={18} />} title="Your territory, by zip code" body="Paste the zips you work in, and pick when the alert lands. Change either any time.">
            <div className="flex flex-wrap gap-2">
              {["78701", "78704", "78731", "78745", "78746", "78749"].map((z, i) => (
                <span
                  key={z}
                  className={`num rounded-full border px-3 py-1.5 text-sm ${i < 4 ? "border-[#cfe3f1] bg-water-soft text-water" : "border-line bg-white text-ink-2"}`}
                >
                  {z}
                </span>
              ))}
              <span className="rounded-full border border-dashed border-line-2 px-3 py-1.5 text-sm text-ink-3">+ add zip</span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[
                ["5:00", "Early crew"],
                ["7:00", "Default"],
                ["9:00", "Office day"],
              ].map(([t, l], i) => (
                <div key={t} className={`rounded-xl border p-3 ${i === 1 ? "border-water bg-white" : "border-line bg-white/60"}`}>
                  <p className="marker text-xl">{t}</p>
                  <p className="mt-1 text-[11px] text-ink-3">{l}</p>
                </div>
              ))}
            </div>
          </Bento>
          <Bento className="md:col-span-2" icon={<CalendarClock size={18} />} title="Follow-ups that don’t slip" body="Set a date on any lead. It shows up first that morning.">
            <ul className="space-y-2 text-[13px]">
              {[
                ["Call back 1907 Barton Hills", "Today"],
                ["Send quote to 88 Lost Creek", "Thu"],
              ].map(([t, d]) => (
                <li key={t} className="flex items-center justify-between rounded-lg border border-line bg-white px-3 py-2">
                  <span className="truncate">{t}</span>
                  <span className="ml-3 shrink-0 text-ink-3">{d}</span>
                </li>
              ))}
            </ul>
          </Bento>
          <Bento className="md:col-span-2" icon={<Users size={18} />} title="Bring the crew" body="Growth and Pro add teammates and lead assignment.">
            <div className="flex items-center">
              {["MR", "JS", "AL"].map((i, n) => (
                <span
                  key={i}
                  className={`grid h-10 w-10 place-items-center rounded-full border-2 border-white text-xs font-semibold ${
                    ["bg-water-soft text-water", "bg-violet-soft text-violet", "bg-green-soft text-green"][n]
                  } ${n ? "-ml-2" : ""}`}
                >
                  {i}
                </span>
              ))}
              <span className="ml-3 text-sm text-ink-2">Assign leads by route</span>
            </div>
          </Bento>
          <div className="relative min-h-64 overflow-hidden rounded-3xl bg-water p-6 text-white sm:p-8 md:col-span-2">
            <Smartphone size={18} />
            <h3 className="mt-4 text-lg font-medium">On your phone</h3>
            <p className="mt-1 max-w-[22ch] text-sm text-white/85">Works in your phone&rsquo;s browser. No app to install.</p>
            <PhoneMock />
          </div>
          <Bento className="md:col-span-3" icon={<Download size={18} />} title="Your data, any time" body="Export every lead and its stage to CSV whenever you want.">
            <div className="overflow-x-auto rounded-lg border border-line bg-white px-3 py-2 font-mono text-[12px] leading-relaxed text-ink-2">
              <p className="whitespace-nowrap">address,zip,work,valuation,stage</p>
              <p className="whitespace-nowrap">4812 Ridgeview Dr,78745,pool,92000,new</p>
              <p className="whitespace-nowrap">1907 Barton Hills Dr,78704,landscaping,48000,contacted</p>
            </div>
          </Bento>
          <Bento className="md:col-span-3" icon={<ShieldCheck size={18} />} title="Public records only" body="We never call, text or email homeowners for you. You decide how to reach out.">
            <div className="flex flex-wrap gap-2 text-[13px]">
              {["Open-data portals", "Nothing behind a login", "Postcards, not cold texts"].map((t) => (
                <span key={t} className="rounded-full border border-line bg-white px-3 py-1.5 text-ink-2">{t}</span>
              ))}
            </div>
          </Bento>
        </div>
      </section>

      {/* ───── The math ───── */}
      <section className="mx-auto max-w-5xl px-4 pt-28 sm:px-6">
        <div className="rounded-3xl border border-line bg-white p-6 sm:p-12">
          <h2 className="text-3xl font-medium sm:text-4xl">
            The <span className="accent">math</span>
          </h2>
          <p className="mt-6 max-w-[30ch] text-2xl leading-snug sm:text-[2rem]">One new customer pays for a whole year of PatioPing.</p>
          <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {[
              ["PatioPing Starter, 12 months", "$588", "$49 × 12", "text-ink"],
              ["One pool on weekly service", "$1,800", "$150/mo × 12, every year they stay", "text-water"],
              ["One 180 ft privacy fence", "$9,800", "One job", "text-water"],
            ].map(([k, v, n, c]) => (
              <div key={k} className="bg-white p-5 sm:p-6">
                <dt className="text-sm text-ink-2">{k}</dt>
                <dd className={`marker mt-3 text-4xl ${c}`}>{v}</dd>
                <dd className="num mt-2 text-xs text-ink-3">{n}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-ink-3">Examples are illustrative. Use your own prices.</p>
        </div>
      </section>

      {/* ───── Pricing ───── */}
      <section id="pricing" className="mx-auto max-w-5xl scroll-mt-24 px-4 pt-28 sm:px-6">
        <div className="text-center">
          <h2 className="text-4xl font-medium leading-tight sm:text-5xl">
            Simple pricing for <span className="accent">every</span> crew
          </h2>
          <p className="mx-auto mt-3 max-w-[50ch] text-ink-2">Every plan starts with 7 free days. Pay yearly and get 2 months free.</p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#f3dca6] bg-sun-soft px-4 py-2 text-sm text-sun-ink">
            <span className="font-medium">Founding member pricing</span> · {FOUNDING.line}
          </p>
        </div>
        <div className="mt-10">
          <PricingPicker />
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section id="faq" className="mx-auto grid max-w-5xl scroll-mt-24 gap-10 px-4 pt-28 sm:px-6 lg:grid-cols-[1fr_2fr]">
        <h2 className="text-4xl font-medium leading-tight">
          Common <span className="accent">questions</span>
        </h2>
        <div className="divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-white text-ink-2 transition-transform duration-200 group-open:rotate-45">
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 max-w-[65ch] text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="h-16" />
      <ClosingBand
        title={
          <>
            Reach the homeowner while the permit is <span className="accent">fresh</span>.
          </>
        }
      />
    </main>
  );
}

function BenefitCard({ icon, title, body, children }: { icon: React.ReactNode; title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-3xl border border-white bg-white/70 p-5 shadow-[var(--shadow-card)]">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-water-soft text-water">{icon}</span>
      <h3 className="mt-5 text-lg font-medium">{title}</h3>
      <p className="mt-1 text-sm text-ink-2">{body}</p>
      <div className="mt-auto pt-6">
        <div className="rounded-2xl bg-deck p-3">{children}</div>
      </div>
    </div>
  );
}

function Bento({
  className = "",
  icon,
  title,
  body,
  children,
}: {
  className?: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`overflow-hidden rounded-3xl border border-line bg-[#f2f7fa] p-6 sm:p-8 ${className}`}>
      <span className="text-water">{icon}</span>
      <h3 className="mt-4 text-lg font-medium">{title}</h3>
      <p className="mt-1 max-w-[46ch] text-sm text-ink-2">{body}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function PhoneMock() {
  return (
    <div
      aria-hidden="true"
      className="absolute -bottom-20 right-5 w-40 rounded-[28px] border-[5px] border-deep-2 bg-white p-2.5 text-ink shadow-[var(--shadow-float)] sm:right-6"
    >
      <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-deck-2" />
      <p className="text-[10px] text-ink-3">Today</p>
      <p className="text-[13px] font-medium">5 new projects</p>
      {["4812 Ridgeview", "1907 Barton", "6203 Shadow V."].map((a, i) => (
        <div key={a} className="mt-1.5 rounded-lg border border-line px-2 py-1.5">
          <p className="truncate text-[10px] font-medium">{a}</p>
          <p className="text-[9px] text-ink-3">{["Pool + spa", "Patio", "Fence"][i]}</p>
        </div>
      ))}
    </div>
  );
}

/** Live trades arranged around the mark, in place of customer faces we don't have yet. */
function TradeOrbit() {
  const items = [
    { name: "waves" as const, cls: "left-[6%] top-[48%] h-12 w-12" },
    { name: "fence" as const, cls: "left-[27%] top-[0%] h-14 w-14" },
    { name: "trees" as const, cls: "right-[26%] top-[6%] h-14 w-14" },
    { name: "fence" as const, cls: "right-[5%] top-[54%] h-10 w-10" },
  ];
  return (
    <div aria-hidden="true" className="relative mx-auto h-32 max-w-md">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Mark size={64} />
      </div>
      {items.map((it, i) => (
        <span
          key={i}
          className={`absolute grid place-items-center rounded-full border border-white bg-white text-water shadow-[var(--shadow-card)] ${it.cls}`}
        >
          <TradeIcon name={it.name} size={20} />
        </span>
      ))}
    </div>
  );
}
