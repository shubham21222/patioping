import { Fence, Hammer, HousePlus, PlugZap, Sun, Trees, Waves, type LucideProps } from "lucide-react";
import type { LiveTrade, SoonTrade } from "@/lib/trades";

const ICONS = { waves: Waves, fence: Fence, trees: Trees, sun: Sun, roof: Hammer, house: HousePlus, plug: PlugZap };

export function TradeIcon({ name, ...props }: { name: LiveTrade["icon"] | SoonTrade["icon"] } & LucideProps) {
  const Icon = ICONS[name];
  return <Icon strokeWidth={1.75} aria-hidden="true" {...props} />;
}
