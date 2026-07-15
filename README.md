# Ivory Homez — Home & Living E-Commerce Platform

Holistic home & living storefront (handcrafted bedding, stoneware, lighting,
storage and garden pieces) built with **Next.js 16** and **Supabase**, per the
Arcai Agency project proposal. Two customer journeys plus a management one:

1. **Retail** — browse in-stock products, add to cart, 3-step checkout
   (contact → delivery → payment), cash on delivery or direct bank transfer.
2. **Hotel / trade / custom** — a dedicated inquiry flow that routes straight to
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
to `ivoryhomez-admin` in `.env.local` for local dev) and Supabase to manage real
data.

## Connecting Supabase

1. Create a Supabase project.
2. Run the migrations in order (paste into the SQL editor, or `supabase db push`):
   - [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) —
     tables, RLS policies, seed catalog.
   - [`supabase/migrations/0002_admin_ecommerce.sql`](supabase/migrations/0002_admin_ecommerce.sql) —
     collection visibility flags + order payment method.
   - [`supabase/migrations/0003_production_hardening.sql`](supabase/migrations/0003_production_hardening.sql) —
     safe collection renames (FK `on update cascade` / `on delete restrict`),
     `updated_at` + order status-change timestamps, integrity checks & indexes,
     the `product-images` Storage bucket (for image uploads), and it closes the
     public anon write policies now that the storefront writes via the service
     role. Additive and idempotent — safe to run after 0001+0002.
   - [`supabase/migrations/0004_update_categories.sql`](supabase/migrations/0004_update_categories.sql) —
     replaces the original bedding categories with the six room collections
     (Kitchen, Bedroom, Lounge, Bathroom, Garden, Garage).
   - [`supabase/migrations/0005_holistic_home_catalog.sql`](supabase/migrations/0005_holistic_home_catalog.sql) —
     the holistic home & living rebrand: room descriptions + the full 25-piece
     catalog (stoneware, teak, rattan lighting, candles, planters, workshop
     storage alongside the retained textile line). Upserts by slug; see the
     header comment before running if products were added via the admin.
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
| `categories`, `products` | Catalog (sizes/prices as JSONB, storefront visibility flags) | read (anon) |
| `orders`, `order_items` | Retail purchase flow (server re-prices every line; COD / bank transfer) | none — server-only writes |
| `inquiries` | Contact + hotel/bulk inquiries | none — server-only writes |
| `newsletter_subscribers` | Footer signups | none — server-only writes |

The storefront reads the catalog with the **anon key** (public read policies).
All *writes* — orders, inquiries, newsletter — happen inside server actions
through the **service-role key**, and `0003` drops the old public insert
policies so nobody can POST forged orders or spam straight to the REST API with
the anon key. The admin dashboard also reads/writes through the service-role key
(bypasses RLS). The service-role key is server-only and never reaches the
browser bundle.

## Admin dashboard

- `/admin/login` — password login (`ADMIN_PASSWORD`), signed HttpOnly session
  cookie, all `/admin` routes gated in `src/proxy.ts` and re-checked in every
  admin server action.
- **Orders** — list with status filters; detail view with items, customer,
  delivery, payment method; update status (pending → confirmed → shipped →
  delivered / cancelled).
- **Products** — create, edit, delete; sizes & pricing (incl. compare-at),
  images (upload a photo to Supabase Storage or paste a URL), details/care/colors,
  badge, featured, stock toggle. Out-of-stock products show "Sold out" and can't
  be ordered.
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

- Brand is **Ivory Homez** (`https://www.ivoryhomez.com`), set in `src/lib/site.ts`
  and `.env` (`NEXT_PUBLIC_SITE_URL`). Still placeholder and needing the client's
  real values in `src/lib/site.ts`: `email`, `phone`, `addressLines`, and
  `whatsappNumber` (also `NEXT_PUBLIC_WHATSAPP_NUMBER`). Seed products and the
  Unsplash imagery are demo content — replace with the client's real catalogue in
  `/admin` once Supabase is connected.
- Bank-transfer details on the order-success page are placeholders — set the
  client's real account in `src/lib/site.ts` (`bankDetails`).
- Change `ADMIN_PASSWORD` to something strong before deploying, and set
  `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` /
  `SUPABASE_SERVICE_ROLE_KEY`. Provisioning Supabase (env vars + running all
  three migrations) is a **launch gate**: until it's done the storefront runs on
  the seed catalog and orders are not persisted.
- Payment gateways remain out of scope; checkout settles cash on delivery or
  bank transfer, confirmed over WhatsApp.
- Recommended follow-ups (not blocking): rate-limiting/lockout on `/admin` login,
  server-enforced session expiry, and a real inventory count (the `stock_quantity`
  column is provisioned in `0003` but not yet wired into the admin UI).
