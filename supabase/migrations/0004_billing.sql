-- Billing: the site's own OpenAI key, a 7-day card-required trial, then
-- $3/month via Stripe. Users no longer supply a key or pick a model.
--
-- The browser never writes to subscriptions or usage. Server route handlers
-- (holding the service-role key) do, after verifying the user's session.

-- ---------- profiles: drop the bring-your-own-key columns ----------
alter table public.profiles drop column if exists openai_api_key;
alter table public.profiles drop column if exists grading_model;

-- ---------- subscriptions (one row per user, mirrored from Stripe) ----------
create table if not exists public.subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text,                      -- trialing | active | past_due | canceled | unpaid | incomplete | incomplete_expired | paused
  trial_end timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
create policy "subscriptions: read own" on public.subscriptions
  for select using (auth.uid() = user_id);
-- no insert/update/delete policies: service role only

-- ---------- usage (graded takes per UTC day) ----------
create table if not exists public.usage (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  takes int not null default 0,
  primary key (user_id, day)
);
alter table public.usage enable row level security;
create policy "usage: read own" on public.usage
  for select using (auth.uid() = user_id);

-- Atomically count a take against today's cap. Returns true if the take
-- was allowed (and counted), false if the cap was already reached.
create or replace function public.bump_usage(uid uuid, cap int)
returns boolean language plpgsql security definer set search_path = public as $$
declare n int;
begin
  insert into public.usage (user_id, day, takes)
  values (uid, (now() at time zone 'utc')::date, 1)
  on conflict (user_id, day) do update
    set takes = usage.takes + 1
    where usage.takes < cap
  returning takes into n;
  return n is not null;
end;
$$;
revoke all on function public.bump_usage(uuid, int) from public, anon, authenticated;

-- Give a take back when OpenAI fails after we counted it.
create or replace function public.unbump_usage(uid uuid)
returns void language sql security definer set search_path = public as $$
  update public.usage set takes = greatest(takes - 1, 0)
  where user_id = uid and day = (now() at time zone 'utc')::date;
$$;
revoke all on function public.unbump_usage(uuid) from public, anon, authenticated;

-- The client can no longer delete the auth user directly: the server route
-- cancels the Stripe subscription first, then deletes with the service role.
drop function if exists public.delete_own_account();

-- The browser no longer inserts speeches; the analyze route does.
drop policy if exists "speeches: insert own" on public.speeches;
