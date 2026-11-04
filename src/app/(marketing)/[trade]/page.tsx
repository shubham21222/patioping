import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { DepthMarker, Waterline } from "@/components/brand/Waterline";
import { ClosingBand, LiveTradeList, SampleAlert, SiteHeader, type AlertItem } from "@/components/marketing";
import { TradeIcon } from "@/components/TradeIcon";
import { button } from "@/components/ui";
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

  return (
    <main>
      <section className="bg-deep text-white">
        <SiteHeader signupHref={signup} />
        <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pb-24 lg:pt-16">
          <div>
            <p className="mb-6 inline-flex items-center gap-2.5 font-semibold text-aqua">
              <TradeIcon name={t.icon} size={22} /> {t.name}
            </p>
            <h1 className="text-[2.5rem] font-extrabold leading-[1.02] [font-stretch:87.5%] sm:text-6xl">{t.pitch.headline}</h1>
            <p className="mt-6 max-w-[52ch] text-lg text-on-deep-2">{t.pitch.body}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href={signup} className={button("onDeep", "lg")}>
                Start your free week <ArrowRight size={18} strokeWidth={2.25} />
              </Link>
              <span className="text-sm text-on-deep-2">7 days free. No card needed.</span>
            </div>
          </div>
          <SampleAlert subject={`${items.length} new ${t.short} permits in your area`} items={items} />
        </div>
      </section>

      <Waterline />
      <div className="border-b border-line bg-deck">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-10 gap-y-5 px-4 py-6 sm:px-6">
          <DepthMarker value="7" unit="AM" caption="Alert lands in your time zone" />
          <DepthMarker value="7" unit="DAYS" caption="Free before you pay anything" />
          <DepthMarker value="$49" caption="Per month for one county" />
        </div>
      </div>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-extrabold leading-tight [font-stretch:87.5%] sm:text-[2.6rem]">
            Which permits count as {t.short}
          </h2>
          <p className="mt-4 max-w-[52ch] text-lg text-ink-2">
            We read the permit type and the work description, then keep the ones that mention:
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {t.keywords.map((k) => (
              <li key={k} className="rounded-full border border-line bg-white px-3 py-1.5 text-[15px] font-medium">{k}</li>
            ))}
          </ul>
          <p className="mt-5 max-w-[52ch] text-sm text-ink-3">
            Vague descriptions get a second read before they reach you, so you don&rsquo;t chase interior remodels.
          </p>
        </div>

        <div>
          <h2 className="text-3xl font-extrabold leading-tight [font-stretch:87.5%] sm:text-[2.6rem]">What you do with it</h2>
          <ul className="mt-6 space-y-4 text-lg">
            {[
              "Pick your zip codes once. Alerts arrive every morning at 7.",
              "Open a lead to see the address, job value, builder and the public record.",
              "Mark it contacted, set a follow-up, or send the homeowner a postcard.",
              "Log what you won, and see what PatioPing brought in each month.",
            ].map((line) => (
              <li key={line} className="flex gap-3">
                <Check size={22} strokeWidth={2.5} className="mt-1 shrink-0 text-water" />
                <span className="text-ink-2">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line bg-deck">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-2xl font-extrabold [font-stretch:87.5%] sm:text-3xl">Other trades on PatioPing</h2>
          <div className="mt-6">
            <LiveTradeList exclude={t.id} />
          </div>
          <p className="mt-6 text-ink-2">
            Plans start at $49 a month.{" "}
            <Link href="/#pricing" className="font-semibold text-water underline">See pricing</Link>
          </p>
        </div>
      </section>

      <ClosingBand headline={`Tomorrow at 7 AM, see every new ${t.short} job near you.`} href={signup} />
    </main>
  );
}
