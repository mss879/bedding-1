-- Enivrant — who may sign in to the admin dashboard.
--
-- The dashboard signs in with Supabase Auth (email + password). Having an
-- account is not enough on its own: a Supabase project lets anyone holding the
-- public key sign themselves up unless that is switched off, so the dashboard
-- also requires the account to be on this list. The app reads the list
-- server-side with the service-role key; the public keys can neither see nor
-- change it.
--
-- Safe to re-run.
--
-- To add an admin:
--   1. Supabase → Authentication → Users → Add user: their email and a
--      password, with "Auto Confirm User" ticked.
--   2. Run this in the SQL editor, with their email. One row back means they
--      are on the list; no rows means step 1 has not been done for that email.
--
--        insert into public.admin_users (user_id)
--        select id from auth.users where lower(email) = lower('owner@example.com')
--        on conflict (user_id) do update set user_id = excluded.user_id
--        returning user_id;
--
-- To remove one, delete their row here — or delete the user under
-- Authentication → Users, and the row goes with them. They are locked out on
-- their next click, not when their session runs out.

create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Row level security with no policies, and no table privileges either: the
-- public (anon) and signed-in (authenticated) keys can do nothing here. The
-- service-role key the server uses bypasses RLS.
alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;
grant all on table public.admin_users to service_role;
