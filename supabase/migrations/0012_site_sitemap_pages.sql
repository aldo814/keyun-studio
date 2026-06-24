-- Sitemap/page management fields for customer dashboards.
-- Keeps existing site_pages content while adding menu hierarchy metadata.

alter table public.site_pages
add column if not exists parent_id uuid references public.site_pages(id) on delete cascade,
add column if not exists menu_code text,
add column if not exists menu_name text,
add column if not exists page_type text not null default 'auto',
add column if not exists sub_layout text,
add column if not exists is_hidden boolean not null default false,
add column if not exists sort_order integer not null default 0,
add column if not exists locale_json jsonb not null default '{}'::jsonb;

update public.site_pages
set
  menu_code = coalesce(menu_code, nullif(trim(both '/' from path), ''), 'home'),
  menu_name = coalesce(menu_name, title),
  sort_order = coalesce(sort_order, 0)
where menu_code is null
   or menu_name is null;

create index if not exists site_pages_site_parent_sort_idx
on public.site_pages(site_id, parent_id, sort_order);

create index if not exists site_pages_site_menu_code_idx
on public.site_pages(site_id, menu_code);
