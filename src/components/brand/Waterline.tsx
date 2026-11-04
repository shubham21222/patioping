/**
 * The waterline tile band: the strip of glass mosaic at the top of a pool wall,
 * where water meets coping. Geometry only, from a fixed pattern.
 */
const SHADES = ["#0B3B66", "#13508A", "#1F7FC1", "#0E4677", "#2A8FCF", "#13508A"];
// 6x2 cell grid repeated; fixed sequence so it never shimmers between renders.
const SEQ = [0, 2, 1, 4, 3, 1, 2, 0, 5, 1, 4, 2];

export function Waterline({ className = "" }: { className?: string }) {
  const cell = 12;
  return (
    <svg className={`block h-6 w-full ${className}`} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <pattern id="pp-mosaic" width={cell * 6} height={cell * 2} patternUnits="userSpaceOnUse">
          <rect width={cell * 6} height={cell * 2} fill="#0A2F52" />
          {SEQ.map((s, i) => (
            <rect
              key={i}
              x={(i % 6) * cell + 1}
              y={Math.floor(i / 6) * cell + 1}
              width={cell - 2}
              height={cell - 2}
              rx="1.5"
              fill={SHADES[s]}
            />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pp-mosaic)" />
    </svg>
  );
}

/** A depth-marker tile, as set into pool coping. Only carries true product facts. */
export function DepthMarker({ value, unit, caption }: { value: string; unit?: string; caption: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid min-w-16 place-items-center rounded-md border border-[#c9d1d9] bg-white px-2.5 py-2 text-ink">
        <span className="marker text-[28px]">
          {value}
          {unit && <span className="ml-0.5 text-[15px]">{unit}</span>}
        </span>
      </div>
      <span className="max-w-[16ch] text-sm leading-snug text-ink-2">{caption}</span>
    </div>
  );
}
