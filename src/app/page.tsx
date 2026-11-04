import Link from "next/link";
import { ArrowRight, Check, MailOpen } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { DepthMarker, Waterline } from "@/components/brand/Waterline";
import { button } from "@/components/ui";
import { PLANS } from "@/lib/plans";

// Illustrative only: shown inside a frame labeled "Sample alert".
const sample = [
  { addr: "4812 Ridgeview Dr", zip: "78745", work: "Pool + spa", value: 92000, builder: "Hill Country Pools", high: true },
  { addr: "1907 Barton Hills Dr", zip: "78704", work: "Pool", value: 78500, builder: "Blue Haven Pools", high: true },
  { addr: "6203 Shadow Valley", zip: "78731", work: "Pool", value: 54000, builder: "Reeds Pools", high: false },
  { addr: "311 Pecan Grove Rd", zip: "78745", work: "Spa", value: 18200, builder: "Owner-builder", high: false },
];

const stages = ["New", "Contacted", "Postcard sent", "Quoted", "Won"];

const faqs = [
  {
    q: "Where does the data come from?",
    a: "Public building-permit records that cities and counties publish on their open-data portals. We read them overnight, keep the pool and spa permits, and match them to your zip codes.",
  },
  {
    q: "Is it legal to use permit data?",
    a: "Building permits are public records. PatioPing never calls, texts or emails homeowners on your behalf. You decide how to reach out, and we can mail a postcard for you.",
  },
  {
    q: "Which areas do you cover?",
    a: "We're launching with Austin, Mesa, Los Angeles, Miami-Dade, Maricopa County and Nashville, then adding counties across Texas, Arizona and Florida.",
  },
  {
    q: "How do I cancel?",
    a: "From Settings → Billing, any time. Your plan runs to the end of the period you paid for. No contracts.",
  },
];

export default function Home() {
  return (
    <main>
      {/* ───── Water ───── */}
      <section className="bg-deep text-white">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <Logo tone="reverse" animate />
          <nav className="flex items-center gap-1 sm:gap-2">
            <span className="hidden sm:contents">
              <a href="#pricing" className={button("ghostOnDeep")}>Pricing</a>
            </span>
            <Link href="/login" className={button("ghostOnDeep")}>Log in</Link>
            <Link href="/signup" className={button("onDeep")}>
              Start free<span className="hidden sm:inline">&nbsp;week</span>
            </Link>
          </nav>
        </header>

        <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pb-24 lg:pt-16">
          <div>
            <h1 className="text-[2.6rem] font-extrabold leading-[1.02] [font-stretch:87.5%] sm:text-6xl lg:text-[4.25rem]">
              Every new pool in your zip codes, the morning it&rsquo;s permitted.
            </h1>
            <p className="mt-6 max-w-[52ch] text-lg text-on-deep-2">
              By the time a pool is permitted, the homeowner has picked a builder. They haven&rsquo;t picked who cleans it.
              PatioPing reads city and county permit records overnight and puts those addresses in your inbox before your first stop.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/signup" className={button("onDeep", "lg")}>
                Start your free week <ArrowRight size={18} strokeWidth={2.25} />
              </Link>
              <span className="text-sm text-on-deep-2">7 days free. No card needed.</span>
            </div>
          </div>

          <SampleAlert />
        </div>
      </section>

      {/* ───── Waterline + coping ───── */}
      <Waterline />
      <div className="border-b border-line bg-deck">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-10 gap-y-5 px-4 py-6 sm:px-6">
          <DepthMarker value="7" unit="AM" caption="Alert lands in your time zone" />
          <DepthMarker value="7" unit="DAYS" caption="Free before you pay anything" />
          <DepthMarker value="$49" caption="Per month for one county" />
        </div>
      </div>

      {/* ───── Pipeline ───── */}
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:items-center">
        <div>
          <h2 className="text-3xl font-extrabold leading-tight [font-stretch:87.5%] sm:text-[2.6rem]">
            From permit to a stop on your route
          </h2>
          <p className="mt-5 max-w-[50ch] text-lg text-ink-2">
            Most pool companies track leads in a notebook or a group text. Every lead in PatioPing comes with a simple pipeline:
            mark it contacted from the truck, set a follow-up, and log the monthly price when you win it.
          </p>
          <ul className="mt-7 space-y-3 text-ink">
            {["Notes and follow-up reminders on every address", "One-click postcards to the homeowner", "Export to CSV whenever you want"].map((t) => (
              <li key={t} className="flex gap-3">
                <Check size={20} className="mt-0.5 shrink-0 text-water" strokeWidth={2.5} />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <PipelinePreview />
      </section>

      {/* ───── The math ───── */}
      <section className="bg-deck">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <h2 className="max-w-[18ch] text-4xl font-extrabold leading-[1.05] [font-stretch:87.5%] sm:text-6xl">
            One new account pays for the year.
          </h2>
          <dl className="mt-12 grid max-w-3xl gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            <div className="bg-white p-6 sm:p-8">
              <dt className="text-sm font-semibold text-ink-2">PatioPing Starter, 12 months</dt>
              <dd className="marker mt-3 text-5xl text-ink">$588</dd>
              <dd className="num mt-2 text-sm text-ink-3">$49 × 12</dd>
            </div>
            <div className="bg-white p-6 sm:p-8">
              <dt className="text-sm font-semibold text-ink-2">One weekly-service pool at $150/mo</dt>
              <dd className="marker mt-3 text-5xl text-water">$1,800</dd>
              <dd className="num mt-2 text-sm text-ink-3">$150 × 12, every year they stay</dd>
            </div>
          </dl>
          <p className="mt-6 max-w-[60ch] text-sm text-ink-3">
            Plug in your own monthly price. The math is the same.
          </p>
        </div>
      </section>

      {/* ───── Pricing ───── */}
      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-8 px-4 py-24 sm:px-6">
        <h2 className="text-3xl font-extrabold [font-stretch:87.5%] sm:text-[2.6rem]">Pricing</h2>
        <p className="mt-3 text-lg text-ink-2">Every plan starts with 7 free days. Pay yearly and get 2 months free.</p>

        <div className="mt-12 grid overflow-hidden rounded-2xl border border-line lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <div
              key={p.id}
              className={`flex flex-col p-6 sm:p-8 ${i > 0 ? "border-t border-line lg:border-l lg:border-t-0" : ""} ${p.featured ? "bg-deep text-white" : "bg-white"}`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-bold">{p.name}</h3>
                {p.featured && <span className="text-sm font-semibold text-aqua">For crews</span>}
              </div>
              <p className={`mt-1 text-sm ${p.featured ? "text-on-deep-2" : "text-ink-2"}`}>{p.blurb}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="marker text-5xl">${p.price}</span>
                <span className={p.featured ? "text-on-deep-2" : "text-ink-3"}>/ month</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Check size={18} strokeWidth={2.5} className={`mt-0.5 shrink-0 ${p.featured ? "text-aqua" : "text-water"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={`/signup?plan=${p.id}`} className={`mt-8 ${button(p.featured ? "onDeep" : "quiet", "lg")}`}>
                Start free with {p.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-3xl font-extrabold [font-stretch:87.5%] sm:text-[2.6rem]">Questions</h2>
          <div className="divide-y divide-line border-y border-line">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition-transform duration-200 group-open:rotate-45">
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
                  </span>
                </summary>
                <p className="mt-3 max-w-[65ch] text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Close ───── */}
      <Waterline />
      <section className="bg-deep text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 py-20 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-[20ch] text-4xl font-extrabold leading-[1.05] [font-stretch:87.5%] sm:text-5xl">
            Tomorrow at 7 AM, see who&rsquo;s putting in a pool.
          </h2>
          <Link href="/signup" className={button("onDeep", "lg")}>
            Start your free week <ArrowRight size={18} strokeWidth={2.25} />
          </Link>
        </div>
        <footer className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-on-deep-2 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Logo tone="reverse" height={22} />
            <p>© {new Date().getFullYear()} PatioPing. Built on public permit records.</p>
          </div>
        </footer>
      </section>
    </main>
  );
}

function SampleAlert() {
  return (
    <figure className="overflow-hidden rounded-2xl bg-white text-ink shadow-[0_24px_60px_-20px_rgba(3,20,40,0.55)]">
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <MailOpen size={18} className="text-ink-3" />
        <div className="min-w-0">
          <p className="truncate font-semibold">4 new pools in your area today</p>
          <p className="text-sm text-ink-3">PatioPing · 7:00 AM</p>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="text-sm text-ink-2">
          <span className="font-semibold text-ink">2 high value</span> · 78704, 78731, 78745
        </p>
        <ol className="mt-3 divide-y divide-line">
          {sample.map((l) => (
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

function PipelinePreview() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-deck p-3 sm:p-4" role="img" aria-label="Pipeline with stages New, Contacted, Postcard sent, Quoted and Won">
      <div className="grid min-w-[560px] grid-cols-5 gap-2">
        {stages.map((s, i) => (
          <div key={s}>
            <p className="mb-2 flex items-center justify-between px-1 text-xs font-semibold text-ink-2">
              {s}
              <span className="num text-ink-3">{[2, 1, 1, 1, 1][i]}</span>
            </p>
            <div className="space-y-2">
              {i === 0 && <MiniCard addr="4812 Ridgeview" meta="Pool + spa" high />}
              {i === 0 && <MiniCard addr="311 Pecan Grove" meta="Spa" />}
              {i === 1 && <MiniCard addr="1907 Barton Hills" meta="Follow up Thu" />}
              {i === 2 && <MiniCard addr="6203 Shadow Valley" meta="Mailed Mon" />}
              {i === 3 && <MiniCard addr="88 Lost Creek" meta="$165/mo quote" />}
              {i === 4 && <MiniCard addr="2210 Oak Bend" meta="$150/mo" won />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniCard({ addr, meta, high, won }: { addr: string; meta: string; high?: boolean; won?: boolean }) {
  return (
    <div className={`rounded-lg border bg-white p-2.5 ${won ? "border-water" : "border-line"}`}>
      <p className="flex items-center gap-1.5 text-[13px] font-semibold">
        {high && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sun" />}
        <span className="truncate">{addr}</span>
      </p>
      <p className={`mt-0.5 truncate text-xs ${won ? "font-semibold text-water" : "text-ink-3"}`}>{meta}</p>
    </div>
  );
}
