import Link from "next/link";
import { LOGO_WIDTH, WORDMARK_PATH } from "./wordmark";

type Tone = "ink" | "reverse";

const tones = {
  ink: { tile: "#0B3B66", ring: "#5CC6F0", dot: "#FFFFFF", word: "#0E1C2B" },
  reverse: { tile: "#FFFFFF", ring: "#1F7FC1", dot: "#0B3B66", word: "#FFFFFF" },
} as const;

export function Mark({
  tone = "ink",
  animate = false,
  className,
  size,
}: {
  tone?: Tone;
  animate?: boolean;
  className?: string;
  size?: number;
}) {
  const c = tones[tone];
  const id = `pp-clip-${tone}`;
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <clipPath id={id}><rect width="44" height="44" rx="10" /></clipPath>
      </defs>
      <rect width="44" height="44" rx="10" fill={c.tile} />
      <g clipPath={`url(#${id})`} fill="none" stroke={c.ring} strokeWidth="3.2">
        <circle cx="16" cy="28" r="9" />
        <circle cx="16" cy="28" r="17" strokeOpacity=".6" />
        <circle cx="16" cy="28" r="25" strokeOpacity=".32" />
        {animate && (
          <circle cx="16" cy="28" r="25" className="ripple" style={{ transformOrigin: "16px 28px" }} />
        )}
      </g>
      <circle cx="16" cy="28" r="4" fill={c.dot} />
    </svg>
  );
}

export function Logo({
  tone = "ink",
  href = "/",
  height = 28,
  animate = false,
}: {
  tone?: Tone;
  href?: string;
  height?: number;
  animate?: boolean;
}) {
  const c = tones[tone];
  return (
    <Link href={href} aria-label="PatioPing home" className="inline-flex shrink-0 rounded-md">
      <svg viewBox={`0 0 ${LOGO_WIDTH} 44`} height={height} width={(LOGO_WIDTH / 44) * height} aria-hidden="true">
        <Mark tone={tone} size={44} animate={animate} />
        <path transform="translate(56 35.7)" fill={c.word} d={WORDMARK_PATH} />
      </svg>
    </Link>
  );
}
