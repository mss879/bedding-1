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
no database required. The admin dashboard needs Supabase: it signs in with a
Supabase Auth email and password and manages the data held there (see
[Admin dashboard](#admin-dashboard)).

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
   - [`supabase/migrations/0006_paycorp_payments.sql`](supabase/migrations/0006_paycorp_payments.sql) —
     the columns card payments record their outcome into.
   - [`supabase/migrations/0007_enivrant_catalogue.sql`](supabase/migrations/0007_enivrant_catalogue.sql) —
     the Enivrant catalogue: six collections, 36 pieces, priced in USD.
   - [`supabase/migrations/0008_molee_edit.sql`](supabase/migrations/0008_molee_edit.sql) —
     80 sourced pieces added to the existing collections.
   - [`supabase/migrations/0009_admin_users.sql`](supabase/migrations/0009_admin_users.sql) —
     the list of Supabase accounts allowed into the admin dashboard.
   - [`supabase/migrations/0010_molee_photos_to_storage.sql`](supabase/migrations/0010_molee_photos_to_storage.sql) —
     serves 0008's photographs from Supabase Storage. Upload the photos to
     the bucket first (see [Product photographs](#product-photographs)).
   - [`supabase/migrations/0011_subcategories_and_vouchers.sql`](supabase/migrations/0011_subcategories_and_vouchers.sql) —
     sub-categories under every collection (the nine bedlinen headings among
     them), every piece filed under one, product kinds, the spa-voucher codes
     table and three draft spa vouchers, whose photographs it points at the
     copies already uploaded to the bucket. **Run it before deploying the
     code that needs it** — see [Sub-categories and spa vouchers](#sub-categories-and-spa-vouchers).
3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — reads the catalogue, and checks admin
     sign-ins
   - `SUPABASE_SERVICE_ROLE_KEY` — server-only; the admin dashboard and every
     storefront write (orders, inquiries, newsletter) go through it
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` — the client's WhatsApp number
   - `NEXT_PUBLIC_SITE_URL` — production URL (for SEO/sitemap)
4. Add an admin (see [Admin dashboard](#admin-dashboard)).

Once the env vars are present, products/categories are read from Supabase and
orders, inquiries and newsletter signups are written to it. Without them, the
site falls back to the seed catalog and completes flows in demo mode. **All
three Supabase variables must be set on the host as well** — with
`SUPABASE_SERVICE_ROLE_KEY` missing the storefront still looks healthy, but
orders are not saved and the dashboard cannot be opened. `/admin/login` names
whichever variable is missing.

### Tables

| Table | Purpose | Public access |
| --- | --- | --- |
| `categories`, `products` | Catalog (sizes/prices as JSONB, storefront visibility flags) | read (anon) |
| `orders`, `order_items` | Retail purchase flow (server re-prices every line; COD / bank transfer) | none — server-only writes |
| `inquiries` | Contact + hotel/bulk inquiries | none — server-only writes |
| `newsletter_subscribers` | Footer signups | none — server-only writes |
| `admin_users` | Supabase accounts allowed into `/admin` | none — server-only |
| `subcategories` | One level under each collection (migration 0011) | read (anon) |
| `vouchers` | One code per spa voucher bought, and its status | none — server-only |

The storefront reads the catalog with the **anon key** (public read policies).
All *writes* — orders, inquiries, newsletter — happen inside server actions
through the **service-role key**, and `0003` drops the old public insert
policies so nobody can POST forged orders or spam straight to the REST API with
the anon key. The admin dashboard also reads/writes through the service-role key
(bypasses RLS). The service-role key is server-only and never reaches the
browser bundle.

## Admin dashboard

- `/admin/login` — signs in with a **Supabase Auth email and password**. The
  account must also be on the admin list (`admin_users`, migration `0009`):
  a Supabase project accepts sign-ups from anyone unless that is switched off,
  so having an account is never enough on its own.
  - **Add an admin:** in Supabase → Authentication → Users → *Add user*, enter
    their email and a password and tick *Auto Confirm User*. Then run this in
    the SQL editor with their email — one row back means they are on the list:

    ```sql
    insert into public.admin_users (user_id)
    select id from auth.users where lower(email) = lower('owner@example.com')
    on conflict (user_id) do update set user_id = excluded.user_id
    returning user_id;
    ```

  - **Remove one:** delete their row from `admin_users`, or delete the user
    under Authentication → Users. They are locked out on their next click.
  - **Change a password:** delete the user under Authentication → Users, add
    them again with the new password, and run the insert above once more
    (their admin-list row went with the old account). There is no
    forgot-password page in the dashboard yet.
  - After a successful sign-in the dashboard keeps its own signed, HttpOnly
    session cookie for seven days (`src/lib/admin/session.ts`), so there are no
    Supabase tokens in the browser. The cookie is checked in `src/proxy.ts`;
    the admin list is re-read wherever admin data is loaded and in every admin
    server action.
- **Orders** — list with status filters; detail view with items, customer,
  delivery, payment method; update status (pending → confirmed → shipped →
  delivered / cancelled).
- **Products** — create, edit, delete; sizes & pricing (incl. compare-at),
  photos, details/care/colors, badge, featured, stock toggle. Out-of-stock
  products show "Sold out" and can't be ordered. Photos are added by upload
  only — "Add photos" takes several at once — and each one goes straight into
  the Supabase `product-images` bucket. Every photo shows as a thumbnail with
  where it is stored, and can be replaced, removed or moved up (the first is
  the listing photo).
- **Collections** — create, edit, delete (the photo is upload-only too, into
  the same bucket); **storefront control**: per-collection
  "show in navigation" and "show on homepage" toggles + sort order drive the
  header menus, footer, and homepage sections.
- **Sub-categories** — on each collection's edit page: create, edit (name,
  slug, one-line description, square photo by upload, sort order, show on the
  storefront) and delete. Deleting one leaves its products in the collection,
  unfiled. A product is filed from its own page with the **Sub-category**
  select, which offers the chosen collection's sub-categories only. The
  storefront shows a sub-category — in the header panel, the shop's chips and
  its tiles — once it holds something in stock, so the four empty bedlinen
  headings appear by themselves as soon as a piece is added to them.
- **Spa vouchers** (`/admin/vouchers`) — every code sold, with the order and
  customer, filterable by status and searchable by code. A product becomes a
  voucher with **Type → Spa voucher** on its page: its options are treatments
  and its compare-at price is the spa's own price.

## Product photographs

A product row only stores the *address* of each photograph. Two kinds work:

- **Supabase Storage** — `https://<project>.supabase.co/storage/v1/object/public/product-images/…`.
  The dashboard only adds photos by upload, so everything added or replaced
  there lands here, under `products/` or `collections/`.
- **Site paths** — `/images/products/…`, files in this repo under `public/`.
  The catalogue migrations start products off on these, because SQL can record
  where a photo lives but cannot carry the file.

To serve the Molee edit's photographs from Supabase Storage instead:

1. In Supabase → Storage → `product-images`, drag in the folder
   `public/images/products/molee` from this repo (320 photos).
2. Run [`0010_molee_photos_to_storage.sql`](supabase/migrations/0010_molee_photos_to_storage.sql)
   in the SQL editor. It first checks all 320 are in the bucket and stops,
   changing nothing, if one is missing; then it repoints the 80 pieces photo by
   photo, keeping their order and any photo already replaced in the
   dashboard. It ends by showing the counts, and is safe to run again. It is
   written for this project's Supabase address.

The same in one command, uploading and repointing together (it reads the
project from `.env.local`; `-- --dry-run` shows what it would do, `-- --all`
also moves the other products' photos):

```bash
npm run photos:upload
```

The copies in `public/` stay as the upload source and for the demo-mode
catalogue.

## Sub-categories and spa vouchers

**Order of operations: run 0011, then deploy.** Once this build is live the
dashboard saves a product's sub-category and kind, so it cannot save products
until 0011 has run (it says so). The storefront and the checkout keep working
on a database without 0011 — the site simply shows no sub-categories — so a
deploy that lands first breaks nothing for shoppers. The home page and the
sitemap are built at deploy time, so they pick up 0011's sub-categories on the
next deploy (or the next save in the dashboard).

The vouchers' photographs were uploaded to the `product-images` bucket, under
`vouchers/`, before 0011 was written, so 0011 points the vouchers straight at
them — there is nothing to drag in. On another Supabase project, upload
`public/images/products/vouchers` to that bucket and change the bucket address
in 0011, which is written for this project; a photo the bucket does not have
stays on the website's copy until 0011 is run again.

**How a spa voucher sells**

1. The shopper buys it like any piece. A basket of vouchers only skips the
   delivery step, needs no address, and is paid by card or bank transfer —
   cash on delivery is not offered for a basket with a voucher in it.
2. Each voucher bought gets its own code, `ENV-XXXX-XXXX`, stored as
   *awaiting payment*.
3. **Card:** the codes are issued the moment the payment is confirmed, and the
   confirmation page shows them to the browser that paid (a short-lived signed
   cookie decides that — the page's URL cannot). **Bank transfer:** setting the
   order to *Confirmed* in the dashboard issues them. Cancelling an order voids
   codes not yet issued.
4. Send the codes to the customer on WhatsApp from the order page.
5. When a spa checks a code, find it on **Vouchers** and *Mark redeemed* (with
   an optional note); it can be undone, or a code voided for a refund.

The three vouchers 0011 adds are drafts: their prices, inclusions and terms are
placeholders to replace with the partner spas' real ones in the dashboard, and
no partner spa is named yet.

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
- `scripts/upload-product-photos.mjs` — moves catalogue photographs into
  Supabase Storage (`npm run photos:upload`).
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
- Set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` /
  `SUPABASE_SERVICE_ROLE_KEY` on the host, and add at least one admin (see
  [Admin dashboard](#admin-dashboard)). Provisioning Supabase (env vars + running
  every migration in `supabase/migrations/`, in order) is a **launch gate**:
  until it's done the storefront runs on the seed catalog and orders are not
  persisted. Migration `0006` is what card payments record their outcome into,
  and `0007` replaces the retired Ivory Homez catalogue with the Enivrant one.
- **`0007` is a launch gate for card payments, not cosmetics.** The Ivory Homez
  rows it replaces are priced in LKR while the storefront renders every price as
  USD, so a card order for a `4900` vase would bill LKR 1,470,000 instead of
  LKR 4,900. Run it before taking a single card payment.
- **`0008` adds the Molee edit**: 80 pieces sourced from Chengdu Molee Textile
  (74 bedlinen, 4 wellness, 2 fashion). It only adds pieces that are missing, so
  running it again never overwrites what has been edited in the dashboard. It
  points the pieces at photographs under `public/images/products/molee/`, which
  the website serves; `0010` moves them onto Supabase Storage (see
  [Product photographs](#product-photographs)). It is generated together with
  `src/lib/seed-data-molee.ts`; regenerate both rather than hand-editing one.
- Card payments run against Paycorp's **production** endpoint — any test
  transaction is a real charge, refundable only from the bank's merchant portal.
  Set `PAYCORP_VALIDATE_ONLY=true` for a dry run that moves no money.
- Recommended follow-ups (not blocking): a change-password / forgot-password
  page for admins (sign-in attempts are already rate-limited by Supabase Auth),
  and a real inventory count (the `stock_quantity` column is provisioned in
  `0003` but not yet wired into the admin UI).
