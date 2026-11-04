import Link from "next/link";
import { LogOut, Search } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { AppNav } from "@/components/AppNav";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function trialDaysLeft(trialEndsAt: string | null) {
  if (!trialEndsAt) return null;
  return Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000));
}

const initials = (s: string) =>
  s
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, org } = await getSession();
  const days = org?.plan === "trial" ? trialDaysLeft(org.trial_ends_at) : null;
  const { count: newCount } = await supabase.from("leads").select("id", { count: "exact", head: true }).eq("stage", "new");
  const who = org?.name ?? user.email ?? "You";

  return (
    <div className="min-h-dvh bg-[#eef3f6] lg:flex lg:gap-3 lg:p-3">
      {/* Sidebar */}
      <aside className="hidden w-[248px] shrink-0 flex-col rounded-[24px] border border-white bg-white p-4 shadow-[var(--shadow-card)] lg:sticky lg:top-3 lg:flex lg:h-[calc(100dvh-1.5rem)]">
        <div className="px-1 pt-1">
          <Logo href="/leads" height={22} />
        </div>
        <form action="/leads" className="mt-6">
          <label className="flex h-10 items-center gap-2 rounded-xl border border-line bg-deck px-3 text-sm text-ink-3 focus-within:border-water focus-within:bg-white">
            <Search size={15} />
            <span className="sr-only">Search leads</span>
            <input name="q" placeholder="Search address or builder" className="min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-3 focus:outline-none" />
          </label>
        </form>
        <div className="mt-5">
          <AppNav newCount={newCount} />
        </div>

        <div className="mt-auto space-y-3">
          {days !== null && (
            <div className="rounded-2xl bg-water-soft p-4">
              <p className="text-sm font-medium text-deep">
                {days > 0 ? <>Free week · <span className="num">{days}</span> {days === 1 ? "day" : "days"} left</> : "Your free week has ended"}
              </p>
              <Link href="/settings/billing" className="mt-1 inline-block text-sm font-medium text-water underline">
                Choose a plan
              </Link>
            </div>
          )}
          <div className="flex items-center gap-3 rounded-2xl border border-line p-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-deep text-xs font-semibold text-white">{initials(who)}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{who}</span>
              <span className="block truncate text-xs text-ink-3">{user.email}</span>
            </span>
            <form action="/auth/signout" method="post">
              <button className="grid h-8 w-8 place-items-center rounded-lg text-ink-3 hover:bg-deck hover:text-ink" aria-label="Log out" title="Log out">
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 border-b border-line bg-white/90 px-4 pt-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Logo href="/leads" height={22} />
          <form action="/auth/signout" method="post">
            <button className="grid h-9 w-9 place-items-center rounded-lg text-ink-2 hover:bg-deck" aria-label="Log out">
              <LogOut size={18} />
            </button>
          </form>
        </div>
        <div className="mt-3">
          <AppNav newCount={newCount} layout="top" />
        </div>
        {days !== null && (
          <p className="-mx-4 mt-2 border-t border-line bg-water-soft px-4 py-2 text-sm text-deep">
            {days > 0 ? <>Free week · {days} {days === 1 ? "day" : "days"} left. </> : <>Free week ended. </>}
            <Link href="/settings/billing" className="font-medium text-water underline">Choose a plan</Link>
          </p>
        )}
      </header>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-5 lg:py-5">{children}</main>
    </div>
  );
}
