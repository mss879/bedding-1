# Aveline — Bedding Website & E-Commerce Platform

Premium bedding storefront built with **Next.js 16** and **Supabase**, per the
Arcai Agency project proposal. Two customer journeys:

1. **Retail** — browse in-stock products, add to cart, place an order.
2. **Hotel / bulk / custom** — a dedicated inquiry flow that routes straight to
   WhatsApp with the buyer's requirements pre-filled.

## Running locally

```bash
npm install
npm run dev
```

The site is fully functional out of the box using the built-in seed catalog —
no database required.

## Connecting Supabase

1. Create a Supabase project.
2. Run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   (paste into the SQL editor, or `supabase db push`). It creates all tables,
   RLS policies, and seeds the catalog.
3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` — the client's WhatsApp number
   - `NEXT_PUBLIC_SITE_URL` — production URL (for SEO/sitemap)

Once the env vars are present, products/categories are read from Supabase and
orders, inquiries and newsletter signups are written to it. Without them, the
site falls back to the seed catalog and completes flows in demo mode.

### Tables

| Table | Purpose | Public access |
| --- | --- | --- |
| `categories`, `products` | Catalog (sizes/prices as JSONB) | read |
| `orders`, `order_items` | Retail purchase flow (server re-prices every line) | insert |
| `inquiries` | Contact + hotel/bulk inquiries | insert |
| `newsletter_subscribers` | Footer signups | insert |

## Structure

- `src/app/` — pages: home, `shop` (category filters), `product/[slug]`,
  `hotel-bulk`, `about`, `contact`, `checkout` (+ success), sitemap, robots.
- `src/lib/` — site config (`site.ts`), catalog data layer with Supabase
  fallback (`catalog.ts`), server actions (`actions.ts`), seed data.
- `src/components/anim/` — scroll animation primitives: `Reveal`, `MaskReveal`,
  `Stagger`, `LineReveal` (masked line-by-line headlines), `ParallaxImage`,
  `ScrollExpand` (pinned image that grows to full-bleed on scroll).
- Smooth scrolling via Lenis; animations via Motion (framer-motion). All
  animations respect `prefers-reduced-motion`.

## Notes for handover

- Brand name "Aveline", copy, and Unsplash imagery are placeholders — swap in
  the client's brand, product photography, and real WhatsApp number.
- Checkout settles payment on delivery / bank transfer, confirmed over
  WhatsApp; payment gateways were out of scope per the proposal.
