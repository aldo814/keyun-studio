-- Content boards and posts for site-connected bulletin boards.

create table if not exists public.content_boards (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, slug)
);

create table if not exists public.content_posts (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  board_id uuid references public.content_boards(id) on delete set null,
  board_name text not null default '공지사항',
  category text,
  title text not null,
  slug text not null,
  excerpt text,
  content_json jsonb not null default '{}'::jsonb,
  content_html text not null default '',
  thumbnail_url text,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'scheduled')),
  is_pinned boolean not null default false,
  views integer not null default 0,
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, slug)
);

create index if not exists content_boards_site_id_idx
on public.content_boards(site_id);

create index if not exists content_posts_site_id_idx
on public.content_posts(site_id);

create index if not exists content_posts_status_idx
on public.content_posts(status);

create index if not exists content_posts_board_id_idx
on public.content_posts(board_id);

create index if not exists content_posts_pinned_updated_idx
on public.content_posts(is_pinned desc, updated_at desc);

alter table public.content_boards enable row level security;
alter table public.content_posts enable row level security;

drop policy if exists "content_boards_select_workspace_member" on public.content_boards;
create policy "content_boards_select_workspace_member"
on public.content_boards
for select
to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = content_boards.site_id
      and public.is_workspace_member(sites.workspace_id)
  )
);

drop policy if exists "content_boards_editor_all" on public.content_boards;
create policy "content_boards_editor_all"
on public.content_boards
for all
to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = content_boards.site_id
      and public.is_workspace_editor(sites.workspace_id)
  )
)
with check (
  public.is_super_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = content_boards.site_id
      and public.is_workspace_editor(sites.workspace_id)
  )
);

drop policy if exists "content_posts_select_workspace_member" on public.content_posts;
create policy "content_posts_select_workspace_member"
on public.content_posts
for select
to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = content_posts.site_id
      and public.is_workspace_member(sites.workspace_id)
  )
);

drop policy if exists "content_posts_public_published_select" on public.content_posts;
create policy "content_posts_public_published_select"
on public.content_posts
for select
to anon, authenticated
using (
  status = 'published'
  and exists (
    select 1
    from public.sites
    where sites.id = content_posts.site_id
      and sites.status = 'published'
  )
);

drop policy if exists "content_posts_editor_all" on public.content_posts;
create policy "content_posts_editor_all"
on public.content_posts
for all
to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = content_posts.site_id
      and public.is_workspace_editor(sites.workspace_id)
  )
)
with check (
  public.is_super_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = content_posts.site_id
      and public.is_workspace_editor(sites.workspace_id)
  )
);
