-- Publishing support and public SEO reads.

alter table public.sites
add column if not exists published_at timestamptz;

drop policy if exists "sites_public_published_select" on public.sites;
create policy "sites_public_published_select"
on public.sites
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "site_pages_public_published_select" on public.site_pages;
create policy "site_pages_public_published_select"
on public.site_pages
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.sites
    where sites.id = site_pages.site_id
      and sites.status = 'published'
  )
);

drop policy if exists "site_seo_public_published_select" on public.site_seo_settings;
create policy "site_seo_public_published_select"
on public.site_seo_settings
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.sites
    where sites.id = site_seo_settings.site_id
      and sites.status = 'published'
  )
);
