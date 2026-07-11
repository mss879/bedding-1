-- Ivory Homez — production hardening (orders, products, collections).
--
-- Run AFTER 0001_init.sql and 0002_admin_ecommerce.sql, with:
--   supabase db push   (or paste into the Supabase SQL editor)
--
-- This migration is ADDITIVE and IDEMPOTENT: it does not drop or rewrite any
-- existing table or delete any data, and it is safe to run more than once.
-- It pairs with this build's code changes (storefront writes now go through the
-- server-side service-role client). Everything the three core requirements need
-- (add products, create collections that reflect on the storefront, take orders)
-- already works on 0001+0002; this file closes the correctness/robustness gaps
-- the review found and provisions the product-image storage bucket.


-- ============================================================
-- 1. Let collections be renamed safely, and block accidental
--    cascade-deletes of a collection's products.
--
--    0001 created products.category_slug inline as
--      references categories(slug) on delete cascade
--    which defaults to ON UPDATE NO ACTION — so renaming a collection's slug
--    while it has products throws a foreign-key violation (the admin edit
--    failed with a generic error). Recreate the FK with ON UPDATE CASCADE so a
--    rename propagates to the products, and ON DELETE RESTRICT so the database
--    itself refuses to delete a non-empty collection (the admin already checks
--    this in code; this makes it impossible to bypass).
-- ============================================================
alter table public.products
  drop constraint if exists products_category_slug_fkey;

alter table public.products
  add constraint products_category_slug_fkey
    foreign key (category_slug)
    references public.categories(slug)
    on update cascade
    on delete restrict;


-- ============================================================
-- 2. updated_at columns + auto-maintaining trigger
--    (products, categories, orders). No application code change needed —
--    the trigger stamps updated_at on every UPDATE.
-- ============================================================
alter table public.products   add column if not exists updated_at timestamptz not null default now();
alter table public.categories add column if not exists updated_at timestamptz not null default now();
alter table public.orders     add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists set_updated_at on public.products;
create trigger set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.categories;
create trigger set_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.orders;
create trigger set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();


-- ============================================================
-- 3. Auditable order status transitions: record WHEN status last changed.
-- ============================================================
alter table public.orders
  add column if not exists status_changed_at timestamptz not null default now();

create or replace function public.set_order_status_changed_at()
returns trigger language plpgsql as $$
begin
  if new.status is distinct from old.status then
    new.status_changed_at = now();
  end if;
  return new;
end $$;

drop trigger if exists set_order_status_changed_at on public.orders;
create trigger set_order_status_changed_at before update on public.orders
  for each row execute function public.set_order_status_changed_at();


-- ============================================================
-- 4. Optional inventory count. Nullable = "untracked" (keeps the existing
--    in_stock boolean as the source of truth); set a number per product later
--    if you want real stock levels. Reserved for a future inventory feature —
--    adding the column now avoids another migration then.
-- ============================================================
alter table public.products
  add column if not exists stock_quantity integer;

do $$
begin
  alter table public.products
    add constraint products_stock_quantity_check
    check (stock_quantity is null or stock_quantity >= 0);
exception when duplicate_object then null;
end $$;


-- ============================================================
-- 5. Data-integrity guards on orders / order_items
-- ============================================================
do $$
begin
  alter table public.orders
    add constraint orders_total_nonneg_check check (total >= 0);
exception when duplicate_object then null;
end $$;

-- The cart merges identical product+size lines, so each (order, product, size)
-- should appear once; enforce it so a retry can never double-insert a line.
do $$
begin
  alter table public.order_items
    add constraint order_items_unique_line unique (order_id, product_slug, size_name);
exception when duplicate_object then null;
end $$;


-- ============================================================
-- 6. Indexes for the admin/storefront hot paths
--    (order list/filter/count, inquiry filter, in-stock catalog reads).
-- ============================================================
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx      on public.orders (status);
create index if not exists inquiries_status_idx    on public.inquiries (status);
create index if not exists products_category_instock_idx
  on public.products (category_slug) where in_stock;


-- ============================================================
-- 7. Product-image storage bucket (enables uploading images from the admin
--    instead of only pasting URLs). Public read; writes are done by the admin
--    service-role client, which bypasses RLS. The bucket host is already
--    allow-listed in next.config.ts (*.supabase.co/storage/v1/object/public/**).
--
--    Note: the storage.* statements need the elevated privileges the Supabase
--    SQL editor / migration runner has. If your role can't create storage
--    policies, create the "product-images" bucket (public) from the Storage UI
--    and skip this section.
-- ============================================================
insert into storage.buckets (id, name, public)
  values ('product-images', 'product-images', true)
  on conflict (id) do nothing;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images" on storage.objects
  for select using (bucket_id = 'product-images');


-- ============================================================
-- 8. Close the direct-anon write surface.
--    0001 gave orders/order_items/inquiries/newsletter a
--    `for insert with check (true)` policy so the storefront could write them
--    with the public anon key. In THIS build every storefront write instead
--    goes through the server-side service-role client (src/lib/actions.ts),
--    which bypasses RLS, so these public policies are no longer used — and
--    dropping them stops anyone from POSTing forged orders/spam straight to the
--    REST API with the public anon key.
--
--    IMPORTANT: only run this section together with this build. If you ever roll
--    back to a build whose storefront writes with the anon key, re-create these
--    policies (see 0001) or those writes will fail.
-- ============================================================
drop policy if exists "Public create orders" on public.orders;
drop policy if exists "Public create order items" on public.order_items;
drop policy if exists "Public create inquiries" on public.inquiries;
drop policy if exists "Public subscribe newsletter" on public.newsletter_subscribers;
