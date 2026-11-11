import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { ClosingBand, CtaButton, GhostButton, SampleAlert, SiteHeader, TradeCards, type AlertItem } from "@/components/marketing";
import { TradeIcon } from "@/components/TradeIcon";
import { LIVE_TRADES, tradeBySlug } from "@/lib/trades";
import { CITIES, SITE } from "@/lib/seo/cities";
import { TRADE_SEO } from "@/lib/seo/trades";
import { JsonLd } from "@/components/JsonLd";

export const dynamicParams = false;

export function generateStaticParams() {
  return LIVE_TRADES.map((t) => ({ trade: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ trade: string }> }): Promise<Metadata> {
  const t = tradeBySlug((await params).trade);
  if (!t) return {};
  // The root layout's title template adds "| PatioPing"; OpenGraph titles don't get the template.
  const { title, description } = TRADE_SEO[t.id];
  return { title, description, alternates: { canonical: `/${t.slug}` }, openGraph: { title: `${title} · PatioPing`, description } };
}

const ZIPS = ["78704", "78745", "78731"];
const STREETS = ["4812 Ridgeview Dr", "1907 Barton Hills Dr", "6203 Shadow Valley"];

export default async function TradePage({ params }: { params: Promise<{ trade: string }> }) {
  const t = tradeBySlug((await params).trade);
  if (!t) notFound();

  const top = Math.max(...t.examples.map((e) => e.value));
  const items: AlertItem[] = t.examples.map((e, i) => ({
    addr: STREETS[i],
    zip: ZIPS[i],
    work: e.work,
    value: e.value,
    builder: e.builder,
    high: e.value === top,
  }));
  const signup = `/signup?trade=${t.id}`;
  const [lead, ...rest] = t.pitch.headline.split(" ");
  const seo = TRADE_SEO[t.id];
  const url = `${SITE}/${t.slug}`;

  return (
    <main className="bg-bg">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "PatioPing", item: `${SITE}/` },
              { "@type": "ListItem", position: 2, name: seo.eyebrow, item: url },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: `${seo.eyebrow} from new permits`,
            serviceType: seo.eyebrow,
            description: seo.description,
            url,
            provider: { "@type": "Organization", name: "PatioPing", url: SITE },
            areaServed: CITIES.map((c) => ({ "@type": "City", name: `${c.name}, ${c.state}` })),
            offers: { "@type": "Offer", price: "49", priceCurrency: "USD", url: `${SITE}/#pricing` },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: seo.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]}
      />
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-[url(/art/hills-hero.webp)] bg-cover bg-[center_top]" />
        <div className="relative pt-3 sm:pt-4">
          <SiteHeader signupHref={signup} />
          <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-28 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:pb-40">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-3 py-1.5 text-sm font-medium text-water backdrop-blur">
                <TradeIcon name={t.icon} size={16} /> {seo.eyebrow}
              </p>
              <h1 className="mt-6 text-[2.5rem] font-medium leading-[1.04] sm:text-6xl">
                <span className="accent">{lead}</span> {rest.join(" ")}
              </h1>
              <p className="mt-6 max-w-[52ch] text-lg text-ink-2">{t.pitch.body}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <CtaButton href={signup}>Start free week</CtaButton>
                <GhostButton href="/#pricing">See pricing</GhostButton>
              </div>
              <p className="mt-3 text-sm text-ink-3">7 days free. No card needed.</p>
            </div>
            <div className="rise">
              <SampleAlert subject={`${items.length} new ${t.short} permits in your area`} items={items} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 sm:px-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
          <h2 className="text-3xl font-medium leading-tight">
            Which permits count as <span className="accent">{t.short}</span>
          </h2>
          <p className="mt-3 max-w-[52ch] text-ink-2">We read the permit type and the work description, then keep the ones that mention:</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {t.keywords.map((k) => (
              <li key={k} className="rounded-full border border-[#cfe3f1] bg-water-soft px-3 py-1.5 text-sm text-water">{k}</li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-ink-3">
            Matched as whole words, and we leave out permits where the keyword is incidental, like a new house that lists
            a covered patio, so you don&rsquo;t chase jobs that aren&rsquo;t yours.
          </p>
        </div>
        <div className="rounded-3xl border border-line bg-[#f2f7fa] p-6 sm:p-8">
          <h2 className="text-3xl font-medium leading-tight">
            What you <span className="accent">do</span> with it
          </h2>
          <ul className="mt-6 space-y-4">
            {[
              "Pick your zip codes once. Alerts arrive every morning at 7.",
              "Open a lead to see the address, job value, the public record, and the builder where the city publishes it.",
              "Mark it contacted, set a follow-up, or send the homeowner a postcard.",
              "Log what you won, and see what PatioPing brought in each month.",
            ].map((line) => (
              <li key={line} className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-water text-white">
                  <Check size={14} strokeWidth={2.75} />
                </span>
                <span className="text-ink-2">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 pt-24 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="text-3xl font-medium leading-tight sm:text-4xl">
            {seo.eyebrow}, <span className="accent">explained</span>
          </h2>
          <p className="mt-4 max-w-[52ch] text-ink-2">{seo.explainer}</p>
          <p className="mt-4 text-ink-2">
            Guide:{" "}
            <Link href={`/guides/${seo.guide.slug}`} className="font-medium text-water underline">{seo.guide.label}</Link>
          </p>
          <p className="mt-3 text-sm text-ink-3">
            More: <Link href="/guides" className="font-medium text-water underline">all guides</Link> ·{" "}
            <Link href="/alternatives" className="font-medium text-water underline">permit lead tools compared</Link>
          </p>
        </div>
        <dl className="space-y-6 rounded-3xl border border-line bg-white p-6 sm:p-8">
          {seo.faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-1 text-ink-2">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
        {CITIES.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-medium sm:text-4xl">
              {t.name} permits by <span className="accent">city</span>
            </h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/${t.slug}/${c.slug}`} className="inline-block rounded-full border border-line bg-white px-4 py-2 text-sm hover:border-line-2">
                    New {t.short} permits in {c.name}, {c.state}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <h2 className="text-3xl font-medium sm:text-4xl">
          Other <span className="accent">trades</span> on PatioPing
        </h2>
        <div className="mt-8">
          <TradeCards exclude={t.id} />
        </div>
        <p className="mt-6 text-ink-2">
          Plans start at $49 a month.{" "}
          <Link href="/#pricing" className="font-medium text-water underline">See pricing</Link>
        </p>
      </section>

      <div className="h-16" />
      <ClosingBand
        href={signup}
        title={
          <>
            See every new {t.short} job near you, <span className="accent">tomorrow</span> at 7 AM.
          </>
        }
      />
    </main>
  );
}
