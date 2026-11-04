"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Inbox, MapPinned } from "lucide-react";

const items = [
  { href: "/leads", label: "Leads", icon: Inbox, badge: true },
  { href: "/onboarding", label: "Territory", icon: MapPinned },
  { href: "/settings/billing", label: "Billing", icon: CreditCard },
];

export function AppNav({ newCount, layout = "side" }: { newCount?: number | null; layout?: "side" | "top" }) {
  const path = usePathname();
  return (
    <nav aria-label="Main" className={layout === "side" ? "space-y-1" : "-mx-1 flex gap-1 overflow-x-auto px-1 pb-1"}>
      {items.map(({ href, label, icon: Icon, badge }) => {
        const on = path === href || path.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 text-[14px] transition-colors ${
              layout === "side" ? "h-10" : "h-9"
            } ${on ? "bg-ink text-white" : "text-ink-2 hover:bg-deck hover:text-ink"}`}
          >
            <Icon size={17} strokeWidth={1.9} />
            <span className="flex-1">{label}</span>
            {badge && newCount ? (
              <span className={`num rounded-md px-1.5 text-[11px] font-medium ${on ? "bg-white/20" : "bg-deck-2 text-ink-2"}`}>{newCount}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
