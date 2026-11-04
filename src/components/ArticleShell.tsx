import { SiteHeader } from "@/components/marketing";

/** Light page frame for reading pages: guides, comparisons. */
export function ArticleShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-bg">
      <div className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[520px] bg-[url(/art/hills-hero.webp)] bg-cover bg-[center_top] opacity-70 [mask-image:linear-gradient(to_bottom,black_40%,transparent)]" />
        <div className="relative pt-3 sm:pt-4">
          <SiteHeader />
          {children}
        </div>
      </div>
    </main>
  );
}
