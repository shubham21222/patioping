import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ArticleShell } from "@/components/ArticleShell";
import { ClosingBand } from "@/components/marketing";
import { GUIDES } from "@/lib/seo/guides";

export const metadata: Metadata = {
  title: "Guides for pool, fence and landscaping contractors",
  description: "Practical guides on finding customers from public building permits: where the data comes from, when to reach out, and what to send.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndex() {
  return (
    <ArticleShell>
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-16 sm:pt-24">
        <h1 className="text-4xl font-medium leading-tight sm:text-5xl">
          <span className="accent">Guides</span> for backyard contractors
        </h1>
        <p className="mt-4 text-lg text-ink-2">How to turn public permit records into customers, without the guesswork.</p>
        <ul className="mt-10 space-y-3">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}`} className="group block rounded-3xl border border-white bg-white p-6 shadow-[var(--shadow-card)]">
                <span className="flex items-start justify-between gap-4">
                  <span className="text-xl font-medium">{g.title}</span>
                  <ArrowUpRight size={18} className="mt-1 shrink-0 text-water transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
                <span className="mt-2 block text-ink-2">{g.description}</span>
                <span className="mt-3 block text-sm text-ink-3">{g.readMinutes} min read</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <ClosingBand title={<>Get new permits in your area at <span className="accent">7 AM</span>.</>} />
    </ArticleShell>
  );
}
