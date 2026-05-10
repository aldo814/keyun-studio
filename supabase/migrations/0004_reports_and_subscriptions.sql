-- Reports/reviews and billing subscriptions for Keyun Studio operations.

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete set null,
  reporter_id uuid references public.profiles(id) on delete set null,
  target_label text not null,
  reason text not null,
  description text,
  severity text not null default 'medium',
  status text not null default 'open',
  resolution text,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete set null,
  customer_label text not null,
  plan text not null default 'free',
  amount_krw integer not null default 0,
  status text not null default 'active',
  provider text not null default 'stripe',
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_site_id_idx on public.reports(site_id);
create index if not exists reports_status_idx on public.reports(status);
create index if not exists reports_created_at_idx on public.reports(created_at desc);
create index if not exists subscriptions_workspace_id_idx on public.subscriptions(workspace_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);

alter table public.reports enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "reports_admin_all" on public.reports;
create policy "reports_admin_all"
on public.reports
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "reports_workspace_member_select" on public.reports;
create policy "reports_workspace_member_select"
on public.reports
for select
to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1
    from public.sites
    where sites.id = reports.site_id
      and public.is_workspace_member(sites.workspace_id)
  )
);

drop policy if exists "subscriptions_admin_all" on public.subscriptions;
create policy "subscriptions_admin_all"
on public.subscriptions
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "subscriptions_workspace_member_select" on public.subscriptions;
create policy "subscriptions_workspace_member_select"
on public.subscriptions
for select
to authenticated
using (
  public.is_super_admin()
  or (
    workspace_id is not null
    and public.is_workspace_member(workspace_id)
  )
);
