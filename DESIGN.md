# ENIVRANT — Design System (maison direction)

A luxury maison skin fitted over a marketplace-grade shopping UX. The *structure* is a
real store — search, collection chips, filters, a 4-up grid, basket, 3-step checkout.
The *surface* is a fashion house: ivory paper, ink, antique gold, and a great deal of
air. Every colour, radius and shadow in the codebase must trace to a token here.

## 1. Identity

- Brand: **ENIVRANT** (French, "intoxicating"). Six collections — wellness, fragrance,
  home & living, pearls & fine jewelry, fashion & accessories, bedlinen & sleep — each
  opening onto sub-categories (§12). Retail, spa vouchers, and a hotel/trade channel.
  Colombo, Sri Lanka.
- Logo is supplied artwork, not type: `public/brand/enivrant-wordmark.png` (header),
  `-white.png` (dark footer), `enivrant-lockup.png` (preloader), `enivrant-monogram*.png`.
  Extracted with transparency from the client's original ivory-background PNG.
- Feel: **restraint**. Flat surfaces, hairline rules, one gold accent, slow motion.
  The photograph is the loudest thing on any screen.

### What "luxury" means here, concretely

The register is set less by what we add than by what we refuse. Deliberately absent:

- urgency copy ("14 in baskets right now")
- star ratings and review counts on grid cards
- green "FREE delivery" shouts on cards and in the buy box
- heavy drop shadows and rounded, bouncy buttons

Delivery terms, ratings and reviews all still exist — they live on the product page and
in the reviews section, where a shopper is deciding, rather than decorating every plate
in the grid.

## 2. Colour tokens (`globals.css @theme`)

Legacy token names are retained (remapped) so existing utility classes stay valid.

| Token | Value | Use |
|---|---|---|
| `--color-cream` | `#FBF9F6` | Page background — ivory, matches the logo card |
| `--color-parchment` | `#FFFFFF` | White band sections |
| `--color-sand` | `#F1ECE4` | Image placeholders, soft fills |
| `--color-clay` | `#8C6E43` | **Accent** (antique gold): eyebrows, links, marks, rules. Never a primary CTA |
| `--color-clay-dark` | `#6E5330` | Accent hover/pressed |
| `--color-ink` | `#1A1917` | Primary text AND primary button fill |
| `--color-ink-soft` | `#57534D` | Secondary text |
| `--color-taupe` | `#A79E92` | Tertiary warm gray, strikethrough prices |
| `--color-fog` | `#7C766E` | Tertiary text, unlit stars |
| `--color-board` | `#E4DDD2` | Hairlines and soft borders |
| `--color-accent-tint` | `#EDE2D0` | Champagne tint fill |
| `--color-beeswax` | `#F2E9DA` | Newsletter / gift-edit band |
| `--color-powder` | `#E4EAEE` | Dusty-blue band (maison promise) |
| `--color-mist` | `#9DB2C0` | Dusty-blue secondary accent (WebGL, details) |
| `--color-star` | `#C9A227` | Lit rating stars (PDP + reviews only) |
| `--color-sale` | `#1F7A4D` | Reserved; the card/buy-box sale treatment now uses gold |

`--color-clay` on `--color-cream` measures ≈4.5:1, so it is safe for body-size text.

Shadows are near-flat — luxury reads as hairline, not elevation:
`--shadow-card: 0 0 0 1px rgba(26,25,23,.05)`,
`--shadow-lift: 0 1px 2px rgba(26,25,23,.03), 0 8px 28px rgba(26,25,23,.055)`,
`--shadow-pop: 0 2px 6px rgba(26,25,23,.04), 0 14px 40px rgba(26,25,23,.08)`.

## 3. Typography

- Display (`--font-display`): **Cormorant Garamond**, weights 300–600, normal + italic.
  A high-contrast garalde that echoes the wordmark. Used at ≥20px only — it is too
  light to carry UI text. Headlines run `leading-[1.02]–[1.05]`, `letter-spacing -0.012em`.
  Italic in gold is the maison's emphasis mark (`senses`, chapter numerals).
- UI (`--font-sans`): **Jost**. Everything else. Body 15–16px, `leading-[1.85]` on
  editorial paragraphs.
- Small caps carry the brand: eyebrows `.eyebrow` (0.66rem / `0.24em` / gold),
  nav `0.68rem / 0.16em`, buttons `0.78rem / 0.14em`. All uppercase.
- Prices are display serif on the PDP, sans on cards.

## 4. Shape & radius

Squared, not rounded. `2px` on buttons, fields and cards; `0` on grid card images;
`9999px` only on filter chips and icon buttons. Borders are 1px hairlines.

## 5. Components (`globals.css` — use these, don't re-invent)

- `.btn` — squared 2px rectangle, uppercase, `0.14em` tracking, min-height 48px.
  No hover lift (a shadow only); `:active` presses 1px down.
  - `.btn-solid` ink fill / white text — the primary CTA.
  - `.btn-outline` 1px current-colour border, inverts to ink on hover.
  - `.btn-tint` champagne fill · `.btn-clay` gold fill · `.btn-white` on imagery ·
    `.btn-sm` 40px variant.
- `.chip` — filter/variant pill; `.chip-active` ink fill. Also used for PDP size
  and colour selection.
- `.card-lift` — flat white plate, hairline shadow, 3px hover rise.
- `.field` — flat 2px-radius input, hairline border, ink ring on focus.
- `.search-pill` — flat field group with a nested squared ink submit.
- `.eyebrow` — the gold letterspaced section label.
- `.link-rule` — uppercase link over a gold rule that retracts to 35% on hover.
- `.hairline` — 1px `--color-board` divider.
- `container-x` — max-w 88rem, gutters 1.5 / 3.5 / 5rem.
- `section-y` — the vertical rhythm every band shares: 5.5 / 8 / 9.5rem.

## 6. Product card (`ProductCard`)

Portrait **4:5** square-cornered photograph that cross-fades to its lifestyle shot over
1.4s. Hover reveals a favourite heart (top right) and a full-width `Add to basket` bar
flush to the image's bottom edge. Badge is a gold letterspaced label flush to the left
edge, not a floating chip. Below the image: name in display serif, then price
(gold when reduced, with a taupe strikethrough). Nothing else.

## 7. Motion — GSAP everywhere for scroll

Registered once in `lib/gsap.ts`; Lenis drives ScrollTrigger via `SmoothScroll`.
Durations are slow by house rule: reveals 0.9–1.25s, image transitions 0.9–1.4s.

Scroll layer (`components/anim/` + `components/home/`):

| Piece | Behaviour |
|---|---|
| `ScrollProgress` | Gold hairline across the top, scaleX = page progress |
| `WordReveal` | SplitText words rise from behind their own baseline; `autoSplit` re-splits on font load |
| `CollectionGrid` | The six collections on one screen — six plates across on a laptop, 3×2 on a tablet, 2×3 on a phone — staggering in on entry. Replaced the pinned sideways scroll (Oct 2026): the client found it slow and not obviously scrollable |
| `StickySplit` | Photograph pinned left with a slow push-in while chapters scroll past and light up |
| `StatBand` | `CountUp` figures count on entry; gold divider rules draw down |
| `ScrollExpand` | Letterbox slit opens to full-bleed on a scrubbed timeline |
| `Reveal` / `Stagger` | Batched fade-and-rise for grids |
| `ParallaxImage` / `Drift` | Scrubbed `yPercent` drift |
| `VelocityMarquee` | Ticker-driven, accelerates with scroll velocity |

Rules: every effect is wrapped in `gsap.matchMedia()` with a `(prefers-reduced-motion:
reduce)` branch that **clears** props rather than skipping them, so content can never be
left invisible. Transforms, opacity and clip-path only — never layout properties. No
`markers` in committed code.

Sizing note: `CollectionGrid`'s plates are capped by viewport **height**
(`lg:max-h-[52svh]`) so the heading, the row and the captions fit one screen under the
sticky header, down to a 1366×768 laptop.

Nothing moves under the pointer uninvited: menus open on click and fade (opacity only,
150 ms) — they never slide in on hover (client request, Oct 2026).

## 8. WebGL

`components/webgl/FabricCanvas.tsx` — three.js full-container quad running a flowing
silk shader in ivory → champagne → dusty blue, behind the hero copy. DPR capped at 1.75,
`IntersectionObserver` pauses offscreen, reduced-motion renders a single still frame,
WebGL failure falls through to a CSS gradient, full dispose on unmount.

## 9. Layout patterns

- **Header**: ink announcement rail → white sticky bar (wordmark, dominant search,
  WhatsApp, basket) → centred row of the six collections under their full names, then
  About us. Each name is a button (with a small chevron) that opens its **collection
  panel on click** — never on hover: intro and "Explore the collection" on the left, the
  stocked sub-categories as 56px square thumbnails with names in the middle (three
  columns past six entries), editorial pages marked "Feature", and the collection's
  banner cropped 4:5 with its italic tagline on the right. It fades, closes on a second
  click, an outside press, Escape (focus returns to the name) or any link. A collection
  with nothing to list stays a plain link. Phones: the drawer's collections are
  accordions listing "All …", the sub-categories and pages.
- **Home**: video hero → marquee → collection grid (all six on one screen) → rail →
  ScrollExpand → sticky-split chapters → stat band → fragrance rail → editor's collage →
  promo pair → reviews → maison promise.
- **PLP** (`/shop`): 21:9 collection banner with a cream-to-transparent gradient scrim
  and the heading over the clear third → breadcrumb (Home / Shop / Collection /
  Sub-category) → landing: the six collection tiles; inside a collection: a
  "Shop by category" tile row of its sub-categories and pages → chip bar + filters +
  sort → 4-up grid → related searches. Inside a collection the chip bar is a
  **collection switcher** (an ink pill `select`, "All collections" + the six) followed by
  `All`, one chip per stocked sub-category with its count in fog, page chips with a gold
  ↗, and `On sale`; the landing view keeps the six collection chips. `?sub=` is carried
  through every filter and sort. A sub-category is a real page — its own title,
  description and canonical — and an empty one is noindex.
  Banner art comes from `lib/collection-art.ts`, not the DB — a collection created in
  /admin falls back to its square image. Sub-categories keep their collection's banner.
- **PDP**: thumbnail rail + 4:5 gallery left; buy box right in order — maison line, name,
  stars + review anchor, price, description, material, size/colour chips, quantity,
  add-to-basket, delivery signals, accordions. Then reviews, then a related rail (same
  sub-category first). A **spa voucher** swaps in: "Option" for size, the spa's price as
  a quiet taupe strike-through "at the spa" (never "x% off"), redemption lines for the
  delivery signals, and The experience / Terms / How to redeem accordions.
- **Editorial** (`/wellness-tourism`): 21:9 banner with the title over the clear third →
  statement + a numbered list of destinations → a 4:5 Sri Lanka feature → a centred
  closing line → the vouchers band (beeswax) with three steps → a voucher rail.
- **Basket** (`/basket`): line items with a free-delivery progress rule, sticky summary
  card, WhatsApp fallback, and a "complete the ritual" rail. Empty state is a photograph.
  Free delivery is measured on physical pieces only; a vouchers-only basket shows no
  delivery rule, and checkout skips its delivery step and cash on delivery.
- **Footer**: newsletter band (beeswax) → ink footer, 4 columns → legal row.

## 10. Imagery

All photography is first-party, generated for this brand with Nano Banana Pro (2K) via
the Higgsfield CLI and committed under `public/images/` as WebP:
`categories/` (1:1), `banners/` (21:9, composed with empty ivory space on the left third
for text), `hero/`, `products/` (`<slug>-a` studio, `<slug>-b` lifestyle;
`products/vouchers/` for the spa vouchers), `subcategories/` (1:1, 900px), `editorial/`.
One art direction throughout: soft window light, ivory and cream, champagne gold and
dusty-blue accents, travertine and linen surfaces.

Sub-category tiles are mostly square crops of the same shoot's product and editorial
photographs; the spa-voucher, sleepwear and Wellness Tourism images are new renders in
the same art direction (Oct 2026). Every render is vetted for lettering and brand marks
before it is committed — a garment label was retouched clean on the sleepwear tile. A
replacement gets a new file name: Next 16 refuses local image URLs with query strings.

Because the catalog is local, `next/image` needs no host allowlist for it;
`isAllowedImageUrl` in `lib/admin/actions.ts` accepts `/images/…` and `/brand/…` site
paths alongside Unsplash and Supabase Storage.

## 11. Accessibility & performance

- Body contrast ≥4.5:1, UI ≥3:1. White caption text over the near-ivory photography
  needs a deep scrim — `ScrollExpand` uses a 45% ink wash **plus** a vertical gradient;
  a flat 40% wash left it around 2:1.
- Focus visible everywhere (2px ink ring, offset 2). Touch targets ≥44px.
- `next/image` only; LCP images use `preload` (Next 16 deprecates `priority`).
- GPU-composited animation only. `content-visibility` is not used — it breaks
  ScrollTrigger measurement.

## 12. Taxonomy

- **Collections** (the `categories` table) are the six in the header. Each has
  **sub-categories** (`subcategories`, migration 0011), in their own sort order: under
  Fine Bedlinen & Sleep Luxury, the client's nine — Luxury Bedding, Pillows & Cushions,
  Throws & Quilts, Mattresses & Sleep Systems, Luxury Sleepwear & Robes, Accessories &
  Décor, Lighting for Sleep Spaces, Bedroom Furniture, Headboards & Bed Frames.
- A product sits in one collection and at most one of its sub-categories. Sub-category
  slugs are unique across the catalogue; the dashboard refuses a sub-category from
  another collection.
- The storefront shows a sub-category only once it holds something in stock — menu,
  chips, tiles and sitemap alike — so a shopper never opens an empty shelf. The
  dashboard always shows all of them.
- **Pages** beside the sub-categories (Wellness Tourism under Luxury Wellness) are code,
  in `lib/collection-art.ts`, like banners: designed pages, not catalogue rows.
- **Spa vouchers** are products of kind `voucher`: options are treatments, compare-at is
  the spa's own price, and each unit bought gets a code (`ENV-XXXX-XXXX`) in the
  `vouchers` table — issued when paid (card: automatically; bank transfer: when the
  order is confirmed), then redeemed or voided from /admin/vouchers.
