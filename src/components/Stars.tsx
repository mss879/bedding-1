import { formatCount } from "@/lib/ratings";

/**
 * Etsy-style rating stars: gold fractional fill over gray, count in parens.
 * Pure SVG + CSS width clip — renders identically on server and client.
 */
export function Stars({
  rating,
  count,
  size = 14,
  className,
}: {
  rating: number;
  count?: number;
  size?: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));

  return (
    <span
      className={`inline-flex items-center gap-1 ${className ?? ""}`}
      aria-label={`Rated ${rating} out of 5 stars${count ? ` from ${count} reviews` : ""}`}
    >
      <span className="relative inline-block" style={{ width: size * 5, height: size }}>
        <StarRow size={size} color="var(--color-fog)" />
        <span
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${pct}%` }}
        >
          <StarRow size={size} color="var(--color-star)" />
        </span>
      </span>
      {count !== undefined && (
        <span className="text-[0.8rem] text-ink-soft">({formatCount(count)})</span>
      )}
    </span>
  );
}

function StarRow({ size, color }: { size: number; color: string }) {
  return (
    <span className="flex" style={{ width: size * 5 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={color}
          aria-hidden
          className="shrink-0"
        >
          <path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9L12 2.6z" />
        </svg>
      ))}
    </span>
  );
}
