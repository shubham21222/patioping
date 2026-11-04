"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Inbox, MapPinned } from "lucide-react";

const items = [
  { href: "/leads", label: "Leads", icon: Inbox },
  { href: "/onboarding", label: "Territory", icon: MapPinned },
  { href: "/settings/billing", label: "Billing", icon: CreditCard },
];

export function AppNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="-mb-px flex gap-1 overflow-x-auto">
      {items.map(({ href, label, icon: Icon }) => {
        const on = path === href || path.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? "page" : undefined}
            className={`flex h-12 items-center gap-2 border-b-2 px-3 text-[15px] font-semibold transition-colors ${
              on ? "border-water text-ink" : "border-transparent text-ink-2 hover:text-ink"
            }`}
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
