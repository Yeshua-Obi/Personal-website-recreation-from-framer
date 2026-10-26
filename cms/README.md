# Portfolio content editor

This standalone Sanity Studio manages projects, biographies, contact details and social links. It is separate from the public portfolio bundle.

The owner's dedicated project is `dntp46vk`, with a verified public `production` dataset. Eleven projects, one profile and 101 media assets have been imported. The editor origin is registered and the Studio is deployed. Full films retain their working original URLs; direct Studio uploads can replace them.

From this folder, run `npm ci`. The actual project and dataset are defaults in `environment.ts`; `.env.example` documents public overrides. Keep authentication tokens out of files and public source. The one-time import uses the project-scoped `SANITY_AUTH_TOKEN` supplied through secure environment settings, rather than borrowing a browser/CLI session.

```sh
npm run typecheck
npm test
npm run import:check
npm run dev
```

The migration checks all original-media checksums before writing. It imports only the complete published cases from the portfolio's existing records, preserves slugs, order, credits and homepage visibility, and uploads original images and lightweight gallery previews to owned Sanity storage. Full-film URLs are retained because the setup proxy rejects large film uploads. It never overwrites an existing imported document or draft. Missing full films require `npm run import:assets` from the repository root first.

After binding the dedicated project's token, run `npm run import:content`. This creates public published content and uploads media; a dry run never writes to Sanity. The current source contains eleven published projects and one global profile. The importer rechecks existing documents/drafts after uploading assets and never replaces them.

The reserved editor host is the personal-account Cloudflare Pages project `yeshua-obi-studio`. Before publishing it, allow the exact origin `https://yeshua-obi-studio.pages.dev` with credentials in this Sanity project's CORS settings. Then build and deploy with the owner's personal Cloudflare authentication:

```sh
npm run build
CLOUDFLARE_ACCOUNT_ID=4cc9c7cf9ced4d7ddfbd94fb29a84342 npx wrangler pages deploy dist --project-name yeshua-obi-studio --branch main
```

The editor is excluded from indexing and uses Sanity's own user authentication for editing. A project write token is never part of its public bundle.

Only after the imported content is verified, set `SANITY_PROJECT_ID=dntp46vk` and `SANITY_DATASET=production` for the public portfolio build. It reads a published snapshot during the static build. If anonymous reads do not return content, supply SANITY_BUILD_TOKEN through the build environment only; never use a public-prefixed variable or ship credentials to browsers. configured API errors/incomplete global content fail the build rather than silently reverting to stale content. Drafts stay out of cards, routes, structured data and sitemap, and `showOnHome` controls the homepage independently. Without those activation variables, the reviewed local content remains available for development and review builds.

Public website reads and deploy-on-publish must be connected and verified before editor changes are described as live. The temporary Cloudflare project uses direct uploads; automatic builds require resolving Git integration or configuring an authenticated CI deployment. Existing GitHub app access must be preserved during troubleshooting.

## Editing and priority

Use **Project priority** to drag projects, or use the labelled up/down buttons, then **Save order**. The list shows consecutive positions, total/last/next positions, and draft visibility. Revision checks reject stale saves. Draft and published versions receive the same order without publishing draft content. New projects receive the next priority value automatically. Use **Projects** to edit cover, gallery, preview loop, full film, category membership and case-study text. The same ordered list feeds Work and each category. Use **Profile, images & contact** for the About portrait and logo.

The homepage hero uses the first five homepage-eligible published projects, with video or animated-image previews. The grid uses the first complete multiple of three, capped at nine. Lower-priority projects remain visible in Work; More work leads there.

Add a project brief and choose **Suggest missing details** from the document actions. This conservative text-only helper proposes missing summary, story and matching existing categories. Review the proposals before applying them to a draft. Assumed fields have a persistent badge and review list. Existing fields and dates/credits are preserved. Image/video analysis requires a separately configured AI provider; no paid AI service is enabled.

Saving/publishing content in Sanity does not trigger a new deployment yet. This Pages project uses direct uploads; publishing automation requires an authenticated CI or functioning Git-connected Pages project. Rebuild and deploy both website and Studio when their source configuration changes.
