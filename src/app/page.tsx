import Link from "next/link";
import { Logo } from "@/components/Logo";

const plans = [
  { name: "Starter", price: 49, features: ["1 county", "Daily email alerts", "Basic CRM", "CSV export"] },
  { name: "Growth", price: 149, features: ["3 counties", "Team access", "ROI dashboard"], featured: true },
  { name: "Pro", price: 299, features: ["Unlimited territory", "Priority sources", "API / webhook"] },
];

const faqs = [
  { q: "Where does the data come from?", a: "Official public building-permit records published by US cities and counties through their open-data portals." },
  { q: "Is this legal?", a: "Yes. Building permits are public records. PatioPing never calls, texts or emails homeowners for you." },
  { q: "How do I cancel?", a: "Any time, in one click from Settings → Billing. No contracts." },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <nav className="flex items-center gap-4 text-sm font-medium">
          <a href="#pricing" className="hidden text-slate-600 hover:text-slate-900 sm:inline">Pricing</a>
          <Link href="/login" className="text-slate-600 hover:text-slate-900">Log in</Link>
          <Link href="/signup" className="rounded-lg bg-pool px-4 py-2 text-white hover:bg-pool-dark">Start free</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
        <p className="mb-4 inline-block rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-pool-dark">
          New pool & backyard permit alerts for contractors
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
          Know about every new pool in your area, <span className="text-pool">before your competitors do.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
          Every morning we scan public permit records and email you the new pools in your zip codes. One new customer pays for a year of PatioPing.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup" className="w-full rounded-lg bg-pool px-6 py-3 text-lg font-semibold text-white hover:bg-pool-dark sm:w-auto">
            First week free, no card
          </Link>
        </div>

        <div className="mx-auto mt-14 max-w-md rounded-2xl border border-slate-200 p-5 text-left shadow-sm">
          <p className="text-sm font-semibold text-slate-500">This week in Austin: <span className="text-slate-900">34 new pools</span></p>
          <div className="mt-3 select-none rounded-xl bg-slate-50 p-4 blur-[3px]">
            <p className="font-semibold">🔥 1234 Oak St, Austin 78704</p>
            <p className="text-sm text-slate-600">Pool + spa · $85,000 · Blue Haven Pools</p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-3">
          {[
            ["1", "Pick your area", "Choose your trade and the zip codes you serve."],
            ["2", "Get a daily alert", "New permits in your inbox at 7am, your time."],
            ["3", "Win the customer", "Track every lead from New to Won in the built-in CRM."],
          ].map(([n, t, d]) => (
            <div key={n} className="rounded-2xl bg-white p-6 shadow-sm">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-teal text-white font-bold">{n}</span>
              <h3 className="mt-4 text-lg font-semibold">{t}</h3>
              <p className="mt-1 text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold">Simple pricing</h2>
        <p className="mt-2 text-center text-slate-600">7-day free trial. Annual plans get 2 months free.</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={`rounded-2xl border p-6 ${p.featured ? "border-pool shadow-lg" : "border-slate-200"}`}>
              <h3 className="font-semibold">{p.name}</h3>
              <p className="mt-2 text-4xl font-extrabold">${p.price}<span className="text-base font-medium text-slate-500">/mo</span></p>
              <ul className="mt-4 space-y-2 text-slate-600">
                {p.features.map((f) => <li key={f}>✓ {f}</li>)}
              </ul>
              <Link href="/signup" className="mt-6 block rounded-lg bg-pool px-4 py-2 text-center font-semibold text-white hover:bg-pool-dark">Start free trial</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20">
        <h2 className="text-center text-3xl font-bold">FAQ</h2>
        <div className="mt-8 space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="rounded-xl border border-slate-200 p-4">
              <summary className="cursor-pointer font-semibold">{f.q}</summary>
              <p className="mt-2 text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} PatioPing
      </footer>
    </main>
  );
}
