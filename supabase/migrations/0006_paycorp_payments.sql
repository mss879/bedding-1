-- Enivrant — card payments through Paycorp (Commercial Bank of Ceylon IPG).
--
-- The gateway runs a redirect flow: we call PAYMENT_INIT, send the shopper to
-- Paycorp's hosted page, and on return call PAYMENT_COMPLETE to find out what
-- actually happened. Nothing about the outcome is taken from the browser, so
-- every column below is written server-side from the PAYMENT_COMPLETE response.
--
-- Safe to re-run.

-- 1. 'card' joins cod / bank_transfer as an accepted payment method.
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method in ('cod', 'bank_transfer', 'card'));

-- 2. Payment lifecycle, kept separate from the fulfilment `status` column: an
--    order can be paid but not yet shipped, or shipped (COD) but not yet paid.
--    'unpaid'  — nothing to collect online (cod / bank transfer)
--    'pending' — card order handed to Paycorp, awaiting the return leg
--    'paid'    — PAYMENT_COMPLETE returned responseCode '00'
--    'failed'  — declined, or the amount/currency did not match the order
alter table public.orders add column if not exists payment_status text not null default 'unpaid';

do $$ begin
  alter table public.orders
    add constraint orders_payment_status_check
    check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'cancelled'));
exception when duplicate_object then null; end $$;

-- 3. Gateway transaction detail. `payment_reqid` is the token Paycorp issues at
--    PAYMENT_INIT and hands back on the return leg — it is how the return
--    handler finds the order, so it is indexed and never reused.
alter table public.orders add column if not exists payment_reqid          text;
alter table public.orders add column if not exists payment_txn_reference  text;
alter table public.orders add column if not exists payment_auth_code      text;
alter table public.orders add column if not exists payment_card_type      text;
alter table public.orders add column if not exists payment_card_masked    text;
alter table public.orders add column if not exists payment_response_code  text;
alter table public.orders add column if not exists payment_response_text  text;
-- The currency and amount actually charged. The catalogue is priced in USD but
-- the merchant profile settles in LKR, so this is not always `total`.
alter table public.orders add column if not exists payment_currency       text;
alter table public.orders add column if not exists payment_amount         numeric(12,2);
alter table public.orders add column if not exists paid_at                timestamptz;

create index if not exists orders_payment_reqid_idx  on public.orders (payment_reqid);
create index if not exists orders_payment_status_idx on public.orders (payment_status);

-- 4. Orders remain closed to the anon key (see 0003) — the storefront writes
--    them with the service-role client, and so does the Paycorp return handler.
