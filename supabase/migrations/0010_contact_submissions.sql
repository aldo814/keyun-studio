-- Contact form submissions for published customer sites.

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  form_name text not null default '문의폼',
  name text not null,
  email text,
  phone text,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'done')),
  admin_note text,
  source_path text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_submissions_site_id_idx
on public.contact_submissions(site_id);

create index if not exists contact_submissions_status_idx
on public.contact_submissions(status);

create index if not exists contact_submissions_created_idx
on public.contact_submissions(created_at desc);

alter table public.contact_submissions enable row level security;

drop policy if exists "contact_submissions_public_insert" on public.contact_submissions;
create policy "contact_submissions_public_insert"
on public.contact_submissions
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.sites
    where sites.id = contact_submissions.site_id
      and sites.status = 'published'
  )
);

drop policy if exists "contact_submissions_select_workspace_member" on public.contact_submissions;
create policy "contact_submissions_select_workspace_member"
on public.contact_submissions
for select
to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = contact_submissions.site_id
      and public.is_workspace_member(sites.workspace_id)
  )
);

drop policy if exists "contact_submissions_editor_update" on public.contact_submissions;
create policy "contact_submissions_editor_update"
on public.contact_submissions
for update
to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = contact_submissions.site_id
      and public.is_workspace_editor(sites.workspace_id)
  )
)
with check (
  public.is_super_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = contact_submissions.site_id
      and public.is_workspace_editor(sites.workspace_id)
  )
);
