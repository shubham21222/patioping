// Shared class recipes. One elevation system: borders on deck, no ghost shadows.
export const btn = {
  base:
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-55",
  size: { md: "h-10 px-4 text-[14px]", lg: "h-12 px-5 text-[15px]" },
  primary: "bg-water text-white hover:bg-water-hover",
  onDeep: "bg-white text-deep hover:bg-deck-2",
  quiet: "border border-line-2 bg-white text-ink hover:bg-deck",
  ghostOnDeep: "text-ink-2 hover:bg-white/70 hover:text-ink",
};

export function button(
  variant: "primary" | "onDeep" | "quiet" | "ghostOnDeep" = "primary",
  size: "md" | "lg" = "md",
) {
  return `${btn.base} ${btn.size[size]} ${btn[variant]}`;
}

export const input =
  "h-11 w-full rounded-xl border border-line-2 bg-white px-3.5 text-base text-ink placeholder:text-ink-3 transition-colors hover:border-ink-3 focus:border-water focus:outline-none focus:ring-3 focus:ring-water/20 aria-invalid:border-danger";

export const label = "mb-1.5 block text-sm font-medium text-ink";
