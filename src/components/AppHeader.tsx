import Link from "next/link";
import { Logo } from "@/components/Logo";

export function AppHeader({ email }: { email?: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Logo />
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/leads" className="font-medium text-slate-700">Leads</Link>
          <span className="hidden text-slate-400 sm:inline">{email}</span>
          <form action="/auth/signout" method="post">
            <button className="text-slate-600 hover:text-slate-900">Log out</button>
          </form>
        </nav>
      </div>
    </header>
  );
}
