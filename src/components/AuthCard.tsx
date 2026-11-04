import { Logo } from "@/components/brand/Logo";

export function AuthShell({
  title,
  lede,
  children,
  footer,
}: {
  title: string;
  lede?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-bg">
      <div aria-hidden="true" className="absolute inset-0 bg-[url(/art/hills-hero.webp)] bg-cover bg-[center_top]" />
      <div className="relative flex min-h-dvh flex-col items-center px-4 py-10 sm:py-16">
        <Logo height={26} />
        <div className="mt-8 w-full max-w-[420px] rounded-[24px] border border-white bg-white/90 p-6 shadow-[var(--shadow-float)] backdrop-blur sm:p-8">
          <h1 className="text-[1.9rem] font-medium leading-tight">{title}</h1>
          {lede && <p className="mt-1.5 text-ink-2">{lede}</p>}
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-7 border-t border-line pt-5 text-sm text-ink-2">{footer}</div>}
        </div>
        <p className="mt-6 max-w-[40ch] text-center text-sm text-ink-2">
          New pool, fence and patio permits in your zip codes, every morning at 7 AM.
        </p>
      </div>
    </main>
  );
}

export function Notice({ tone, children }: { tone: "error" | "info"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`mb-5 rounded-xl px-3.5 py-3 text-sm ${tone === "error" ? "bg-danger-soft text-danger" : "bg-water-soft text-deep"}`}
    >
      {children}
    </p>
  );
}
