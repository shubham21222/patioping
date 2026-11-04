export type PlanId = "starter" | "growth" | "pro";

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  blurb: string;
  /** Shown as "Everything in X, plus:" above the features */
  includes?: string;
  features: string[];
  counties: number | null;
  seats: number | null;
  featured?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    blurb: "One operator, one county.",
    counties: 1,
    seats: 1,
    features: ["1 county", "1 user", "Daily 7 AM email alert", "Lead pipeline, notes and follow-ups", "CSV export"],
  },
  {
    id: "growth",
    name: "Growth",
    price: 149,
    blurb: "A small crew covering a metro.",
    counties: 3,
    seats: 3,
    featured: true,
    includes: "Starter",
    features: ["3 counties", "3 team members", "Lead assignment", "Monthly ROI report"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 299,
    blurb: "Multiple routes, every source.",
    counties: null,
    seats: null,
    includes: "Growth",
    features: ["Unlimited counties", "Unlimited team", "Webhook and Zapier export", "Priority new sources"],
  },
];

/** Founding-member offer: the first customers keep today's price for as long as they stay subscribed. */
export const FOUNDING = { seats: 50, line: "First 50 customers lock in this price for life." };

export const isPlanId = (v: unknown): v is PlanId => v === "starter" || v === "growth" || v === "pro";
