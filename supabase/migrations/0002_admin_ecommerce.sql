-- Aveline Bedding — admin backend + checkout payment options.
-- Run after 0001_init.sql with: supabase db push (or paste into the Supabase SQL editor).
--
-- What this adds:
--   * categories.show_in_nav / show_on_home — storefront visibility controlled
--     from the admin dashboard (nav menu + homepage sections).
--   * orders.payment_method — cash on delivery or direct bank transfer,
--     collected in the new 3-step checkout.
--
-- Admin reads/writes go through the service-role key on the server, which
-- bypasses RLS — no new policies are needed. The storefront keeps the same
-- anon-key policies from 0001 (public read catalog, insert-only orders).

alter table public.categories
  add column if not exists show_in_nav boolean not null default true,
  add column if not exists show_on_home boolean not null default true;

alter table public.orders
  add column if not exists payment_method text not null default 'cod';

do $$
begin
  alter table public.orders
    add constraint orders_payment_method_check
    check (payment_method in ('cod', 'bank_transfer'));
exception
  when duplicate_object then null;
end $$;
