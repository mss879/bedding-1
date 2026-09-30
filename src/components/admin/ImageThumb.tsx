"use client";

/**
 * Small preview of an image field in the admin forms, so it is clear which
 * photo a row holds before it is replaced or removed. A plain <img>, not
 * next/image: the URL is still being edited, and next/image throws on any host
 * it has not been told about.
 */
export function ImageThumb({ url }: { url: string }) {
  const src = url.trim();
  const showable = src.startsWith("/") || src.startsWith("https://");

  return (
    <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-sand">
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
