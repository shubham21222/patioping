import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { ClosingBand, CtaButton, GhostButton, SampleAlert, SiteHeader, TradeCards, type AlertItem } from "@/components/marketing";
import { TradeIcon } from "@/components/TradeIcon";
import { LIVE_TRADES, tradeBySlug } from "@/lib/trades";

export const dynamicParams = false;

export function generateStaticParams() {
  return LIVE_TRADES.map((t) => ({ trade: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ trade: string }> }): Promise<Metadata> {
  const t = tradeBySlug((await params).trade);
  if (!t) return {};
  const title = `New ${t.short} permit alerts for ${t.name.toLowerCase()} contractors · PatioPing`;
  const description = `Every new ${t.short} permit in your zip codes, emailed at 7 AM with address, job value and builder. 7 days free.`;
  return { title, description, alternates: { canonical: `/${t.slug}` }, openGraph: { title, description } };
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

  return (
    <main className="bg-bg">
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-[url(/art/hills-hero.webp)] bg-cover bg-[center_top]" />
        <div className="relative pt-3 sm:pt-4">
          <SiteHeader signupHref={signup} />
          <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-28 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:pb-40">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-3 py-1.5 text-sm font-medium text-water backdrop-blur">
                <TradeIcon name={t.icon} size={16} /> {t.name}
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
          <p className="mt-5 text-sm text-ink-3">Vague descriptions get a second read before they reach you, so you don&rsquo;t chase interior remodels.</p>
        </div>
        <div className="rounded-3xl border border-line bg-[#f2f7fa] p-6 sm:p-8">
          <h2 className="text-3xl font-medium leading-tight">
            What you <span className="accent">do</span> with it
          </h2>
          <ul className="mt-6 space-y-4">
            {[
              "Pick your zip codes once. Alerts arrive every morning at 7.",
              "Open a lead to see the address, job value, builder and the public record.",
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

      <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
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
