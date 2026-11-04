import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ExternalLink, Minus } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { ClosingBand, CtaButton, SiteHeader } from "@/components/marketing";
import { TradeIcon } from "@/components/TradeIcon";
import { ZipCheck } from "@/components/ZipCheck";
import { CITIES, cityBySlug, SITE, stateName } from "@/lib/seo/cities";
import { createPublicClient } from "@/lib/supabase/public";
import { LIVE_TRADES, tradeBySlug } from "@/lib/trades";

export const dynamic = "force-dynamic";

type Stats = {
  last_synced_at: string | null;
  coverage_note: string | null;
  last_30: number;
  median_value: number | null;
  weekly: { week: string; n: number }[];
  top_zips: { zip: string; n: number }[];
};

async function loadStats(cityName: string, categories: string[]): Promise<Stats | null> {
  try {
    const { data, error } = await createPublicClient().rpc("city_stats", { p_jurisdiction: cityName, p_categories: categories });
    if (error) return null;
    return data as Stats;
  } catch {
    return null;
  }
}

function resolve(tradeSlug: string, citySlug: string) {
  const t = tradeBySlug(tradeSlug);
  const c = cityBySlug(citySlug);
  return t && c ? { t, c } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ trade: string; city: string }> }): Promise<Metadata> {
  const { trade, city } = await params;
  const r = resolve(trade, city);
  if (!r) return {};
  const { t, c } = r;
  const stats = await loadStats(c.name, t.categories);
  const live = (stats?.last_30 ?? 0) > 0;
  const title = `New ${t.short} permits in ${c.name}, ${c.state}: daily leads`;
  const description = live
    ? `${stats!.last_30} new ${t.short} permits in ${c.name} in the last 30 days. Get every new one by email at 7 AM with address, job value${c.hasBuilder ? " and builder" : ""}. 7 days free.`
    : `Daily alerts for new ${t.short} permits in ${c.name}, ${stateName(c.state)}, from the city's public permit records. Address, job value${c.hasBuilder ? " and builder" : ""}, every morning at 7 AM.`;
  return {
    title,
    description,
    alternates: { canonical: `/${t.slug}/${c.slug}` },
    openGraph: { title, description, url: `/${t.slug}/${c.slug}` },
    // Until we have real counts for this city, keep the page out of the index: no thin pages.
    robots: live ? undefined : { index: false, follow: true },
  };
}

export default async function CityTradePage({ params }: { params: Promise<{ trade: string; city: string }> }) {
  const { trade, city } = await params;
  const r = resolve(trade, city);
  if (!r) notFound();
  const { t, c } = r;
  const stats = await loadStats(c.name, t.categories);
  const live = (stats?.last_30 ?? 0) > 0;
  const place = `${c.name}, ${c.state}`;
  const publisher = `City of ${c.name}`;
  const maxWeek = Math.max(1, ...(stats?.weekly ?? []).map((w) => w.n));

  const faqs = [
    {
      q: `Where does the ${c.name} permit data come from?`,
      a: `From the ${publisher}'s open-data portal, which publishes issued building permits as public records. We read it every night and keep the ${t.short} permits.`,
    },
    {
      q: `What area does it cover?`,
      a: c.source.coverage_note
        ? `${c.source.coverage_note}. Type your zip above to check before you sign up.`
        : `Permits issued by the ${publisher}. Type your zip above to check your service area before you sign up.`,
    },
    {
      q: `Does every lead include the builder?`,
      a: c.hasBuilder
        ? `${c.name} publishes a contractor field, so most leads include it. Some permits are pulled by the owner and list no builder.`
        : `${c.name} doesn't publish builder names, so leads here show the address, job value and permit details only.`,
    },
  ];

  return (
    <main className="bg-bg">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "PatioPing", item: SITE },
              { "@type": "ListItem", position: 2, name: t.name, item: `${SITE}/${t.slug}` },
              { "@type": "ListItem", position: 3, name: place, item: `${SITE}/${t.slug}/${c.slug}` },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]}
      />

      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-[url(/art/hills-hero.webp)] bg-cover bg-[center_top]" />
        <div className="relative pt-3 sm:pt-4">
          <SiteHeader signupHref={`/signup?trade=${t.id}`} />
          <div className="mx-auto max-w-4xl px-4 pb-24 pt-14 text-center sm:pt-20">
            <nav aria-label="Breadcrumb" className="text-sm text-ink-3">
              <Link href="/" className="hover:text-ink">Home</Link> <span className="mx-1">/</span>{" "}
              <Link href={`/${t.slug}`} className="hover:text-ink">{t.name}</Link> <span className="mx-1">/</span>{" "}
              <span className="text-ink-2">{place}</span>
            </nav>
            <h1 className="mt-5 text-[2.4rem] font-medium leading-[1.05] sm:text-6xl">
              New <span className="accent">{t.short}</span> permits in {place}
            </h1>
            <p className="mx-auto mt-5 max-w-[58ch] text-lg text-ink-2">
              Every {t.short} permit the {publisher} issues, emailed to you at 7 AM the morning after. Address and job value
              {c.hasBuilder ? ", plus the builder where it's listed" : ""}, with a simple pipeline to follow up.
            </p>
            <div className="mt-8">
              <ZipCheck />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        {live ? (
          <div className="grid gap-3 lg:grid-cols-[1fr_1.4fr]">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white bg-line shadow-[var(--shadow-card)]">
              <div className="col-span-2 bg-white p-6">
                <dt className="text-sm text-ink-2">New {t.short} permits, last 30 days</dt>
                <dd className="marker mt-2 text-5xl text-water">{stats!.last_30}</dd>
              </div>
              <div className="bg-white p-6">
                <dt className="text-sm text-ink-2">Median job value (90 days)</dt>
                <dd className="marker mt-2 text-2xl">{stats!.median_value ? `$${Math.round(stats!.median_value).toLocaleString("en-US")}` : "—"}</dd>
              </div>
              <div className="bg-white p-6">
                <dt className="text-sm text-ink-2">Data last checked</dt>
                <dd className="num mt-2 text-lg font-medium">
                  {stats!.last_synced_at ? new Date(stats!.last_synced_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                </dd>
              </div>
            </dl>
            <div className="rounded-3xl border border-white bg-white p-6 shadow-[var(--shadow-card)]">
              <h2 className="font-medium">Permits per week, last 12 weeks</h2>
              <div className="mt-6 flex h-40 items-end gap-1.5" role="img" aria-label={`Weekly ${t.short} permits in ${c.name}`}>
                {stats!.weekly.map((w) => (
                  <div key={w.week} className="group relative flex-1">
                    <div className="rounded-t-md bg-water/80 transition-colors group-hover:bg-water" style={{ height: `${(w.n / maxWeek) * 160}px` }} />
                    <span className="num pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-ink px-1.5 py-0.5 text-[11px] text-white group-hover:block">
                      {w.n}
                    </span>
                  </div>
                ))}
              </div>
              {stats!.top_zips.length > 0 && (
                <>
                  <h3 className="mt-6 text-sm font-medium text-ink-2">Busiest zip codes, last 30 days</h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {stats!.top_zips.map((z) => (
                      <li key={z.zip} className="num rounded-full border border-line bg-deck px-3 py-1 text-sm">
                        {z.zip} <span className="text-ink-3">· {z.n}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-white bg-white p-6 text-center shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="text-xl font-medium">{c.name} coverage is launching</h2>
            <p className="mx-auto mt-2 max-w-[56ch] text-ink-2">
              We&rsquo;re connecting the {publisher}&rsquo;s permit records now. Start your free week and your first alert goes out as soon as data
              lands.
            </p>
          </div>
        )}
      </section>

      <section className="mx-auto mt-4 grid max-w-5xl gap-3 px-4 sm:px-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-medium">
            What&rsquo;s in each <span className="accent">{c.name}</span> lead
          </h2>
          <ul className="mt-5 divide-y divide-line">
            {(
              [
                ["Street address and zip", true],
                ["Job value from the permit", true],
                ["Builder or contractor", c.hasBuilder],
                ["Permit number and issue date", true],
                ["Link to the public record", true],
                ["Homeowner phone or email", false],
              ] as const
            ).map(([label, yes]) => (
              <li key={label} className="flex items-center justify-between py-3">
                <span className={yes ? "" : "text-ink-3"}>{label}</span>
                {yes ? (
                  <Check size={18} strokeWidth={2.5} className="text-water" aria-label="Included" />
                ) : (
                  <Minus size={18} className="text-ink-3" aria-label="Not included" />
                )}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-3">We never call, text or email homeowners for you, and we don&rsquo;t sell their contact details.</p>
        </div>
        <div className="rounded-3xl border border-line bg-[#f2f7fa] p-6 sm:p-8">
          <h2 className="text-2xl font-medium">{c.name} questions</h2>
          <dl className="mt-5 space-y-5">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-medium">{f.q}</dt>
                <dd className="mt-1 text-ink-2">{f.a}</dd>
              </div>
            ))}
          </dl>
          <a href={c.source.portal} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-water underline">
            {publisher} open data <ExternalLink size={14} />
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pt-20 sm:px-6">
        <h2 className="text-2xl font-medium">More in {place}</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {LIVE_TRADES.filter((x) => x.id !== t.id).map((x) => (
            <li key={x.id}>
              <Link href={`/${x.slug}/${c.slug}`} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 hover:border-line-2">
                <TradeIcon name={x.icon} size={18} className="text-water" /> {x.name} permits in {c.name}
              </Link>
            </li>
          ))}
        </ul>
        {CITIES.length > 1 && (
          <>
            <h2 className="mt-10 text-2xl font-medium">{t.name} permits in other cities</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {CITIES.filter((x) => x.slug !== c.slug).map((x) => (
                <li key={x.slug}>
                  <Link href={`/${t.slug}/${x.slug}`} className="inline-block rounded-full border border-line bg-white px-4 py-2 text-sm hover:border-line-2">
                    {x.name}, {x.state}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="mt-10">
          <CtaButton href={`/signup?trade=${t.id}`}>Start free week</CtaButton>
        </div>
      </section>

      <div className="h-16" />
      <ClosingBand
        href={`/signup?trade=${t.id}`}
        title={
          <>
            Tomorrow&rsquo;s {c.name} permits, in your inbox at <span className="accent">7 AM</span>.
          </>
        }
      />
    </main>
  );
}
