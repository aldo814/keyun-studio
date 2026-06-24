# Keyun Studio QA Checklist

## Site Settings And Publishing

- [ ] `/dashboard/sites/new` loads the first-site creation workflow.
- [ ] Opening `/dashboard/sites/new?templateId={templateId}` preselects the matching template.
- [ ] Creating a site redirects to the new site detail page and shows a success feedback message.
- [ ] New sites are created with a Home page draft JSON containing hero, features, and CTA sections.
- [ ] New sites are created with default Notice, Blog, and FAQ boards.
- [ ] New site detail page shows next-step cards for settings, first post, and publishing.
- [ ] `/dashboard/sites` lists sites available to the signed-in user.
- [ ] `/dashboard/sites/{siteId}` shows the current site status, updated time, and published time.
- [ ] Publishing a site asks for confirmation before submitting.
- [ ] Publishing a site redirects back to the site detail page and shows a success feedback message.
- [ ] Published sites are available at `/s/{siteSlug}`.
- [ ] `/dashboard/sites/{siteId}/settings` can update the site name and slug.
- [ ] Updating the site name or slug shows a success feedback message.
- [ ] Changing the slug updates the public path used by site links.
- [ ] `/dashboard/sites/{siteId}/settings` loads SEO settings for the selected site.
- [ ] Saving SEO settings redirects back to settings and shows a success feedback message.
- [ ] SEO title, description, OG image, favicon, and robots settings persist after refresh.

## Content Boards

- [ ] `/dashboard/content/boards` loads for authenticated dashboard users.
- [ ] Creating a board shows a success feedback message.
- [ ] Updating a board name or description shows a success feedback message.
- [ ] Moving a board up or down shows a success feedback message.
- [ ] Deleting a board asks for confirmation before submitting.
- [ ] Deleting a board shows a success feedback message.
- [ ] Board order is reflected in the post editor board selector.

## Content Posts

- [ ] `/dashboard/content/posts` loads for authenticated dashboard users.
- [ ] Creating a post redirects to the post detail page and shows a success feedback message.
- [ ] Updating a post redirects to the post detail page and shows a success feedback message.
- [ ] Deleting a post asks for confirmation before submitting.
- [ ] Deleting a post redirects to the post list and shows a success feedback message.
- [ ] Pinning and unpinning a post shows the correct feedback message.
- [ ] Published posts appear on the public site latest-posts section.
- [ ] Public post list and detail routes load at `/s/{siteSlug}/posts`.
- [ ] Published posts show a public-view action in the dashboard post list.
- [ ] Published post detail pages show a working public-view link.
- [ ] Draft and scheduled posts do not show a public-view link.

## Contact Forms

- [ ] Public contact submissions are saved only for real published sites in `sites`.
- [ ] `/s/keyun-demo` is treated as a non-persistent demo and must not show a successful DB save state.
- [ ] Empty contact admin state explains that DB-connected published sites are required for saved submissions.
- [ ] `contact_submissions` table exists in Supabase after running `supabase/migrations/0010_contact_submissions.sql`.
- [ ] A submission from `/s/{siteSlug}` appears in `/dashboard/content/forms`.
- [ ] Public contact form explains that either phone or email is required.
- [ ] Workspace members can see only submissions for their sites.
- [ ] Editors/admins can update contact status and internal notes.
- [ ] Saving a contact status shows a success feedback message.
- [ ] Deleting a contact submission asks for confirmation before submitting.
- [ ] Deleting a contact submission shows a success feedback message.
- [ ] Dashboard home shows a visible alert when there are new contact submissions.
- [ ] Contact forms page shows a new-inquiry guidance panel.
- [ ] CSV export includes status, site, form, name, email, phone, subject, message, created date, and admin note.

## Sitemap And Public Pages

- [ ] New sites include a protected Home sitemap page.
- [ ] `/dashboard/sites/{siteId}/sitemap` lists first, second, and third depth pages.
- [ ] Sitemap pages can be created with menu code, menu name, page type, layout, visibility, multilingual fields, and body content.
- [ ] Home page cannot be hidden, moved, or deleted.
- [ ] Sitemap rows can be moved up and down within the same parent menu.
- [ ] Sitemap order is reflected in `draft_json.navigation`.
- [ ] Sitemap page draft preview opens at `/dashboard/preview/{siteId}?pageId={pageId}`.
- [ ] Public subpages open at `/s/{siteSlug}/{pagePath}` after publishing.
- [ ] Public header links keep the `/s/{siteSlug}` prefix.
- [ ] Hidden sitemap pages do not appear in public navigation.

## Permission And Role QA

- [ ] Signed-out users visiting `/dashboard` are redirected to `/login?next=/dashboard`.
- [ ] Super admin can access `/admin`.
- [ ] Super admin can see design menu and design routes.
- [ ] Normal customer admin cannot see design menu.
- [ ] Normal customer admin cannot access `/dashboard/design`, `/dashboard/design/theme`, or `/dashboard/editor/{siteId}`.
- [ ] Customer users see only sites allowed by Supabase RLS/workspace membership.
- [ ] Customer users see only content posts, boards, media, popups, and contact submissions connected to their sites.
- [ ] Login redirect sends super admin to super-admin flow and normal users to customer dashboard flow.

## Public Page Launch QA

- [ ] Public home loads at `/s/{siteSlug}`.
- [ ] Public subpages load for each sitemap page.
- [ ] Public posts list loads at `/s/{siteSlug}/posts`.
- [ ] Public post detail loads at `/s/{siteSlug}/posts/{postSlug}`.
- [ ] Public contact form validates name, message, and at least one of phone/email.
- [ ] Contact success and failure messages appear after submission.
- [ ] Active popups appear on published sites.
- [ ] Inactive, expired, or future popups do not appear.
- [ ] SEO metadata renders title, description, OG image, favicon, and robots settings.
- [ ] Desktop and mobile layouts have no obvious broken text, horizontal scroll, or hidden primary actions.

## Media Library

- [ ] `/dashboard/content/media` loads for authenticated dashboard users.
- [ ] Image, video, SVG, GIF, and PDF files can be uploaded to the `site-assets` bucket.
- [ ] Upload guidance shows supported file types and the 15MB limit before upload.
- [ ] Files larger than 15MB are rejected by the server action.
- [ ] Unsupported file types are rejected by the server action.
- [ ] Uploaded media is stored under `users/{auth.uid()}/media`.
- [ ] Uploaded media appears in the media library after upload.
- [ ] Media search filters by file name, MIME type, and storage path.
- [ ] Type filters separate images, videos, and files correctly.
- [ ] Public URL copy works for uploaded assets.
- [ ] Public URL copy still works when the Clipboard API fallback path is used.
- [ ] Users can delete only files in their own `users/{auth.uid()}/media` folder.
- [ ] Upload and delete actions show success feedback messages.
- [ ] Media delete action asks for confirmation before submitting.

## Operation Popups

- [ ] Run `supabase/migrations/0011_content_popups.sql` in Supabase before testing real popup persistence.
- [ ] `/dashboard/content/popups` loads for authenticated dashboard users.
- [ ] A popup can be created and connected to a site.
- [ ] Popup status can be changed between active and inactive.
- [ ] Popup schedule respects start and end datetime values.
- [ ] Active popups appear only on published public sites.
- [ ] Inactive or expired popups do not appear on public sites.
- [ ] Popup close state is saved per site in browser localStorage.
- [ ] Workspace members can manage only popups connected to their sites.
- [ ] Popup create, update, and delete actions show success feedback messages.
- [ ] Popup delete action asks for confirmation before submitting.
