-- Impromptu v2 — initial schema
-- Run in Supabase Dashboard → SQL Editor (project ztxfcgygrnvwymyzcgyb).
-- Then run 0002_grading_model.sql and 0003_email_auth.sql (which adds the
-- profile-creating trigger and describes the Auth dashboard settings).

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text not null check (char_length(display_name) between 1 and 50),
  openai_api_key text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- Username availability check that works before the caller is signed in.
create or replace function public.username_taken(u text)
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.profiles where username = lower(u));
$$;
grant execute on function public.username_taken(text) to anon, authenticated;

-- ---------- speeches ----------
create table if not exists public.speeches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic text not null,
  field text not null,
  difficulty int not null check (difficulty between 1 and 3),
  transcript text,
  analysis jsonb,
  duration_seconds int,
  word_count int,
  grade text,
  version int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists speeches_user_created on public.speeches (user_id, created_at desc);

alter table public.speeches enable row level security;

create policy "speeches: read own" on public.speeches
  for select using (auth.uid() = user_id);
create policy "speeches: insert own" on public.speeches
  for insert with check (auth.uid() = user_id);
create policy "speeches: delete own" on public.speeches
  for delete using (auth.uid() = user_id);

-- ---------- user_settings ----------
create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  theme text not null default 'light' check (theme in ('light', 'dark')),
  difficulty_filter int not null default 0 check (difficulty_filter between 0 and 3),
  category_filters text[],
  notes jsonb not null default '{}'::jsonb,
  checks jsonb not null default '{}'::jsonb,
  history jsonb not null default '[]'::jsonb,
  favs jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "settings: read own" on public.user_settings
  for select using (auth.uid() = user_id);
create policy "settings: insert own" on public.user_settings
  for insert with check (auth.uid() = user_id);
create policy "settings: update own" on public.user_settings
  for update using (auth.uid() = user_id);

-- ---------- account deletion ----------
-- Lets a signed-in user delete their own auth.users row from the client
-- (profiles / speeches / settings cascade). Without this, deleting an auth
-- user requires the service-role key, which we never ship to the browser.
create or replace function public.delete_own_account()
returns void language plpgsql security definer as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;
grant execute on function public.delete_own_account() to authenticated;
