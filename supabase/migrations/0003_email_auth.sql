-- Real email addresses. Sign-up now requires a confirmed email; login is
-- email + password; the username stays as the public handle.
--
-- Because the account is not usable until the email is confirmed, the
-- browser cannot insert the profile row itself (RLS needs a session). A
-- trigger creates it from the sign-up metadata instead.
--
-- Dashboard settings that go with this file:
--   Authentication → Sign In / Providers → Email → "Confirm email" ON (default)
--   Authentication → URL Configuration → Site URL = your production URL
--     Redirect URLs: add  https://<prod-domain>/**
--                         https://*-matthew-sinitieres-projects.vercel.app/**
--                         http://localhost:3000/**

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  u text := lower(coalesce(new.raw_user_meta_data ->> 'username', ''));
  d text := coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), u);
begin
  if u = '' then
    u := 'user_' || substr(replace(new.id::text, '-', ''), 1, 10);
  end if;
  insert into public.profiles (id, username, display_name)
  values (new.id, u, left(d, 50))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Any accounts created under the old synthetic-email scheme keep working
-- for login only if their password is known; there is no email to reset
-- with. Nothing else to migrate.
