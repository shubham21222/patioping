import Link from "next/link";
import { ArrowRight, MailOpen } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Waterline } from "@/components/brand/Waterline";
import { TradeIcon } from "@/components/TradeIcon";
import { button } from "@/components/ui";
import { LIVE_TRADES } from "@/lib/trades";

export function SiteHeader({ signupHref = "/signup" }: { signupHref?: string }) {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
      <Logo tone="reverse" animate />
      <nav className="flex items-center gap-1 sm:gap-2">
        <span className="hidden md:contents">
          <Link href="/#trades" className={button("ghostOnDeep")}>Trades</Link>
          <Link href="/#pricing" className={button("ghostOnDeep")}>Pricing</Link>
        </span>
        <Link href="/login" className={button("ghostOnDeep")}>Log in</Link>
        <Link href={signupHref} className={button("onDeep")}>
          <span className="sm:hidden">Start free</span>
          <span className="hidden sm:inline">Start free week</span>
        </Link>
      </nav>
    </header>
  );
}

export type AlertItem = { addr: string; zip: string; work: string; value: number; builder: string; high?: boolean };

export function SampleAlert({ subject, items }: { subject: string; items: AlertItem[] }) {
  const zips = [...new Set(items.map((i) => i.zip))].sort().join(", ");
  const high = items.filter((i) => i.high).length;
  return (
    <figure className="overflow-hidden rounded-2xl bg-white text-ink shadow-[0_24px_60px_-20px_rgba(3,20,40,0.55)]">
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <MailOpen size={18} className="shrink-0 text-ink-3" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{subject}</p>
          <p className="text-sm text-ink-3">PatioPing · 7:00 AM</p>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="text-sm text-ink-2">
          {high > 0 && <><span className="font-semibold text-ink">{high} high value</span> · </>}
          {zips}
        </p>
        <ol className="mt-3 divide-y divide-line">
          {items.map((l) => (
            <li key={l.addr} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-semibold">
                  {l.high && <span className="h-2 w-2 shrink-0 rounded-full bg-sun" aria-label="High value" />}
                  <span className="truncate">{l.addr}</span>
                </p>
                <p className="truncate text-sm text-ink-2">
                  {l.work} · {l.builder} · {l.zip}
                </p>
              </div>
              <p className="num shrink-0 font-semibold">${l.value.toLocaleString("en-US")}</p>
            </li>
          ))}
        </ol>
      </div>
      <figcaption className="border-t border-line bg-deck px-5 py-2.5 text-xs text-ink-3">
        Sample alert. Addresses are illustrative.
      </figcaption>
    </figure>
  );
}

/** Live trades as rows: what we catch, and a link to the trade's own page. */
export function LiveTradeList({ exclude }: { exclude?: string }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {LIVE_TRADES.filter((t) => t.id !== exclude).map((t) => (
        <li key={t.id}>
          <Link
            href={`/${t.slug}`}
            className="group grid gap-x-8 gap-y-2 py-6 sm:grid-cols-[16rem_1fr_auto] sm:items-center sm:px-2"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-deep text-aqua">
                <TradeIcon name={t.icon} size={22} />
              </span>
              <span className="text-xl font-bold [font-stretch:87.5%]">{t.name}</span>
            </span>
            <span className="text-ink-2">
              {t.pitch.why}
              <span className="mt-1 block text-sm text-ink-3">Permits with: {t.keywords.slice(0, 5).join(", ")}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-water group-hover:underline">
              {t.name} alerts <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function ClosingBand({ headline, href = "/signup" }: { headline: string; href?: string }) {
  return (
    <>
      <Waterline />
      <section className="bg-deep text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 py-20 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-[20ch] text-4xl font-extrabold leading-[1.05] [font-stretch:87.5%] sm:text-5xl">{headline}</h2>
          <Link href={href} className={button("onDeep", "lg")}>
            Start your free week <ArrowRight size={18} strokeWidth={2.25} />
          </Link>
        </div>
        <footer className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 text-sm text-on-deep-2 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Logo tone="reverse" height={22} />
            <nav aria-label="Trades" className="flex flex-wrap gap-x-5 gap-y-2">
              {LIVE_TRADES.map((t) => (
                <Link key={t.id} href={`/${t.slug}`} className="hover:text-white">{t.name}</Link>
              ))}
            </nav>
            <p>© {new Date().getFullYear()} PatioPing. Built on public permit records.</p>
          </div>
        </footer>
      </section>
    </>
  );
}
