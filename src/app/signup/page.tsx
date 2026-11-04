import Link from "next/link";
import { AuthCard, btnCls, inputCls } from "@/components/AuthCard";
import { signup } from "../login/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;
  if (sent) {
    return (
      <AuthCard title="Check your email">
        <p className="text-slate-600">We sent you a confirmation link. Click it to set up your territory.</p>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Start your free week">
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form action={signup} className="space-y-3">
        <input className={inputCls} name="company" placeholder="Company name" required />
        <input className={inputCls} name="email" type="email" placeholder="you@company.com" required autoComplete="email" />
        <input className={inputCls} name="password" type="password" placeholder="Password (8+ characters)" minLength={8} required autoComplete="new-password" />
        <button className={btnCls}>Create account</button>
      </form>
      <p className="mt-3 text-center text-xs text-slate-500">No card needed for the first week.</p>
      <p className="mt-5 text-center text-sm text-slate-600">
        Have an account? <Link href="/login" className="font-semibold text-pool-dark">Log in</Link>
      </p>
    </AuthCard>
  );
}
