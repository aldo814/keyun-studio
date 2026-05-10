-- Keyun Studio RLS policies
-- Run this in Supabase SQL Editor after the initial table schema.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', ''),
    'user'
  )
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(nullif(public.profiles.name, ''), excluded.name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_workspace_member(workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_members.workspace_id = is_workspace_member.workspace_id
      and workspace_members.user_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.template_categories enable row level security;
alter table public.templates enable row level security;
alter table public.sites enable row level security;
alter table public.site_pages enable row level security;
alter table public.admin_notes enable row level security;
alter table public.admin_logs enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_super_admin());

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_super_admin())
with check (id = auth.uid() or public.is_super_admin());

drop policy if exists "workspaces_select_member_or_admin" on public.workspaces;
create policy "workspaces_select_member_or_admin"
on public.workspaces
for select
to authenticated
using (
  public.is_super_admin()
  or public.is_workspace_member(workspaces.id)
);

drop policy if exists "workspaces_admin_all" on public.workspaces;
create policy "workspaces_admin_all"
on public.workspaces
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "workspace_members_select_member_or_admin" on public.workspace_members;
create policy "workspace_members_select_member_or_admin"
on public.workspace_members
for select
to authenticated
using (
  public.is_super_admin()
  or user_id = auth.uid()
  or public.is_workspace_member(workspace_members.workspace_id)
);

drop policy if exists "workspace_members_admin_all" on public.workspace_members;
create policy "workspace_members_admin_all"
on public.workspace_members
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "template_categories_public_select" on public.template_categories;
create policy "template_categories_public_select"
on public.template_categories
for select
to authenticated
using (true);

drop policy if exists "template_categories_admin_all" on public.template_categories;
create policy "template_categories_admin_all"
on public.template_categories
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "templates_select_public_or_admin" on public.templates;
create policy "templates_select_public_or_admin"
on public.templates
for select
to authenticated
using (
  public.is_super_admin()
  or (visibility = 'public' and status in ('active', 'featured'))
);

drop policy if exists "templates_admin_all" on public.templates;
create policy "templates_admin_all"
on public.templates
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "sites_select_workspace_member_or_admin" on public.sites;
create policy "sites_select_workspace_member_or_admin"
on public.sites
for select
to authenticated
using (
  public.is_super_admin()
  or public.is_workspace_member(sites.workspace_id)
);

drop policy if exists "sites_admin_all" on public.sites;
create policy "sites_admin_all"
on public.sites
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "site_pages_select_workspace_member_or_admin" on public.site_pages;
create policy "site_pages_select_workspace_member_or_admin"
on public.site_pages
for select
to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = site_pages.site_id
      and public.is_workspace_member(sites.workspace_id)
  )
);

drop policy if exists "site_pages_admin_all" on public.site_pages;
create policy "site_pages_admin_all"
on public.site_pages
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "admin_notes_admin_all" on public.admin_notes;
create policy "admin_notes_admin_all"
on public.admin_notes
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "admin_logs_admin_select_insert" on public.admin_logs;
create policy "admin_logs_admin_select_insert"
on public.admin_logs
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());
