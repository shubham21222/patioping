import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { AppNav } from "@/components/AppNav";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function trialDaysLeft(trialEndsAt: string | null) {
  if (!trialEndsAt) return null;
  return Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000));
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, org } = await getSession();
  const days = org?.plan === "trial" ? trialDaysLeft(org.trial_ends_at) : null;

  return (
    <div className="min-h-dvh bg-white">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 pt-4 sm:px-6">
          <Logo href="/leads" height={24} />
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden truncate text-sm text-ink-2 sm:inline">{org?.name ?? user.email}</span>
            <form action="/auth/signout" method="post">
              <button className="grid h-9 w-9 place-items-center rounded-[10px] text-ink-2 hover:bg-deck hover:text-ink" aria-label="Log out" title="Log out">
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto mt-2 max-w-6xl px-2 sm:px-4">
          <AppNav />
        </div>
      </header>

      {days !== null && (
        <div className="border-b border-line bg-deck">
          <p className="mx-auto max-w-6xl px-4 py-2.5 text-sm text-ink-2 sm:px-6">
            {days > 0 ? (
              <>Free week: <span className="num font-semibold text-ink">{days} {days === 1 ? "day" : "days"}</span> left. </>
            ) : (
              <>Your free week has ended. </>
            )}
            <a href="/settings/billing" className="font-semibold text-water underline">Choose a plan</a>
          </p>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
