# Keyun Studio MVP Launch Plan

## Goal

Design mode remains closed for general users. The MVP launch focuses on the customer/admin operation flow:

1. Sign up and log in.
2. Create the first site.
3. Auto-generate Home, Service, and selected starter pages.
4. Manage site settings and SEO.
5. Create posts and boards.
6. Receive and manage contact submissions.
7. Upload and manage media.
8. Create operation popups.
9. Publish the site and verify the public pages.

## Must Run In Supabase

- [ ] `supabase/migrations/0009_content_posts.sql`
- [ ] `supabase/migrations/0010_contact_submissions.sql`
- [ ] `supabase/migrations/0011_content_popups.sql`
- [ ] Confirm `site-assets` storage bucket exists and is public-readable.
- [ ] Confirm RLS policies allow workspace members/editors to access only their own site data.

## Must Verify Locally

- [ ] `npm run lint`
- [ ] `npx tsc --noEmit`
- [ ] `npm run build`
- [ ] Create a new user account.
- [ ] Create a first site from `/dashboard/sites/new`.
- [ ] Confirm redirect to `/dashboard/sites/{siteId}` with success feedback.
- [ ] Confirm Home and Service sitemap pages are created.
- [ ] If Portfolio or Location were selected, confirm `/portfolio` and `/location` sitemap pages are created.
- [ ] Update site name, slug, and SEO settings.
- [ ] Create and publish one post.
- [ ] Confirm the post appears at `/s/{siteSlug}/posts`.
- [ ] Submit a public contact form.
- [ ] Confirm submission appears in `/dashboard/content/forms`.
- [ ] Upload and delete one media file.
- [ ] Create an active popup and confirm it appears on the public site.
- [ ] Publish the site and open `/s/{siteSlug}`.

## Must Verify On Vercel

- [ ] Production environment variables are set.
- [ ] Supabase URL and anon key are production values.
- [ ] Optional contact notification env vars are set if email alerts are required:
  - `RESEND_API_KEY`
  - `CONTACT_NOTIFICATION_EMAIL`
  - `CONTACT_NOTIFICATION_FROM`
- [ ] Auth callback URL includes the production domain.
- [ ] Build succeeds on Vercel.
- [ ] `/login` works on production.
- [ ] `/dashboard` requires auth.
- [ ] `/dashboard/design` is hidden from normal users.
- [ ] Public site route `/s/{siteSlug}` works without login.
- [ ] Public posts route `/s/{siteSlug}/posts` works without login.
- [ ] Contact form submission works on a published production site.
- [ ] If notification env vars are configured, a contact-form email alert arrives after submission.

## Known Deferred Items

- General-user design editor access.
- Advanced layout editing and section library polish.
- Custom domain connection UI.
- Billing and subscription enforcement.
- Site-specific contact notification recipients.
- Rich media insertion inside posts.
- Full audit log/admin logs automation.

## Current Risk Notes

- Dashboard content features depend on Supabase migrations being applied in the target project.
- Media upload depends on the `site-assets` bucket configuration.
- Contact email alerts are optional. Missing or failed Resend configuration should not block contact submission storage.
- React Compiler currently warns on React Hook Form `watch()` and TanStack Table `useReactTable()`. These are warnings, not build blockers.
- Demo routes intentionally show fallback data and should not be treated as persistent production data.
