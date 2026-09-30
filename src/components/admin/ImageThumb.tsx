"use client";

/** What the photo pickers offer — the same types uploadImage accepts. */
export const PHOTO_TYPES = "image/jpeg,image/png,image/webp,image/avif,image/gif";

/** Where a stored photo lives, in words for the dashboard. */
export function photoLocation(url: string): string {
  const src = url.trim();
  if (src.includes("/storage/v1/object/public/")) return "Stored in Supabase";
  if (src.startsWith("/")) return "Stored with the website";
  return "External link";
}

/**
 * Small preview of a photo in the admin forms, so it is clear which one a row
 * holds before it is replaced or removed. A plain <img>, not next/image: the
 * admin has to show whatever address is stored, and next/image throws on any
 * host it has not been told about.
 */
export function ImageThumb({ url, large = false }: { url: string; large?: boolean }) {
  const src = url.trim();
  const showable = src.startsWith("/") || src.startsWith("https://") || src.startsWith("http://");

  return (
    <span
      className={`relative block shrink-0 overflow-hidden rounded-lg bg-sand ${
        large ? "h-16 w-16" : "h-12 w-12"
      }`}
    >
      {showable && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          // Remounts per URL, so one that failed to load doesn't stay hidden.
          key={src}
          src={src}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.visibility = "hidden";
          }}
        />
      )}
    </span>
  );
}
