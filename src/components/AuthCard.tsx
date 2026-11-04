import { Logo } from "@/components/Logo";

export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="mb-5 text-xl font-bold">{title}</h1>
          {children}
        </div>
      </div>
    </main>
  );
}

export const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:border-pool focus:outline-none focus:ring-2 focus:ring-sky-100";
export const btnCls =
  "w-full rounded-lg bg-pool px-4 py-3 text-base font-semibold text-white hover:bg-pool-dark";
