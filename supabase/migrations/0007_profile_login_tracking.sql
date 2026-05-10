-- Optional profile fields for account display and visit tracking.
-- Paste this SQL in Supabase before relying on visit counts in production.

alter table public.profiles
add column if not exists username text,
add column if not exists visit_count integer not null default 0,
add column if not exists last_seen_at timestamptz;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, username, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'name', ''),
    'user'
  )
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(nullif(public.profiles.name, ''), excluded.name),
        username = coalesce(nullif(public.profiles.username, ''), excluded.username);

  return new;
end;
$$;

create or replace function public.track_profile_visit()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set visit_count = coalesce(visit_count, 0) + 1,
      last_seen_at = now()
  where id = auth.uid();
end;
$$;
