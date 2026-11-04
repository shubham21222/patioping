export type PlanId = "starter" | "growth" | "pro";

export const PLANS: {
  id: PlanId;
  name: string;
  price: number;
  blurb: string;
  features: string[];
  counties: number | null;
  featured?: boolean;
}[] = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    blurb: "One operator, one county.",
    counties: 1,
    features: ["1 county", "Daily 7 AM email alert", "Lead pipeline and notes", "CSV export"],
  },
  {
    id: "growth",
    name: "Growth",
    price: 149,
    blurb: "A small crew covering a metro.",
    counties: 3,
    featured: true,
    features: ["3 counties", "Everything in Starter", "Team access and lead assignment", "Monthly won-business report"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 299,
    blurb: "Multiple routes, every source.",
    counties: null,
    features: ["Unlimited territory", "Everything in Growth", "Priority new sources", "API and webhook export"],
  },
];

export const isPlanId = (v: unknown): v is PlanId => v === "starter" || v === "growth" || v === "pro";
