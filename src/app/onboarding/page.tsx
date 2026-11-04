import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Phase 2: 3-step onboarding (trade → territory → alert settings). Placeholder for now.
export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding");

  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto max-w-xl px-4 py-10">
        <h1 className="text-2xl font-bold">Welcome to PatioPing 👋</h1>
        <ol className="mt-6 space-y-3 text-slate-700">
          <li>1. Pick your trade (Pool service, Fence, Landscaping…)</li>
          <li>2. Choose your territory (zip codes or radius)</li>
          <li>3. Set your daily alert time</li>
        </ol>
        <p className="mt-6 text-sm text-slate-500">Onboarding flow coming in Phase 2.</p>
      </main>
    </>
  );
}
