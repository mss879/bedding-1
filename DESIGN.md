# Ivory Homez — Design System (Etsy-marketplace direction)

The client wants the **primary look of etsy.com** — warm, crafty, dense marketplace — elevated
with GSAP scroll animations and a WebGL hero. Tokens below were extracted from Etsy's real
production CSS (Collage design system, 2025–26 "refresh" theme) and adapted to the Ivory Homez
home & living brand. Every color/radius/shadow in the codebase must trace to a token here.

## 1. Identity

- Product: holistic home & living e-commerce (retail + hotel/trade), Sri Lanka. Brand "Ivory Homez" (placeholder).
  Range spans every room — bedding and textiles (heritage line), stoneware, teak, rattan lighting,
  candles, planters and workshop storage.
- Feel: "paper and cardboard, not screen" — warm neutrals, ink-black pill CTAs, candy blue as a
  *special* accent (never the primary CTA color), gold stars, green sale text, rounded everything.
- Reference: etsy.com. Card anatomy, search pill, badges, and section rhythm follow Etsy;
  copy and imagery stay Ivory Homez.

## 2. Color tokens (globals.css `@theme`)

Legacy names are kept (remapped) so existing utility classes keep working:

| Token | Value | Use |
|---|---|---|
| `--color-cream` | `#FAF8F5` | Page background (Etsy warm paper) |
| `--color-parchment` | `#FFFFFF` | White band sections, cards on paper |
| `--color-sand` | `#EFECEA` | Image placeholders, soft fills, skeletons |
| `--color-clay` | `#2b6580` | **Accent** (legible candy blue text/highlights): logo, search button, eyebrows, links. NOT primary CTAs |
| `--color-clay-dark` | `#1f4b60` | Accent hover/pressed |
| `--color-ink` | `#222222` | Primary text AND primary button fill |
| `--color-ink-soft` | `#595959` | Secondary text |
| `--color-taupe` | `#9F938E` | Tertiary/warm gray (scrollbar, disabled) |
| `--color-linen` | `#FFFFFF` | Text/surfaces on dark |
| `--color-fog` | `#757575` | Tertiary text, unlit stars |
| `--color-board` | `#E0DAD6` | Soft borders ("cardboard") |
| `--color-accent-tint` | `#B2D5E5` | Candy blue background (accent tint) |
| `--color-beeswax` | `#d2e5ee` | Subtle candy blue promo band |
| `--color-powder` | `#D5E8F2` | "What is Ivory Homez?" value-props band (Etsy powder blue) |
| `--color-star` | `#FFA300` | Lit rating stars (gold) |
| `--color-sale` | `#1BA050` | Sale prices, "(20% off)", "FREE delivery" text — green, never red |

Shadows are warm brown-black `#150A04`, never pure black:
`--shadow-card: 0 0 2px rgba(21,10,4,.18)`, `--shadow-lift: 0 2px 8px rgba(21,10,4,.06), 0 6px 16px 2px rgba(21,10,4,.08)`, `--shadow-pop: 0 4px 12px rgba(21,10,4,.06), 0 8px 20px 2px rgba(21,10,4,.10)`.

## 3. Typography

- Display (`--font-display`): **Fraunces** — soft, crafty serif (Etsy's Guardian Egyptian / ABC Otto vibe).
  Section H1/H2, hero headline, logo. Weight 500–600, `font-optical-sizing: auto`.
- UI/body (`--font-sans`): **Hanken Grotesk** — Graphik-like grotesque. Everything else.
- Body 16px; microcopy/card titles 13–14px; buttons 15–16px medium (500), **sentence case —
  no uppercase tracking** (that was the old design). Card price bold.

## 4. Shape & radius (8px base, Etsy Collage scale)

| Use | Radius |
|---|---|
| Badges on images, tiny chips | `4px` |
| Inputs, card images, listing thumbs | `8px` |
| Cards, menus, popovers | `12px` |
| Hero banner, large promo tiles, dialogs | `16–24px` |
| Buttons, search bar, filter pills, avatars, category circles | `9999px` (full pill) |

Inputs are *recessed* (inset shadow `inset 0 1px 4px rgba(14,14,14,.09)`), cards are *raised*.
Borders are chunky **2px** on emphasis (search pill, secondary buttons), 1px `--color-board` hairlines elsewhere.

## 5. Components (globals.css utilities — use these, don't re-invent)

- `.btn` — pill, min-h 48px, px 26px, 500 weight, sentence case, squash-stretch hover
  (`scaleX(1.015) scaleY(1.035)`, active `scale(.99)`).
  - `.btn-solid` primary: ink fill, white text, hover `#2F2F2F`. **Primary CTAs are BLACK, not candy blue.**
  - `.btn-outline` secondary: transparent, 2px ink border.
  - `.btn-tint` tertiary: 9% ink tint fill, no border.
  - `.btn-clay` accent (rare — search submit, WhatsApp): candy blue fill, hover clay-dark.
  - `.btn-white` on dark/imagery. `.btn-sm` 40px height variant.
- `.chip` — filter/category pill: white, 1px board border; `.chip-active` ink fill white text.
- `.card-lift` — white, radius 12, `--shadow-card`, hover translateY(-2px) + `--shadow-lift`.
- `.badge-img` — tiny rectangle badge over images: white bg, ink text, radius 4px, 11–12px semibold
  (used for "Bestseller", "New", "Save 20%").
- `.field` — 8px radius, recessed inset shadow, 1px `#949494` border, 2px ink border on focus.
- `.search-pill` — full-round group, 2px ink border, white bg, inset tint; circular candy blue submit
  button (44px) nested right.
- `.hairline` — 1px `--color-board` divider.
- `container-x` — unchanged (max-w 80rem).
- Stars: `<Stars rating count />` component — inline SVG, lit `--color-star` over `--color-fog`,
  fractional fill via clip; count in parens, 13px `--color-ink-soft`.

## 6. Product card (Etsy anatomy — `ProductCard`)

Landscape **4:3** rounded-lg image (hover: slight zoom + shadow deepen + white circular heart
button top-right + quick-add pill bottom), `.badge-img` bottom-left when `product.badge`.
Below: 14px single-line truncated title → stars+(count) → bold price with gray strikethrough
compare-at + green "(X% off)" → green "FREE delivery" line when top size ≥ Rs 15,000.
Ratings come from `lib/ratings.ts` (`productRating(slug)`) — deterministic, no DB change.

## 7. Motion (GSAP everywhere for scroll; motion/react only for enter/exit UI state)

- GSAP 3 + ScrollTrigger, registered once in each client component via `@gsap/react` `useGSAP`.
- Lenis drives scroll; `SmoothScroll` wires `lenis.on('scroll', ScrollTrigger.update)` + gsap ticker.
- Defaults: reveals `y: 28, autoAlpha 0 → 1, duration 0.7, ease "power3.out"`, batches stagger 0.08.
- Scrub parallax: images `yPercent ±8–12`, `ease: "none"`.
- Pinned set-piece: `CraftStory` (240vh, scrub timeline: clip-path opens, headline halves part).
- Marquee: GSAP ticker + scroll velocity.
- Squash-stretch on buttons is CSS (`transition: transform .18s`), not JS.
- Every scroll effect wrapped in `gsap.matchMedia()` with `(prefers-reduced-motion: reduce)`
  branch that skips transforms (content must remain visible — use `gsap.set` clears).
- Never animate layout properties. Transforms/opacity/clip-path only. No `markers` in committed code.

## 8. WebGL

`components/webgl/FabricCanvas.tsx` — three.js full-container quad with a flowing "silk/fabric"
fragment shader in brand colors (paper → accent-tint → soft candy blue highlights). Used inside the
rounded hero banner behind content. Rules: DPR capped at 1.75, `IntersectionObserver` pauses
offscreen, WebGL-unavailable and reduced-motion fall back to a static CSS gradient, full dispose
on unmount.

## 9. Layout patterns (Etsy structure)

- Header: white, sticky; logo (display serif, candy blue, lowercase) · "Categories" pill button with
  dropdown panel · dominant search pill (submits to `/shop?q=`) · WhatsApp, cart icons (40px
  circular hover targets). Row 2 (desktop): centered small category links. Mobile: search pill
  on its own row; drawer menu.
- Section rhythm: H2 display-serif left + "See more →" link right; carousels use circular
  white arrow buttons (board border, shadow-pop).
- PLP (shop): breadcrumb › display H1 › subcategory image-tile row › filter pill bar + sort
  select › 4-col grid (2 mobile) › related-searches pill row.
- PDP: left = vertical thumbnail rail + rounded main image; right buy box order: urgency line,
  price (sale green), title, shop line with stars, size/qty selects, black "Add to cart" pill +
  2px-outline "Buy it now", signal rows (truck/returns/free delivery), accordions (Item details
  open by default, Shipping & returns), then reviews (gold stars) and "More from Ivory Homez" carousel.
- Footer: newsletter capture band (beeswax) → dark ink footer, 4 link columns → bottom legal row
  with region "Sri Lanka | English (UK) | Rs (LKR)".

## 10. Accessibility & perf

- Contrast: body 4.5:1, UI 3:1 (ink on paper passes; never light-gray-on-white below 13px).
- Focus visible everywhere (2px ink ring, offset 2). Touch targets ≥ 44px.
- `next/image` only; hero/LCP uses `preload` (Next 16: `priority` is deprecated).
- Images stay on `images.unsplash.com` (whitelisted in next.config.ts).
- GPU-composited animation only; `content-visibility` not used (breaks ScrollTrigger measurements).
