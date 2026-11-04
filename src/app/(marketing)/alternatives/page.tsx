import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { ArticleShell } from "@/components/ArticleShell";
import { JsonLd } from "@/components/JsonLd";
import { ClosingBand } from "@/components/marketing";
import { SITE } from "@/lib/seo/cities";

export const metadata: Metadata = {
  title: { absolute: "Permit Lead Tools Compared: Construction Monitor, Shovels, Apify & PatioPing" },
  description:
    "The four kinds of building permit lead tools, who each is built for, and where PatioPing fits for small pool, fence and landscaping companies.",
  alternates: { canonical: "/alternatives" },
};

// Descriptions stay at the level of what each kind of product is. Check each vendor's own site for current details.
const KINDS = [
  {
    kind: "Permit data APIs",
    example: "Shovels",
    href: "https://www.shovels.ai",
    built: "Software teams and analysts who want permit data inside their own tools.",
    get: "Structured permit records through an API or data license.",
  },
  {
    kind: "Lead subscriptions",
    example: "Construction Monitor",
    href: "https://www.constructionmonitor.com",
    built: "Contractors and suppliers buying lead lists by market and category.",
    get: "Permit-based lead lists by area and permit type, delivered by email or download.",
  },
  {
    kind: "Permit databases and CSVs",
    example: "Permit Ledger",
    href: "https://permitledger.com",
    built: "People who want to pull lists and work them in a spreadsheet.",
    get: "Searchable records and exports.",
  },
  {
    kind: "Scrapers",
    example: "Apify permit actors",
    href: "https://apify.com",
    built: "Technical users comfortable running and maintaining scrapers.",
    get: "Raw records from city portals, usually priced per run or per record.",
  },
];

const ROWS: [string, boolean][] = [
  ["Daily email at 7 AM in your time zone", true],
  ["Filtered to your trade: pool, fence or outdoor", true],
  ["Matched to the zip codes you service", true],
  ["Built-in pipeline: stages, notes, follow-ups", true],
  ["CSV export", true],
  ["No code, no spreadsheet cleanup", true],
  ["Nationwide coverage today", false],
];

export default function Alternatives() {
  return (
    <ArticleShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Permit lead tools compared",
          url: `${SITE}/alternatives`,
        }}
      />
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
        <h1 className="max-w-[22ch] text-4xl font-medium leading-tight sm:text-5xl">
          Permit lead tools, <span className="accent">compared</span>
        </h1>
        <p className="mt-4 max-w-[62ch] text-lg text-ink-2">
          Every permit lead tool starts with the same public records. They differ in who they are built for, how fresh the data is,
          and how much work is left for you. Here are the four kinds, and where PatioPing fits.
        </p>

        <div className="mt-10 overflow-hidden rounded-3xl border border-white bg-white shadow-[var(--shadow-card)]">
          <div className="hidden grid-cols-[1fr_1fr_1.4fr_1.4fr] gap-4 border-b border-line bg-deck/70 px-6 py-3 text-xs font-medium text-ink-3 md:grid">
            <span>Kind</span>
            <span>Example</span>
            <span>Built for</span>
            <span>What you get</span>
          </div>
          <ul className="divide-y divide-line">
            {KINDS.map((k) => (
              <li key={k.kind} className="grid gap-1 px-6 py-5 md:grid-cols-[1fr_1fr_1.4fr_1.4fr] md:gap-4">
                <span className="font-medium">{k.kind}</span>
                <a href={k.href} target="_blank" rel="noreferrer nofollow" className="text-water underline">{k.example}</a>
                <span className="text-ink-2">{k.built}</span>
                <span className="text-ink-2">{k.get}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-3 text-xs text-ink-3">Product names belong to their owners. Check each vendor&rsquo;s site for current features and pricing.</p>

        <div className="mt-14 grid gap-3 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-white bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="text-2xl font-medium">
              Where <span className="accent">PatioPing</span> fits
            </h2>
            <p className="mt-2 text-ink-2">
              An alert tool for small backyard contractors who want the new jobs in their area every morning, not a database to work.
            </p>
            <ul className="mt-6 divide-y divide-line">
              {ROWS.map(([label, yes]) => (
                <li key={label} className="flex items-center justify-between py-3">
                  <span className={yes ? "" : "text-ink-3"}>{label}</span>
                  {yes ? <Check size={18} strokeWidth={2.5} className="text-water" aria-label="Yes" /> : <Minus size={18} className="text-ink-3" aria-label="Not yet" />}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-line bg-[#f2f7fa] p-6 sm:p-8">
            <h2 className="text-2xl font-medium">When something else is the better pick</h2>
            <ul className="mt-5 space-y-4 text-ink-2">
              <li>You need permits across many states for analysis or a product: a data API.</li>
              <li>You want large lists across many trades and markets: a lead subscription.</li>
              <li>You have an engineer and want raw records cheaply: a scraper.</li>
              <li>Your area isn&rsquo;t covered yet: <Link href="/#faq" className="text-water underline">check coverage</Link> or request your county.</li>
            </ul>
          </div>
        </div>
      </div>
      <ClosingBand title={<>Try PatioPing free for a <span className="accent">week</span>.</>} />
    </ArticleShell>
  );
}
