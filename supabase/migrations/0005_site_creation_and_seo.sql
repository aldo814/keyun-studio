-- User site creation flow and SEO settings.

create table if not exists public.site_seo_settings (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  page_id uuid references public.site_pages(id) on delete cascade,
  scope text not null default 'site',
  title text,
  description text,
  og_title text,
  og_description text,
  og_image_url text,
  canonical_url text,
  robots_index boolean not null default true,
  robots_follow boolean not null default true,
  favicon_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, page_id, scope)
);

create index if not exists site_seo_settings_site_id_idx
on public.site_seo_settings(site_id);

alter table public.site_seo_settings enable row level security;

create or replace function public.is_workspace_editor(workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_members.workspace_id = is_workspace_editor.workspace_id
      and workspace_members.user_id = auth.uid()
      and workspace_members.role in ('owner', 'admin', 'editor')
  );
$$;

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "workspaces_user_insert" on public.workspaces;
create policy "workspaces_user_insert"
on public.workspaces
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "workspaces_editor_update" on public.workspaces;
create policy "workspaces_editor_update"
on public.workspaces
for update
to authenticated
using (public.is_super_admin() or public.is_workspace_editor(id))
with check (public.is_super_admin() or public.is_workspace_editor(id));

drop policy if exists "workspace_members_self_insert" on public.workspace_members;
create policy "workspace_members_self_insert"
on public.workspace_members
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "sites_workspace_editor_insert" on public.sites;
create policy "sites_workspace_editor_insert"
on public.sites
for insert
to authenticated
with check (
  public.is_super_admin()
  or public.is_workspace_editor(workspace_id)
);

drop policy if exists "sites_workspace_editor_update" on public.sites;
create policy "sites_workspace_editor_update"
on public.sites
for update
to authenticated
using (
  public.is_super_admin()
  or public.is_workspace_editor(workspace_id)
)
with check (
  public.is_super_admin()
  or public.is_workspace_editor(workspace_id)
);

drop policy if exists "site_pages_workspace_editor_insert" on public.site_pages;
create policy "site_pages_workspace_editor_insert"
on public.site_pages
for insert
to authenticated
with check (
  public.is_super_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = site_pages.site_id
      and public.is_workspace_editor(sites.workspace_id)
  )
);

drop policy if exists "site_pages_workspace_editor_update" on public.site_pages;
create policy "site_pages_workspace_editor_update"
on public.site_pages
for update
to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = site_pages.site_id
      and public.is_workspace_editor(sites.workspace_id)
  )
)
with check (
  public.is_super_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = site_pages.site_id
      and public.is_workspace_editor(sites.workspace_id)
  )
);

drop policy if exists "site_seo_select_workspace_member" on public.site_seo_settings;
create policy "site_seo_select_workspace_member"
on public.site_seo_settings
for select
to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = site_seo_settings.site_id
      and public.is_workspace_member(sites.workspace_id)
  )
);

drop policy if exists "site_seo_editor_all" on public.site_seo_settings;
create policy "site_seo_editor_all"
on public.site_seo_settings
for all
to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = site_seo_settings.site_id
      and public.is_workspace_editor(sites.workspace_id)
  )
)
with check (
  public.is_super_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = site_seo_settings.site_id
      and public.is_workspace_editor(sites.workspace_id)
  )
);
