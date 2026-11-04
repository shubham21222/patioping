import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SubmitButton } from "@/components/SubmitButton";
import { input, label } from "@/components/ui";
import { getSession } from "@/lib/session";
import { tradeById } from "@/lib/trades";
import { addNote, updateLead } from "./actions";

const STAGES = [
  ["new", "New"],
  ["contacted", "Contacted"],
  ["postcard_sent", "Postcard sent"],
  ["quoted", "Quoted"],
  ["won", "Won"],
  ["lost", "Lost"],
] as const;

type Permit = Record<string, string | number | null>;

const STAGE_NAME: Record<string, string> = Object.fromEntries(STAGES);
const stageChange = (body: string | null) =>
  (body ?? "")
    .split(" → ")
    .map((s) => STAGE_NAME[s] ?? s)
    .join(" → ");

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, org } = await getSession(`/leads/${id}`);
  const monthly = (tradeById(org?.trade ?? "")?.wonValue ?? "monthly") === "monthly";

  const { data: lead } = await supabase
    .from("leads")
    .select("id, stage, next_follow_up, won_value_monthly, won_value_job, permits(*), lead_activities(id, type, body, created_at)")
    .eq("id", id)
    .order("created_at", { referencedTable: "lead_activities", ascending: false })
    .maybeSingle();
  if (!lead) notFound();

  const p = ((Array.isArray(lead.permits) ? lead.permits[0] : lead.permits) ?? {}) as Permit;
  const facts: [string, string][] = [
    ["Work", String(p.permit_type ?? p.category ?? "—")],
    ["Value", p.valuation != null ? `$${Number(p.valuation).toLocaleString("en-US")}` : "Not listed"],
    ["Builder", String(p.contractor_name ?? "Not listed")],
    ["Issued", p.issued_at ? new Date(String(p.issued_at)).toLocaleDateString("en-US", { dateStyle: "medium" }) : "—"],
    ["Permit no.", String(p.permit_number ?? "—")],
  ];
  const activities = (lead.lead_activities ?? []) as { id: string; type: string; body: string | null; created_at: string }[];

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <Link href="/leads" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink">
          <ArrowLeft size={16} /> All leads
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight [font-stretch:87.5%] sm:text-4xl">
          {p.address ?? "Address pending"}
        </h1>
        {p.zip && <p className="mt-1 text-lg text-ink-2">{p.zip}</p>}

        <dl className="mt-8 divide-y divide-line border-y border-line">
          {facts.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-4 py-3">
              <dt className="text-ink-2">{k}</dt>
              <dd className="num font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        {p.description && <p className="mt-6 max-w-[65ch] text-ink-2">{String(p.description)}</p>}
        {p.source_url && (
          <a
            href={String(p.source_url)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-water underline"
          >
            View the public record <ExternalLink size={14} />
          </a>
        )}

        <h2 className="mt-12 text-lg font-bold">Activity</h2>
        <form action={addNote} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="id" value={lead.id} />
          <label htmlFor="note" className="sr-only">Add a note</label>
          <input id="note" name="body" className={input} placeholder="Called, left a voicemail…" required />
          <SubmitButton variant="quiet" pendingLabel="Saving…" className="sm:w-auto sm:shrink-0">
            Add note
          </SubmitButton>
        </form>
        <ol className="mt-6 space-y-4">
          {activities.map((a) => (
            <li key={a.id} className="grid grid-cols-[5rem_1fr] gap-4 text-sm">
              <time className="num text-ink-3">
                {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </time>
              <p className={a.type === "note" ? "text-ink" : "text-ink-2"}>
                {a.type === "stage_change" ? `Moved to ${stageChange(a.body).split(" → ").pop()}` : a.body}
              </p>
            </li>
          ))}
          {!activities.length && <li className="text-sm text-ink-3">No activity yet. Notes you add show up here.</li>}
        </ol>
      </div>

      <aside className="h-fit rounded-2xl bg-deck p-5 sm:p-6 lg:sticky lg:top-6">
        <form action={updateLead} className="space-y-5">
          <input type="hidden" name="id" value={lead.id} />
          <div>
            <label htmlFor="stage" className={label}>Stage</label>
            <select id="stage" name="stage" defaultValue={lead.stage} className={input}>
              {STAGES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="fu" className={label}>Next follow-up</label>
            <input id="fu" type="date" name="next_follow_up" defaultValue={lead.next_follow_up ?? ""} className={input} />
          </div>
          <div>
            <label htmlFor="won" className={label}>{monthly ? "Monthly price if won" : "Job value if won"}</label>
            <input type="hidden" name="won_kind" value={monthly ? "monthly" : "job"} />
            <input
              id="won"
              name="won_value"
              inputMode="decimal"
              placeholder={monthly ? "150" : "9800"}
              defaultValue={(monthly ? lead.won_value_monthly : lead.won_value_job) ?? ""}
              className={input}
              aria-describedby="won-hint"
            />
            <p id="won-hint" className="mt-1.5 text-xs text-ink-3">Saved when the stage is Won. Adds up in your monthly report.</p>
          </div>
          <SubmitButton pendingLabel="Saving…">Save lead</SubmitButton>
        </form>
      </aside>
    </div>
  );
}
