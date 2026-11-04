import Link from "next/link";
import { AuthCard, btnCls, inputCls } from "@/components/AuthCard";
import { login, magicLink } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string; next?: string }>;
}) {
  const { error, sent, next } = await searchParams;
  return (
    <AuthCard title="Log in">
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {sent && <p className="mb-4 rounded-lg bg-sky-50 p-3 text-sm text-sky-800">Check your email for a login link.</p>}
      <form className="space-y-3">
        <input type="hidden" name="next" value={next ?? "/leads"} />
        <input className={inputCls} name="email" type="email" placeholder="you@company.com" required autoComplete="email" />
        <input className={inputCls} name="password" type="password" placeholder="Password" autoComplete="current-password" />
        <button formAction={login} className={btnCls}>Log in</button>
        <button formAction={magicLink} formNoValidate className="w-full rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50">
          Email me a login link
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600">
        New here? <Link href="/signup" className="font-semibold text-pool-dark">Start free trial</Link>
      </p>
    </AuthCard>
  );
}
