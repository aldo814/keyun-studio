-- Storage policies for template thumbnails and template image assets.
-- Bucket name: template-assets

insert into storage.buckets (id, name, public)
values ('template-assets', 'template-assets', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "template_assets_public_read" on storage.objects;
create policy "template_assets_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'template-assets');

drop policy if exists "template_assets_admin_insert" on storage.objects;
create policy "template_assets_admin_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'template-assets'
  and public.is_super_admin()
);

drop policy if exists "template_assets_admin_update" on storage.objects;
create policy "template_assets_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'template-assets'
  and public.is_super_admin()
)
with check (
  bucket_id = 'template-assets'
  and public.is_super_admin()
);

drop policy if exists "template_assets_admin_delete" on storage.objects;
create policy "template_assets_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'template-assets'
  and public.is_super_admin()
);
