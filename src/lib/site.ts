import type { Metadata } from "next";

/**
 * Crawl directives, in one place because a page that sets `robots` at all
 * shadows the root layout's block outright — it does not merge. Any route that
 * needs to flip `index` must go through here, or it silently drops the
 * googleBot preview directives that let a retail listing show a large image in
 * search results.
 */
export function robotsFor(index: boolean): Metadata["robots"] {
  return {
    index,
    follow: true,
    googleBot: {
      index,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

const DEFAULT_SITE_URL = "https://enivrant.com";

/**
 * Normalises NEXT_PUBLIC_SITE_URL into a bare origin.
 *
 * `metadataBase` (root layout) and the Paycorp return URL are both built with
 * `new URL(...)`, which throws on a scheme-less host. A production env var set
 * to `enivrant.com` rather than `https://enivrant.com` therefore failed the
 * whole build at page-data collection rather than degrading — so a missing
 * scheme is now assumed to be https, a trailing slash is dropped, and anything
 * still unparseable falls back to the canonical domain. A typo in the host's
 * environment can misdirect canonical URLs; it can no longer take the site down.
 */
function normalizeSiteUrl(raw: string | undefined) {
  // Deliberately not stripping a trailing slash first: `.origin` drops it
  // anyway, and stripping early turns a bare "https://" into the scheme test's
  // blind spot and out the far side as the host "https".
  const trimmed = raw?.trim();
  if (!trimmed) return DEFAULT_SITE_URL;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const site = {
  name: "Enivrant",
  /** Uppercase treatment used in the logo lockup and legal lines. */
  nameUpper: "ENIVRANT",
  /** The tagline. Set in caps wherever it appears, so it is stored in title
   *  case and left to the CSS to shout. Doubles as the editorial sign-off. */
  tagline: "Where Elegance Finds You",
  /** The brand line — hero headline, share card and OG title all use it. */
  headline: "Where Elegance Becomes a Lifestyle",
  description:
    "Enivrant is a curated universe of refinement — iconic fragrance, the art of self-care, timeless pearls and fine jewellery, Luxury Fashion Designer Selects and the serenity of hotel-grade bedlinen. Curated, never mass-produced.",
  /** Shorter line for share cards and social bios, where 300 chars is too many. */
  shareDescription:
    "A curated universe of refinement — iconic fragrance, wellness, timeless pearls, designer fashion and fine bedlinen. Curated, never mass-produced.",
  keywords: [
    "luxury fragrance Sri Lanka",
    "rare perfume Colombo",
    "freshwater pearls",
    "fine jewellery Sri Lanka",
    "luxury bedlinen",
    "hotel-grade bed linen",
    "designer fashion selects",
    "luxury wellness",
    "Enivrant",
  ],
  // Canonical origin. Every absolute URL (OG tags, sitemap, JSON-LD, and the
  // payment gateway's return URL) is built from this, so it must match the host
  // the site actually answers on. Always a scheme-qualified origin with no
  // trailing slash — see normalizeSiteUrl above.
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  // Same line for calls and WhatsApp — country code, no + or spaces.
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "94774126226",
  email: "support@enivrant.com",
  phone: "+94 77 412 6226",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  pinterest: "https://pinterest.com",
};

/** Free delivery threshold (USD) — used by cards, cart, checkout and PDP.
 *  Converted from the original Rs 25,000 at 300 LKR = 1 USD. */
export const FREE_DELIVERY_FROM = 85;

// Note: the storefront header/footer navigation is data-driven from the
// `categories` table (see getNavCategories in lib/catalog.ts), so there is no
// hardcoded nav array here — collections created in /admin appear in the nav
// automatically.

// Checkout payment options. Bank details are placeholders — swap in the
// client's real account before launch (shown on the order-success page for
// bank-transfer orders).
//
// `card` is listed here but only offered when Paycorp credentials are present:
// the checkout page reads that server-side and passes it down, so a missing
// credential hides the option rather than dead-ending the shopper (see
// lib/paycorp/config.ts).
export const paymentMethods = [
  {
    id: "card",
    label: "Card payment",
    description: "Visa, Mastercard or Amex — secured by Commercial Bank of Ceylon.",
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay the courier in cash when your order arrives.",
  },
  {
    id: "bank_transfer",
    label: "Direct Bank Transfer",
    description: "Transfer to our account — details shown after you place the order.",
  },
] as const;

export function paymentMethodLabel(id: string) {
  return paymentMethods.find((m) => m.id === id)?.label ?? id;
}

export const bankDetails = {
  bankName: "Commercial Bank of Ceylon",
  accountName: "Enivrant (Pvt) Ltd",
  accountNumber: "0000 0000 0000",
  branch: "Colombo 03",
};

export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(amount: number) {
  // The catalogue is priced in whole dollars, so cents only appear when an
  // order total actually carries them — "$85.00" on every card reads cheap.
  const cents = !Number.isInteger(amount);
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
