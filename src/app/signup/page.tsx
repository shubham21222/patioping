import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthShell, Notice } from "@/components/AuthCard";
import { SubmitButton } from "@/components/SubmitButton";
import { input, label } from "@/components/ui";
import { signup } from "../login/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string; email?: string }>;
}) {
  const { error, sent, email } = await searchParams;

  if (sent) {
    return (
      <AuthShell title="Check your inbox">
        <div className="flex gap-4 rounded-2xl bg-deck p-5">
          <MailCheck className="mt-0.5 shrink-0 text-water" size={22} />
          <p className="text-ink-2">
            We sent a confirmation link{email ? <> to <strong className="text-ink">{email}</strong></> : null}. Open it on this
            device and you&rsquo;ll go straight to picking your zip codes.
          </p>
        </div>
        <p className="mt-6 text-sm text-ink-3">
          Nothing after a few minutes? Check spam, or{" "}
          <Link href="/signup" className="font-semibold text-water underline">try another email</Link>.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Start your free week"
      lede="7 days of alerts for your area. No card needed."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-water underline">Log in</Link>
        </>
      }
    >
      {error && <Notice tone="error">{error}</Notice>}
      <form action={signup} className="space-y-5">
        <div>
          <label htmlFor="company" className={label}>Company name</label>
          <input id="company" className={input} name="company" placeholder="Blue Water Pool Service" required autoComplete="organization" />
        </div>
        <div>
          <label htmlFor="email" className={label}>Work email</label>
          <input id="email" className={input} name="email" type="email" placeholder="mike@bluewaterpools.com" required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="password" className={label}>Password</label>
          <input id="password" className={input} name="password" type="password" minLength={8} required autoComplete="new-password" aria-describedby="pw-hint" />
          <p id="pw-hint" className="mt-1.5 text-xs text-ink-3">At least 8 characters.</p>
        </div>
        <SubmitButton pendingLabel="Creating account…">Create account</SubmitButton>
        <p className="text-xs text-ink-3">
          We only use public permit records. We never contact homeowners for you.
        </p>
      </form>
    </AuthShell>
  );
}
