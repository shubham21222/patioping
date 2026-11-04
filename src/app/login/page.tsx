import Link from "next/link";
import { AuthShell, Notice } from "@/components/AuthCard";
import { SubmitButton } from "@/components/SubmitButton";
import { input, label } from "@/components/ui";
import { login, magicLink } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string; next?: string }>;
}) {
  const { error, sent, next } = await searchParams;
  return (
    <AuthShell
      title="Log in"
      lede="Pick up where you left off with today’s leads."
      footer={
        <>
          New to PatioPing?{" "}
          <Link href="/signup" className="font-semibold text-water underline">
            Start your free week
          </Link>
        </>
      }
    >
      {error && <Notice tone="error">{error}</Notice>}
      {sent && <Notice tone="info">Check your inbox. The login link works for one hour.</Notice>}
      <form className="space-y-5">
        <input type="hidden" name="next" value={next ?? "/leads"} />
        <div>
          <label htmlFor="email" className={label}>Work email</label>
          <input id="email" className={input} name="email" type="email" placeholder="mike@bluewaterpools.com" required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="password" className={label}>Password</label>
          <input id="password" className={input} name="password" type="password" autoComplete="current-password" />
        </div>
        <div className="space-y-3 pt-1">
          <SubmitButton formAction={login} pendingLabel="Logging in…">Log in</SubmitButton>
          <SubmitButton formAction={magicLink} formNoValidate variant="quiet" pendingLabel="Sending link…">
            Email me a login link
          </SubmitButton>
        </div>
      </form>
    </AuthShell>
  );
}
