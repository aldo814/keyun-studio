-- Public site asset storage for builder section images.
-- Write access is restricted to each authenticated user's own folder:
-- users/{auth.uid()}/...

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "site_assets_public_read" on storage.objects;
create policy "site_assets_public_read"
on storage.objects
for select
to public
using (bucket_id = 'site-assets');

drop policy if exists "site_assets_user_upload_own_folder" on storage.objects;
create policy "site_assets_user_upload_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-assets'
  and (storage.foldername(name))[1] = 'users'
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists "site_assets_user_update_own_folder" on storage.objects;
create policy "site_assets_user_update_own_folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-assets'
  and (storage.foldername(name))[1] = 'users'
  and (storage.foldername(name))[2] = auth.uid()::text
)
with check (
  bucket_id = 'site-assets'
  and (storage.foldername(name))[1] = 'users'
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists "site_assets_user_delete_own_folder" on storage.objects;
create policy "site_assets_user_delete_own_folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-assets'
  and (storage.foldername(name))[1] = 'users'
  and (storage.foldername(name))[2] = auth.uid()::text
);
