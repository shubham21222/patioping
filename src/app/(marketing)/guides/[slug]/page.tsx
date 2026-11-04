import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { ArticleShell } from "@/components/ArticleShell";
import { ClosingBand, CtaButton } from "@/components/marketing";
import { GUIDES, guideBySlug } from "@/lib/seo/guides";
import { SITE } from "@/lib/seo/cities";

export const dynamicParams = false;
export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = guideBySlug((await params).slug);
  if (!g) return {};
  return {
    title: g.seoTitle,
    description: g.description,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: { type: "article", title: g.seoTitle, description: g.description, modifiedTime: g.updated },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  const others = GUIDES.filter((x) => x.slug !== g.slug);

  return (
    <ArticleShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: g.title,
          description: g.description,
          dateModified: g.updated,
          datePublished: g.updated,
          author: { "@type": "Organization", name: "PatioPing", url: SITE },
          publisher: { "@type": "Organization", name: "PatioPing", logo: { "@type": "ImageObject", url: `${SITE}/brand/patioping-logo.png` } },
          mainEntityOfPage: `${SITE}/guides/${g.slug}`,
        }}
      />
      <article className="mx-auto max-w-[68ch] px-4 pb-20 pt-16 sm:pt-24">
        <nav aria-label="Breadcrumb" className="text-sm text-ink-3">
          <Link href="/guides" className="hover:text-ink">Guides</Link>
        </nav>
        <h1 className="mt-4 text-4xl font-medium leading-[1.1] sm:text-5xl">{g.title}</h1>
        <p className="mt-4 text-sm text-ink-3">
          Updated {new Date(g.updated).toLocaleDateString("en-US", { dateStyle: "long" })} · {g.readMinutes} min read
        </p>
        <div className="mt-10 space-y-5 text-[17px] leading-[1.7] text-ink-2">
          {g.body.map((b, i) => {
            if ("h2" in b) return <h2 key={i} className="pt-6 text-2xl font-medium leading-snug text-ink">{b.h2}</h2>;
            if ("ul" in b)
              return (
                <ul key={i} className="list-disc space-y-2 pl-5 marker:text-water">
                  {b.ul.map((li) => <li key={li}>{li}</li>)}
                </ul>
              );
            if ("quote" in b)
              return (
                <figure key={i} className="rounded-2xl border border-line bg-white p-5">
                  <blockquote className="text-ink">{b.quote}</blockquote>
                  {b.note && <figcaption className="mt-2 text-sm text-ink-3">{b.note}</figcaption>}
                </figure>
              );
            if ("cta" in b)
              return (
                <div key={i} className="rounded-3xl bg-water-soft p-6">
                  <p className="font-medium text-ink">PatioPing does the searching for you.</p>
                  <p className="mt-1">Every new pool, fence and patio permit in your zip codes, by email at 7 AM, with a pipeline to track follow-ups.</p>
                  <div className="mt-4"><CtaButton href="/signup" size="md">Start free week</CtaButton></div>
                </div>
              );
            return <p key={i}>{b.p}</p>;
          })}
        </div>
        {g.sources && (
          <aside className="mt-10 border-t border-line pt-6 text-sm text-ink-3">
            <p className="font-medium text-ink-2">Sources</p>
            <ul className="mt-2 space-y-1">
              {g.sources.map((s) => (
                <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer" className="underline hover:text-ink">{s.label}</a></li>
              ))}
            </ul>
          </aside>
        )}
        {others.length > 0 && (
          <aside className="mt-10">
            <p className="font-medium">Keep reading</p>
            <ul className="mt-3 space-y-2">
              {others.map((o) => (
                <li key={o.slug}><Link href={`/guides/${o.slug}`} className="text-water underline">{o.title}</Link></li>
              ))}
            </ul>
          </aside>
        )}
      </article>
      <ClosingBand title={<>Get new permits in your area at <span className="accent">7 AM</span>.</>} />
    </ArticleShell>
  );
}
