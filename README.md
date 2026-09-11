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
no database required. The admin dashboard needs `ADMIN_PASSWORD` (set it in
`.env.local` for local dev — never commit the value) and Supabase to manage
real data.

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

## Card payments (Paycorp — Commercial Bank of Ceylon)

Checkout can take Visa/Mastercard/Amex through Paycorp's IPG, using the
redirect ("hosted payment page") flow. Card details never touch this app.

**Flow**

1. `placeOrder` re-prices the basket server-side, saves the order as
   `payment_status: 'pending'`, then calls `PAYMENT_INIT`.
2. The shopper is redirected to Paycorp's hosted page; the basket is left intact
   so an abandoned payment has something to come back to.
3. Paycorp returns them to `/api/payments/paycorp/return?reqid=…`. That handler
   calls `PAYMENT_COMPLETE` server-to-server — the browser carries nothing but
   the `reqid`, so there is no amount or status for a shopper to edit.
4. The returned amount and currency are checked against what we asked the
   gateway to charge. Only then is the order marked `paid` / `confirmed` and the
   basket cleared; anything else lands on `/checkout/payment-failed`.

**Terms & Conditions** — the bank requires shoppers to accept the terms before
they can pay. Step 3 of checkout has a required checkbox linking to `/terms`
(opens in a new tab); the pay button stays inactive until it is ticked, and
`placeOrder` refuses any order without `acceptedTerms: true`, so the rule holds
for cash on delivery and bank transfer too. The copy lives in
`src/app/(store)/terms/page.tsx`: bump `LAST_UPDATED` whenever a clause changes,
and keep the `returns` and `privacy` section ids, which the footer deep-links to.

**Wire-level contract** (`src/lib/paycorp/client.ts`)

- `POST` the JSON envelope (`version 1.04`, `msgId`, `operation`, `requestDate`,
  `validateOnly`, `requestData`) to the service endpoint.
- Headers: `AUTHTOKEN`, and `HMAC` = hex HMAC-SHA256 of the **exact request body
  bytes**, keyed by the HMAC secret. The body is serialised once and both hashed
  and sent — re-stringifying in between produces a 401.
- Amounts are integers in minor units (cents), so `LKR 25,500.00` → `2550000`.
- `responseCode` `00` is approved; `PT` is an abandoned page, not a decline.

**Configuration** — see `.env.example`. Leave `PAYCORP_*` blank and the card
option is hidden at checkout; cash on delivery and bank transfer are unaffected.
`NEXT_PUBLIC_SITE_URL` must be the real public https origin, since the gateway
return URL is built from it — Paycorp cannot redirect a shopper to localhost.

> **Currency:** the catalogue is priced in USD but the issued client id settles
> in **LKR**, so card totals are converted at the fixed `PAYCORP_USD_RATE`
> (default `300`, the rate the storefront prices were originally converted at).
> On a USD merchant profile, set `PAYCORP_CURRENCY=USD` and the rate is ignored.

## Structure

- `src/app/(store)/` — storefront pages: home, `shop` (category filters),
  `product/[slug]`, `hotel-bulk`, `about`, `contact`, `terms`, `checkout` (+ success);
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
- **The Terms & Conditions at `/terms` need the client's sign-off.** They were
  drafted from what the site already promises (dispatch in 2–4 working days,
  island-wide delivery, 30-day exchanges, the 365-day guarantee) plus standard
  clauses the site had no position on — hygiene exclusions, a 7-day window to
  report damage, refunds issued within 7 working days, liability and Sri Lankan
  law. If the bank asks for the registered company name, number or address, add
  them to the first clause.
- Change `ADMIN_PASSWORD` to something strong before deploying, and set
  `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` /
  `SUPABASE_SERVICE_ROLE_KEY`. Provisioning Supabase (env vars + running every
  migration in `supabase/migrations/`, in order) is a **launch gate**: until it's
  done the storefront runs on the seed catalog and orders are not persisted.
  Migration `0006` is what card payments record their outcome into, and `0007`
  replaces the retired Ivory Homez catalogue with the Enivrant one.
- **`0007` is a launch gate for card payments, not cosmetics.** The Ivory Homez
  rows it replaces are priced in LKR while the storefront renders every price as
  USD, so a card order for a `4900` vase would bill LKR 1,470,000 instead of
  LKR 4,900. Run it before taking a single card payment.
- Card payments run against Paycorp's **production** endpoint — any test
  transaction is a real charge, refundable only from the bank's merchant portal.
  Set `PAYCORP_VALIDATE_ONLY=true` for a dry run that moves no money.
- Recommended follow-ups (not blocking): rate-limiting/lockout on `/admin` login,
  server-enforced session expiry, and a real inventory count (the `stock_quantity`
  column is provisioned in `0003` but not yet wired into the admin UI).
