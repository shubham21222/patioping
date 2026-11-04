import Link from "next/link";
import { ArrowUpRight, CreditCard, Inbox, KanbanSquare, MailOpen, MapPinned, Search } from "lucide-react";
import { Logo, Mark } from "@/components/brand/Logo";
import { TradeIcon } from "@/components/TradeIcon";
import { button } from "@/components/ui";
import { LIVE_TRADES } from "@/lib/trades";
import { CITIES } from "@/lib/seo/cities";
import { GUIDES } from "@/lib/seo/guides";

/* ───────────────────────── Buttons ───────────────────────── */

/** Primary pill with the trailing arrow disc. */
export function CtaButton({ href, children, size = "lg" }: { href: string; children: React.ReactNode; size?: "md" | "lg" }) {
  return (
    <Link href={href} className={`${button("primary", size)} group pr-1.5`}>
      {children}
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-water transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:rotate-45">
        <ArrowUpRight size={16} strokeWidth={2.25} />
      </span>
    </Link>
  );
}

export function GhostButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={`${button("quiet", "lg")} bg-white/80 backdrop-blur-sm`}>
      {children}
    </Link>
  );
}

/* ───────────────────────── Header ───────────────────────── */

export function SiteHeader({ signupHref = "/signup" }: { signupHref?: string }) {
  return (
    <div className="sticky top-3 z-30 px-3 sm:top-4">
      <header className="mx-auto flex h-14 max-w-4xl items-center justify-between rounded-full border border-white/80 bg-white/75 pl-4 pr-2 shadow-[var(--shadow-card)] backdrop-blur-md">
        <Logo height={22} animate />
        <nav aria-label="Main" className="hidden items-center gap-1 text-[14px] text-ink-2 md:flex">
          {[
            ["/#trades", "Trades"],
            ["/#how", "How it works"],
            ["/#pricing", "Pricing"],
            ["/#faq", "FAQ"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-full px-3 py-2 hover:bg-deck hover:text-ink">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <Link href="/login" className={button("quiet", "md")}>Sign in</Link>
          <Link href={signupHref} className={`${button("primary", "md")} hidden sm:inline-flex`}>Start free week</Link>
        </div>
      </header>
    </div>
  );
}

/* ───────────────────────── Hero mock ───────────────────────── */

const MOCK_ROWS = [
  { a: "4812 Ridgeview Dr", z: "78745", w: "Pool + spa", v: "$92,000", s: "New", t: "waves" as const, hi: true },
  { a: "1907 Barton Hills Dr", z: "78704", w: "Covered patio", v: "$48,000", s: "Contacted", t: "trees" as const },
  { a: "6203 Shadow Valley", z: "78731", w: "Privacy fence", v: "$9,800", s: "Quoted", t: "fence" as const },
  { a: "88 Lost Creek Blvd", z: "78746", w: "Pool", v: "$78,500", s: "New", t: "waves" as const, hi: true },
  { a: "311 Pecan Grove Rd", z: "78745", w: "Pergola + pavers", v: "$16,400", s: "Won", t: "trees" as const },
];

export const STAGE_STYLE: Record<string, string> = {
  New: "bg-water-soft text-water",
  Contacted: "bg-violet-soft text-violet",
  "Postcard sent": "bg-deck-2 text-ink-2",
  Quoted: "bg-sun-soft text-sun-ink",
  Won: "bg-green-soft text-green",
  Lost: "bg-danger-soft text-danger",
};

/** A non-interactive picture of the leads screen, used in the hero. Illustrative data. */
export function DashboardPreview() {
  const nav = [
    { Icon: Inbox, l: "Leads", n: "5" },
    { Icon: KanbanSquare, l: "Pipeline", n: "" },
    { Icon: MapPinned, l: "Territory", n: "" },
    { Icon: CreditCard, l: "Billing", n: "" },
  ];
  return (
    <div
      role="img"
      aria-label="Illustration of the PatioPing leads screen with sample data"
      className="rise relative grid grid-cols-[184px_1fr] overflow-hidden rounded-[22px] border border-white bg-white/90 text-left shadow-[var(--shadow-float)] backdrop-blur max-md:grid-cols-1"
    >
      <span className="absolute right-3 top-3 z-10 rounded-full border border-line bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink-3 sm:hidden">
        Illustrative data
      </span>
      <aside className="border-r border-line bg-deck/60 p-4 max-md:hidden">
        <Logo height={18} />
        <div className="mt-5 flex h-8 items-center gap-2 rounded-lg border border-line bg-white px-2.5 text-xs text-ink-3">
          <Search size={13} /> Search
        </div>
        <ul className="mt-4 space-y-1 text-[13px]">
          {nav.map(({ Icon, l, n }, i) => (
            <li key={l} className={`flex items-center gap-2 rounded-lg px-2.5 py-2 ${i === 0 ? "bg-ink text-white" : "text-ink-2"}`}>
              <Icon size={14} /> <span className="flex-1">{l}</span>
              {n && <span className="rounded-md bg-white/20 px-1.5 text-[11px]">{n}</span>}
            </li>
          ))}
        </ul>
      </aside>
      <div className="min-w-0 p-4 sm:p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs text-ink-3">
              Good morning, Mike
              <span className="rounded-full border border-line px-2 py-0.5 text-[10px] font-medium max-sm:hidden">Illustrative data</span>
            </p>
            <p className="mt-0.5 text-xl font-medium tracking-tight">5 new projects today</p>
          </div>
          <div className="flex gap-5 text-right max-sm:hidden">
            {[
              ["12", "this week"],
              ["2", "high value"],
              ["$1.8k", "won / mo"],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="marker text-lg">{n}</p>
                <p className="text-[11px] text-ink-3">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-line">
          <div className="grid grid-cols-[1.6fr_1fr_0.8fr_0.7fr] gap-3 border-b border-line bg-deck/70 px-3 py-2 text-[11px] font-medium text-ink-3 max-sm:grid-cols-[1.6fr_0.8fr]">
            <span>Address</span>
            <span className="max-sm:hidden">Work</span>
            <span className="text-right">Value</span>
            <span className="max-sm:hidden">Stage</span>
          </div>
          {MOCK_ROWS.map((r) => (
            <div
              key={r.a}
              className="grid grid-cols-[1.6fr_1fr_0.8fr_0.7fr] items-center gap-3 border-b border-line px-3 py-2.5 text-[12.5px] last:border-0 max-sm:grid-cols-[1.6fr_0.8fr]"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-water-soft text-water">
                  <TradeIcon name={r.t} size={13} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{r.a}</span>
                  <span className="block text-[11px] text-ink-3">{r.z}</span>
                </span>
              </span>
              <span className="truncate text-ink-2 max-sm:hidden">{r.w}</span>
              <span className="num flex items-center justify-end gap-1.5 font-medium">
                {r.hi && <span className="h-1.5 w-1.5 rounded-full bg-sun" />}
                {r.v}
              </span>
              <span className="max-sm:hidden">
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STAGE_STYLE[r.s]}`}>{r.s}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Sample alert ───────────────────────── */

export type AlertItem = { addr: string; zip: string; work: string; value: number; builder: string; high?: boolean };

export function SampleAlert({ subject, items }: { subject: string; items: AlertItem[] }) {
  const zips = [...new Set(items.map((i) => i.zip))].sort().join(", ");
  const high = items.filter((i) => i.high).length;
  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-white text-ink shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <MailOpen size={16} className="shrink-0 text-ink-3" />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium">{subject}</p>
          <p className="text-xs text-ink-3">PatioPing · 7:00 AM</p>
        </div>
      </div>
      <div className="px-4 py-3">
        <p className="text-xs text-ink-2">
          {high > 0 && (
            <>
              <span className="font-medium text-ink">{high} high value</span> ·{" "}
            </>
          )}
          {zips}
        </p>
        <ol className="mt-2 divide-y divide-line">
          {items.map((l) => (
            <li key={l.addr} className="flex items-start justify-between gap-4 py-2.5">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[14px] font-medium">
                  {l.high && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sun" aria-label="High value" />}
                  <span className="truncate">{l.addr}</span>
                </p>
                <p className="truncate text-xs text-ink-2">
                  {l.work} · {l.builder} · {l.zip}
                </p>
              </div>
              <p className="num shrink-0 text-[14px] font-medium">${l.value.toLocaleString("en-US")}</p>
            </li>
          ))}
        </ol>
      </div>
      <figcaption className="border-t border-line bg-deck px-4 py-2 text-[11px] text-ink-3">
        Sample alert. Addresses and builders are illustrative. Builder shown where the city publishes it.
      </figcaption>
    </figure>
  );
}

/* ───────────────────────── Trades ───────────────────────── */

export function TradeCards({ exclude, highlight }: { exclude?: string; highlight?: string }) {
  const list = LIVE_TRADES.filter((t) => t.id !== exclude);
  return (
    <div className={`grid gap-3 ${list.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
      {list.map((t) => {
        const on = t.id === (highlight ?? list[0].id);
        return (
          <Link
            key={t.id}
            href={`/${t.slug}`}
            className={`group flex flex-col rounded-2xl border p-5 transition-colors ${
              on ? "border-[#cfe3f1] bg-water-soft" : "border-line bg-white hover:border-line-2"
            }`}
          >
            <span className={`grid h-10 w-10 place-items-center rounded-full ${on ? "bg-water text-white" : "bg-water-soft text-water"}`}>
              <TradeIcon name={t.icon} size={19} />
            </span>
            <span className="mt-8 text-[17px] font-medium">{t.name}</span>
            <span className="mt-1 text-sm text-ink-2">{t.pitch.why}</span>
            <span className="mt-4 text-xs text-ink-3">{t.keywords.slice(0, 4).join(" · ")}</span>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-water">
              {t.name} alerts
              <ArrowUpRight size={15} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/* ───────────────────────── Closing + footer ───────────────────────── */

export function ClosingBand({ title, href = "/signup" }: { title: React.ReactNode; href?: string }) {
  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-[url(/art/hills-band.webp)] bg-cover bg-bottom [mask-image:linear-gradient(to_bottom,transparent,black_35%)]" />
        <div className="relative mx-auto max-w-3xl px-4 pb-40 pt-28 text-center sm:pb-56">
          <h2 className="text-4xl font-medium leading-[1.05] sm:text-[3.2rem]">{title}</h2>
          <p className="mt-4 text-ink-2">Start your free 7-day trial. No card needed.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <GhostButton href="/#pricing">See pricing</GhostButton>
            <CtaButton href={href}>Start free week</CtaButton>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr_1fr]">
        <div>
          <Logo height={22} />
          <p className="mt-4 max-w-[38ch] text-sm text-ink-2">
            Daily alerts for new pool, fence and outdoor permits, with a simple pipeline to turn them into customers.
          </p>
        </div>
        <nav aria-label="Trades">
          <p className="text-sm font-medium">Trades</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-2">
            {LIVE_TRADES.map((t) => (
              <li key={t.id}>
                <Link href={`/${t.slug}`} className="hover:text-ink">{t.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Product">
          <p className="text-sm font-medium">Product</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-2">
            <li><Link href="/#how" className="hover:text-ink">How it works</Link></li>
            <li><Link href="/#pricing" className="hover:text-ink">Pricing</Link></li>
            <li><Link href="/login" className="hover:text-ink">Sign in</Link></li>
            <li><Link href="/signup" className="hover:text-ink">Start free week</Link></li>
          </ul>
        </nav>
        <nav aria-label="Resources">
          <p className="text-sm font-medium">Resources</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-2">
            {GUIDES.map((g) => (
              <li key={g.slug}><Link href={`/guides/${g.slug}`} className="hover:text-ink">{g.title}</Link></li>
            ))}
            <li><Link href="/alternatives" className="hover:text-ink">Permit lead tools compared</Link></li>
          </ul>
        </nav>
        {CITIES.length > 0 && (
          <nav aria-label="Cities">
            <p className="text-sm font-medium">Cities</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-2">
              {CITIES.map((c) => (
                <li key={c.slug}><Link href={`/pool-service/${c.slug}`} className="hover:text-ink">Pool permits in {c.name}, {c.state}</Link></li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 text-xs text-ink-3 sm:px-6">
          <span className="flex items-center gap-2">
            <Mark size={16} /> © {new Date().getFullYear()} PatioPing
          </span>
          <span>Built on public permit records</span>
        </div>
      </div>
    </footer>
  );
}
