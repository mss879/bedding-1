import type { Product, Subcategory } from "./types";

/**
 * The sub-categories under each collection, which product sits in which, and
 * the spa vouchers — the demo-mode side of migration 0011.
 *
 * This file is the single source for that migration's data: the SQL was
 * generated from the lists below, so the database and the demo catalogue
 * agree. It is applied to the seed products in seed-data.ts rather than
 * written into them, so the generated Molee file never needs editing by hand.
 *
 * Slugs are unique across every collection (a product points at its
 * sub-category by slug alone), and `sort_order` is the merchandising order
 * the header menu, the shop chips and the shop-by-category tiles use. A
 * sub-category with no products is kept, but the storefront hides it until
 * one is added in the dashboard.
 */

const tile = (slug: string) => `/images/subcategories/${slug}.webp`;

type SubcategorySeed = Omit<Subcategory, "id" | "image" | "show_in_nav">;

const SUBCATEGORIES: SubcategorySeed[] = [
  // ── Fine Bedlinen & Sleep Luxury — the client's nine headings ─────────
  {
    slug: "luxury-bedding",
    category_slug: "bedlinen",
    name: "Luxury Bedding",
    description:
      "Duvet covers and sheet sets in mulberry silk, Egyptian and Giza cotton, French linen and lyocell — the whole bed, dressed.",
    sort_order: 1,
  },
  {
    slug: "pillows-cushions",
    category_slug: "bedlinen",
    name: "Pillows & Cushions",
    description: "Silk and linen pillowcases, cut to be kind to skin and hair through the night.",
    sort_order: 2,
  },
  {
    slug: "throws-quilts",
    category_slug: "bedlinen",
    name: "Throws & Quilts",
    description: "Waffle-weave blankets and silk-filled quilts for the foot of the bed and the lighter months.",
    sort_order: 3,
  },
  {
    slug: "mattresses-sleep-systems",
    category_slug: "bedlinen",
    name: "Mattresses & Sleep Systems",
    description:
      "Goose-down and silk-filled duvets — the layers beneath the linen that decide how you sleep.",
    sort_order: 4,
  },
  {
    slug: "luxury-sleepwear-robes",
    category_slug: "bedlinen",
    name: "Luxury Sleepwear & Robes",
    description: "Silk nightdresses and robes finished in lace, for the hours either side of sleep.",
    sort_order: 5,
  },
  {
    slug: "accessories-decor",
    category_slug: "bedlinen",
    name: "Accessories & Décor",
    description: "The finishing pieces of a bedroom — trays, vessels and small luxuries for the bedside.",
    sort_order: 6,
  },
  {
    slug: "lighting-sleep-spaces",
    category_slug: "bedlinen",
    name: "Lighting for Sleep Spaces",
    description: "Soft, low light for reading, winding down and the walk back from the bath.",
    sort_order: 7,
  },
  {
    slug: "bedroom-furniture",
    category_slug: "bedlinen",
    name: "Bedroom Furniture",
    description: "Bedside tables, benches and the quiet furniture a calm bedroom is built around.",
    sort_order: 8,
  },
  {
    slug: "headboards-bed-frames",
    category_slug: "bedlinen",
    name: "Headboards & Bed Frames",
    description: "Upholstered headboards and frames — the architecture of the bed.",
    sort_order: 9,
  },

  // ── Luxury Wellness ────────────────────────────────────────────────────
  {
    slug: "bath-body-rituals",
    category_slug: "wellness",
    name: "Bath & Body Rituals",
    description: "Bath salts, botanical oils, rose quartz and the robe for afterwards.",
    sort_order: 1,
  },
  {
    slug: "sleep-rituals",
    category_slug: "wellness",
    name: "Sleep Rituals",
    description: "Silk masks and sleep sets for darker, deeper nights — at home or on a long-haul flight.",
    sort_order: 2,
  },
  {
    slug: "spa-vouchers",
    category_slug: "wellness",
    name: "Wellness Vouchers & Spa Discounts",
    description:
      "Exclusive savings on spa experiences — buy the voucher here, then present its code at your chosen spa.",
    sort_order: 3,
  },

  // ── Fragrance ──────────────────────────────────────────────────────────
  {
    slug: "perfume",
    category_slug: "fragrances",
    name: "Perfume",
    description: "Eaux de parfum, a discovery set and a solid perfume, composed around jasmine, oud and Ceylon tea.",
    sort_order: 1,
  },
  {
    slug: "home-fragrance",
    category_slug: "fragrances",
    name: "Home Fragrance",
    description: "Reed diffusers and candles that scent a room slowly, never all at once.",
    sort_order: 2,
  },

  // ── Home & Living ──────────────────────────────────────────────────────
  {
    slug: "tableware-objects",
    category_slug: "home-living",
    name: "Tableware & Objects",
    description: "Hand-thrown stoneware, ceramic vessels and travertine for the table and the shelf.",
    sort_order: 1,
  },
  {
    slug: "furniture-lighting",
    category_slug: "home-living",
    name: "Furniture & Lighting",
    description: "Solid teak and woven rattan — pieces that warm with age.",
    sort_order: 2,
  },
  {
    slug: "throws-textiles",
    category_slug: "home-living",
    name: "Throws & Textiles",
    description: "Handloom cotton for the sofa, the reading chair and cooler evenings.",
    sort_order: 3,
  },

  // ── Pearls & Fine Jewelry ──────────────────────────────────────────────
  {
    slug: "necklaces-pendants",
    category_slug: "jewelry",
    name: "Necklaces & Pendants",
    description: "Freshwater pearl strands and a Ceylon sapphire set in solid gold.",
    sort_order: 1,
  },
  {
    slug: "earrings",
    category_slug: "jewelry",
    name: "Earrings",
    description: "Baroque pearl drops and hammered vermeil hoops.",
    sort_order: 2,
  },
  {
    slug: "rings-bracelets",
    category_slug: "jewelry",
    name: "Rings & Bracelets",
    description: "Rainbow moonstone and freshwater pearl, set in gold for every day.",
    sort_order: 3,
  },

  // ── Fashion & Accessories ──────────────────────────────────────────────
  {
    slug: "clothing",
    category_slug: "fashion",
    name: "Clothing",
    description: "Washed linen dresses and resort kaftans, cut loose for the heat.",
    sort_order: 1,
  },
  {
    slug: "bags",
    category_slug: "fashion",
    name: "Bags",
    description: "Woven palmyrah and vegetable-tanned leather, made to be carried for years.",
    sort_order: 2,
  },
  {
    slug: "scarves-hats",
    category_slug: "fashion",
    name: "Scarves & Hats",
    description: "Hand-painted batik silk and woven raffia, for the sun and the evening.",
    sort_order: 3,
  },
];

export const seedSubcategories: Subcategory[] = SUBCATEGORIES.map((s, i) => ({
  ...s,
  id: `s${i + 1}`,
  image: tile(s.slug),
  show_in_nav: true,
}));

/** Which products sit in which sub-category. Every catalogue piece is listed. */
export const SUBCATEGORY_PRODUCTS: Record<string, string[]> = {
  "luxury-bedding": [
    "cloud-percale-sheet-set",
    "stonewashed-linen-sheet-set",
    "enivrant-signature-bedding-set",
    "champagne-border-silk-bedding-set",
    "ivory-mulberry-silk-bedding-set",
    "champagne-silk-bedding-set-19-momme",
    "champagne-silk-jacquard-bedding-set",
    "ivory-silk-jacquard-bedding-set",
    "grade-6a-silk-jacquard-bedding-set",
    "30-momme-gold-silk-bedding-set",
    "26-momme-grey-silk-jacquard-set",
    "sage-silk-bedding-set",
    "camel-silk-bedding-set",
    "blush-silk-bedding-set",
    "charcoal-silk-bedding-set",
    "celadon-silk-bedding-set",
    "giza-cotton-bedding-set-ivory",
    "geometric-egyptian-cotton-jacquard-set",
    "white-egyptian-cotton-jacquard-set",
    "blush-egyptian-cotton-bedding-set",
    "olive-egyptian-cotton-bedding-set",
    "white-egyptian-cotton-satin-set",
    "champagne-giza-cotton-sateen-set",
    "sky-blue-piped-egyptian-cotton-set",
    "hotel-stripe-egyptian-cotton-set",
    "silver-giza-cotton-jacquard-set",
    "giza-cotton-fitted-sheet-set",
    "champagne-egyptian-cotton-bedding-set",
    "lace-inset-egyptian-cotton-satin-set",
    "openwork-long-staple-cotton-set",
    "cocoa-cotton-jacquard-bedding-set",
    "dove-grey-long-staple-cotton-set",
    "tie-closure-hotel-bedding-set",
    "warm-grey-long-staple-cotton-set",
    "air-jacquard-cotton-set-ivory",
    "embroidered-long-staple-cotton-set",
    "pima-cotton-1800-thread-count-set",
    "white-cotton-1200-thread-count-set",
    "blush-200s-cotton-sateen-set",
    "white-700-thread-count-cotton-set",
    "steel-blue-1800-thread-count-sateen-set",
    "white-400-thread-count-hotel-set",
    "white-belgian-flax-linen-set",
    "khaki-french-linen-bedding-set",
    "striped-linen-bedding-set",
    "natural-linen-bedding-set",
    "sage-french-flax-linen-set",
    "yarn-dyed-linen-jacquard-set",
    "silver-pure-linen-bedding-set",
    "linen-cotton-bedding-set-oat",
    "linen-lyocell-bedding-set",
    "deep-grey-linen-sheet-set",
    "deep-blue-flax-linen-set",
    "white-lyocell-bedding-set",
    "grey-wide-border-lyocell-set",
    "dusk-blue-lyocell-cotton-set",
    "eucalyptus-lyocell-bedding-set",
    "taupe-grey-lyocell-bedding-set",
    "lyocell-linen-jacquard-set",
    "grey-bamboo-bedding-set",
    "coconut-grey-bamboo-bedding-set",
  ],
  "pillows-cushions": [
    "mulberry-silk-pillowcase-pair",
    "21-momme-silk-pillowcase",
    "rolled-edge-silk-pillowcase",
    "french-linen-pillowcase-pair",
  ],
  "throws-quilts": [
    "waffle-weave-blanket",
    "bamboo-summer-quilt-set",
    "silk-quilt-lyocell-jacquard",
    "mulberry-silk-quilt-champagne",
    "silk-filled-summer-quilt",
  ],
  // Duvet inserts: the layers under the linen. One dropdown change in the
  // dashboard moves any of them if the client would rather file them elsewhere.
  "mattresses-sleep-systems": [
    "goose-down-duvet",
    "sateen-jacquard-goose-down-duvet",
    "double-layer-goose-down-duvet",
    "white-goose-down-jacquard-duvet",
    "extra-thick-goose-down-duvet",
    "silk-shell-goose-down-duvet",
    "white-goose-down-winter-duvet",
    "blush-all-season-goose-down-duvet",
    "mulberry-silk-filled-duvet",
    "silk-filled-jacquard-duvet",
  ],
  "luxury-sleepwear-robes": ["silk-robe-nightdress-set", "silk-slip-nightdress"],
  "bath-body-rituals": [
    "ceylon-bath-soak-ritual-set",
    "frangipani-body-oil",
    "rose-quartz-facial-ritual-set",
    "ayurvedic-tea-ritual-box",
    "waffle-linen-spa-robe",
  ],
  "sleep-rituals": [
    "silk-sleep-ritual-set",
    "3d-contour-silk-sleep-mask",
    "40-momme-silk-sleep-set",
    "mulberry-silk-travel-set",
    "linen-eye-mask",
  ],
  "spa-vouchers": [
    "signature-spa-massage-voucher",
    "ayurvedic-half-day-ritual-voucher",
    "couples-spa-afternoon-voucher",
  ],
  perfume: [
    "enivrant-no-1-eau-de-parfum",
    "jasmine-nocturne-eau-de-parfum",
    "discovery-set-five-scents",
    "oud-rose-solid-perfume",
  ],
  "home-fragrance": ["ceylon-tea-vetiver-reed-diffuser", "sandalwood-sea-salt-candle"],
  "tableware-objects": ["glazed-stoneware-dinner-set", "hand-thrown-ceramic-vase", "travertine-brass-tray"],
  "furniture-lighting": ["rattan-pendant-light", "teak-bedside-table"],
  "throws-textiles": ["handloom-cotton-throw"],
  "necklaces-pendants": ["freshwater-pearl-strand-necklace", "ceylon-blue-sapphire-pendant"],
  earrings: ["baroque-pearl-drop-earrings", "hammered-gold-vermeil-hoops"],
  "rings-bracelets": ["rainbow-moonstone-ring", "pearl-gold-vermeil-bracelet"],
  clothing: ["washed-linen-shirt-dress", "resort-linen-kaftan"],
  bags: ["palmyrah-woven-tote", "leather-crossbody-bag"],
  "scarves-hats": ["batik-silk-scarf", "raffia-sun-hat"],
};

/**
 * Pieces that change collection. The Molee silk sleepwear was first filed
 * under Fashion; it belongs with Luxury Sleepwear & Robes.
 */
export const COLLECTION_MOVES: Record<string, string> = {
  "silk-robe-nightdress-set": "bedlinen",
  "silk-slip-nightdress": "bedlinen",
};

const SUBCATEGORY_OF: Record<string, string> = Object.fromEntries(
  Object.entries(SUBCATEGORY_PRODUCTS).flatMap(([sub, slugs]) => slugs.map((slug) => [slug, sub]))
);

/** A seed product with its collection move and sub-category applied. */
export function withSubcategory(product: Product): Product {
  return {
    ...product,
    category_slug: COLLECTION_MOVES[product.slug] ?? product.category_slug,
    subcategory_slug: SUBCATEGORY_OF[product.slug] ?? product.subcategory_slug ?? null,
    kind: product.kind ?? "physical",
  };
}

const VOUCHER_DETAILS = [
  "Redeemable at your chosen Enivrant partner spa in Sri Lanka",
  "Valid for 12 months from the day it is issued",
  "Book your treatment at least 48 hours ahead",
  "Present your voucher code when you arrive",
];

const VOUCHER_TERMS = [
  "Non-refundable once issued — it can be given as a gift",
  "One voucher per treatment, not combinable with other offers",
  "The spa's own booking and cancellation policy applies",
];

const voucherPhoto = (slug: string) => [`/images/products/vouchers/${slug}-a.webp`];

/**
 * Spa vouchers — Wellness Vouchers & Spa Discounts. Sold like any piece, but
 * with no delivery: each unit bought is issued a code once it is paid for.
 * Options are treatments, and the compare-at price is the spa's own price, so
 * the saving shows as a quiet strike-through rather than a discount shout.
 * Prices and inclusions are placeholders for the client to confirm with the
 * partner spas.
 */
export const seedVoucherProducts: Product[] = [
  {
    id: "v1",
    slug: "signature-spa-massage-voucher",
    name: "Signature Massage Voucher",
    category_slug: "wellness",
    subcategory_slug: "spa-vouchers",
    kind: "voucher",
    short_description: "A full-body massage at your chosen partner spa, below the spa's own price.",
    description:
      "An hour or ninety minutes of warm-oil massage at one of our partner spas — long, unhurried strokes, hot basalt stones on the longer treatment, and a quiet room to come back to yourself afterwards. Buy the voucher here, then present its code at the spa when you arrive.",
    material: "",
    details: VOUCHER_DETAILS,
    care: VOUCHER_TERMS,
    colors: [],
    images: voucherPhoto("signature-spa-massage-voucher"),
    sizes: [
      { name: "60 minutes", dimensions: "Full-body massage", price: 45, compare_at_price: 60 },
      { name: "90 minutes", dimensions: "Full-body massage with hot stones", price: 60, compare_at_price: 80 },
    ],
    badge: "Voucher",
    featured: false,
    in_stock: true,
  },
  {
    id: "v2",
    slug: "ayurvedic-half-day-ritual-voucher",
    name: "Ayurvedic Half-Day Ritual Voucher",
    category_slug: "wellness",
    subcategory_slug: "spa-vouchers",
    kind: "voucher",
    short_description: "A half day in the Ayurvedic tradition — oil massage, shirodhara and a herbal steam.",
    description:
      "A half day given over to Ayurveda: a short consultation, a full-body massage with warm herbal oils, shirodhara poured slowly across the forehead, and a herbal steam to finish, followed by tea. Redeemed at your chosen partner spa — present the code when you arrive.",
    material: "",
    details: VOUCHER_DETAILS,
    care: VOUCHER_TERMS,
    colors: [],
    images: voucherPhoto("ayurvedic-half-day-ritual-voucher"),
    sizes: [{ name: "Half day", dimensions: "About three hours", price: 120, compare_at_price: 160 }],
    badge: "Voucher",
    featured: false,
    in_stock: true,
  },
  {
    id: "v3",
    slug: "couples-spa-afternoon-voucher",
    name: "Couples' Spa Afternoon Voucher",
    category_slug: "wellness",
    subcategory_slug: "spa-vouchers",
    kind: "voucher",
    short_description: "Side-by-side massages and tea for two, on one voucher.",
    description:
      "An afternoon for two: side-by-side massages in a shared suite, time to linger in the steam room, and herbal tea to close. One voucher covers both guests — present its code at your chosen partner spa.",
    material: "",
    details: VOUCHER_DETAILS,
    care: VOUCHER_TERMS,
    colors: [],
    images: voucherPhoto("couples-spa-afternoon-voucher"),
    sizes: [{ name: "For two", dimensions: "Two 60-minute massages", price: 200, compare_at_price: 260 }],
    badge: "Voucher",
    featured: false,
    in_stock: true,
  },
];
