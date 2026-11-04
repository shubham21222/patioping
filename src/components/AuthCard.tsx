import { Logo } from "@/components/brand/Logo";
import { Waterline } from "@/components/brand/Waterline";

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
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden flex-col justify-between bg-deep p-10 text-white lg:flex">
        <Logo tone="reverse" />
        <div className="pb-14">
          <p className="max-w-[22ch] text-[2.5rem] font-extrabold leading-[1.05] [font-stretch:87.5%]">
            The permit&rsquo;s filed. The homeowner hasn&rsquo;t called you yet.
          </p>
          <p className="mt-5 max-w-[42ch] text-on-deep-2">
            New pool, fence and patio permits in your zip codes, every morning at 7 AM.
          </p>
        </div>
        <Waterline className="absolute inset-x-0 bottom-0" />
      </aside>

      <div className="flex flex-col">
        <div className="bg-deep px-4 py-4 lg:hidden">
          <Logo tone="reverse" height={24} />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
          <div className="w-full max-w-[400px]">
            <h1 className="text-3xl font-extrabold [font-stretch:87.5%]">{title}</h1>
            {lede && <p className="mt-2 text-ink-2">{lede}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 border-t border-line pt-6 text-sm text-ink-2">{footer}</div>}
          </div>
        </div>
      </div>
    </main>
  );
}

export function Notice({ tone, children }: { tone: "error" | "info"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`mb-5 rounded-[10px] px-3.5 py-3 text-sm ${tone === "error" ? "bg-[#fbeaec] text-danger" : "bg-[#e6f1fa] text-deep"}`}
    >
      {children}
    </p>
  );
}
