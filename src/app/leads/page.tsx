import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/leads");

  // RLS limits rows to the user's org.
  const { data: leads } = await supabase
    .from("leads")
    .select("id, stage, created_at, permits(address, zip, category, valuation, contractor_name, issued_at)")
    .order("created_at", { ascending: false })
    .limit(50);

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = leads?.filter((l) => l.created_at.startsWith(today)).length ?? 0;

  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-3 gap-3">
          {[["Today", todayCount], ["This week", leads?.length ?? 0], ["🔥 High-value", 0]].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-sky-50 p-4">
              <p className="text-sm text-slate-600">{k}</p>
              <p className="text-3xl font-extrabold text-pool-dark">{v}</p>
            </div>
          ))}
        </div>

        <h1 className="mt-8 text-xl font-bold">Your leads</h1>
        {!leads?.length ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No leads yet. Once your territory is set, new permits show up here every morning.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {leads.map((l) => {
              const p = Array.isArray(l.permits) ? l.permits[0] : l.permits;
              return (
                <li key={l.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-semibold">{p?.address}, {p?.zip}</p>
                  <p className="text-sm text-slate-600">
                    {p?.category} · {p?.valuation ? `$${Number(p.valuation).toLocaleString()}` : "—"} · {p?.contractor_name ?? "Unknown builder"}
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">{l.stage}</span>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
