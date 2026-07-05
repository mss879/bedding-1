# Aveline — Bedding Website & E-Commerce Platform

Premium bedding storefront built with **Next.js 16** and **Supabase**, per the
Arcai Agency project proposal. Two customer journeys plus a management one:

1. **Retail** — browse in-stock products, add to cart, 3-step checkout
   (contact → delivery → payment), cash on delivery or direct bank transfer.
2. **Hotel / bulk / custom** — a dedicated inquiry flow that routes straight to
   WhatsApp with the buyer's requirements pre-filled.
3. **Admin dashboard** (`/admin`) — Shopify-style backend: manage orders,
   products, and collections, including what the storefront shows.

## Running locally

```bash
npm install
npm run dev
```

The site is fully functional out of the box using the built-in seed catalog —
no database required. The admin dashboard needs `ADMIN_PASSWORD` (already set
to `aveline-admin` in `.env.local` for local dev) and Supabase to manage real
data.

## Connecting Supabase

1. Create a Supabase project.
2. Run the migrations in order (paste into the SQL editor, or `supabase db push`):
   - [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) —
     tables, RLS policies, seed catalog.
   - [`supabase/migrations/0002_admin_ecommerce.sql`](supabase/migrations/0002_admin_ecommerce.sql) —
     collection visibility flags + order payment method.
3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` — server-only, powers the admin dashboard
   - `ADMIN_PASSWORD` — login for `/admin`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` — the client's WhatsApp number
   - `NEXT_PUBLIC_SITE_URL` — production URL (for SEO/sitemap)

Once the env vars are present, products/categories are read from Supabase and
orders, inquiries and newsletter signups are written to it. Without them, the
site falls back to the seed catalog and completes flows in demo mode.

### Tables

| Table | Purpose | Public access |
| --- | --- | --- |
| `categories`, `products` | Catalog (sizes/prices as JSONB, storefront visibility flags) | read |
| `orders`, `order_items` | Retail purchase flow (server re-prices every line; COD / bank transfer) | insert |
| `inquiries` | Contact + hotel/bulk inquiries | insert |
| `newsletter_subscribers` | Footer signups | insert |

The admin dashboard reads and writes through the **service-role key** on the
server (bypasses RLS); the storefront only ever uses the anon key.

## Admin dashboard

- `/admin/login` — password login (`ADMIN_PASSWORD`), signed HttpOnly session
  cookie, all `/admin` routes gated in `src/proxy.ts` and re-checked in every
  admin server action.
- **Orders** — list with status filters; detail view with items, customer,
  delivery, payment method; update status (pending → confirmed → shipped →
  delivered / cancelled).
- **Products** — create, edit, delete; sizes & pricing (incl. compare-at),
  images by URL, details/care/colors, badge, featured, stock toggle.
- **Collections** — create, edit, delete; **storefront control**: per-collection
  "show in navigation" and "show on homepage" toggles + sort order drive the
  header menus, footer, and homepage sections.

## Structure

- `src/app/(store)/` — storefront pages: home, `shop` (category filters),
  `product/[slug]`, `hotel-bulk`, `about`, `contact`, `checkout` (+ success);
  chrome lives in the group layout.
- `src/app/admin/` — admin dashboard (own shell, no storefront chrome).
- `src/lib/` — site config (`site.ts`), catalog data layer with Supabase
  fallback (`catalog.ts`), storefront server actions (`actions.ts`),
  admin data/actions/auth (`lib/admin/`), service-role client
  (`supabase-admin.ts`), seed data.
- `src/proxy.ts` — auth gate for `/admin` (Next 16 proxy, ex-middleware).
- `src/components/anim/` — scroll animation primitives: `Reveal`, `MaskReveal`,
  `Stagger`, `LineReveal` (masked line-by-line headlines), `ParallaxImage`,
  `ScrollExpand` (pinned image that grows to full-bleed on scroll).
- Smooth scrolling via Lenis; animations via GSAP + Motion. All animations
  respect `prefers-reduced-motion`.

## Notes for handover

- Brand name "Aveline", copy, and Unsplash imagery are placeholders — swap in
  the client's brand, product photography, and real WhatsApp number.
- Bank-transfer details on the order-success page are placeholders — set the
  client's real account in `src/lib/site.ts` (`bankDetails`).
- Change `ADMIN_PASSWORD` to something strong before deploying.
- Payment gateways remain out of scope; checkout settles cash on delivery or
  bank transfer, confirmed over WhatsApp.
