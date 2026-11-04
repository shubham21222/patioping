import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-pool text-white">🔔</span>
      PatioPing
    </Link>
  );
}
