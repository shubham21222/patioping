import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const cell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  // Quote when needed; prefix formula-looking values so spreadsheets don't execute them.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login?next=/leads", request.url));

  const stage = request.nextUrl.searchParams.get("stage");
  let q = supabase
    .from("leads")
    .select(
      "stage, next_follow_up, won_value_monthly, won_value_job, created_at, permits(permit_number, address, zip, category, valuation, contractor_name, issued_at, source_url)",
    )
    .order("created_at", { ascending: false });
  if (stage) q = q.eq("stage", stage);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const header = ["address", "zip", "work", "valuation", "builder", "issued", "permit_number", "stage", "next_follow_up", "won_monthly", "won_job", "source_url"];
  const lines = (data ?? []).map((l) => {
    const p = (Array.isArray(l.permits) ? l.permits[0] : l.permits) as Record<string, unknown> | null;
    return [p?.address, p?.zip, p?.category, p?.valuation, p?.contractor_name, p?.issued_at, p?.permit_number, l.stage, l.next_follow_up, l.won_value_monthly, l.won_value_job, p?.source_url]
      .map(cell)
      .join(",");
  });

  return new NextResponse([header.join(","), ...lines].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="patioping-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
