-- Site-connected operation popups.

create table if not exists public.content_popups (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  title text not null,
  body text not null default '',
  image_url text,
  button_label text,
  button_url text,
  placement text not null default 'home' check (placement in ('all', 'home')),
  status text not null default 'inactive' check (status in ('active', 'inactive')),
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_popups_site_id_idx
on public.content_popups(site_id);

create index if not exists content_popups_status_idx
on public.content_popups(status);

create index if not exists content_popups_schedule_idx
on public.content_popups(starts_at, ends_at);

alter table public.content_popups enable row level security;

drop policy if exists "content_popups_select_workspace_member" on public.content_popups;
create policy "content_popups_select_workspace_member"
on public.content_popups
for select
to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = content_popups.site_id
      and public.is_workspace_member(sites.workspace_id)
  )
);

drop policy if exists "content_popups_public_active_select" on public.content_popups;
create policy "content_popups_public_active_select"
on public.content_popups
for select
to anon, authenticated
using (
  status = 'active'
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
  and exists (
    select 1
    from public.sites
    where sites.id = content_popups.site_id
      and sites.status = 'published'
  )
);

drop policy if exists "content_popups_editor_all" on public.content_popups;
create policy "content_popups_editor_all"
on public.content_popups
for all
to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = content_popups.site_id
      and public.is_workspace_editor(sites.workspace_id)
  )
)
with check (
  public.is_super_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = content_popups.site_id
      and public.is_workspace_editor(sites.workspace_id)
  )
);
