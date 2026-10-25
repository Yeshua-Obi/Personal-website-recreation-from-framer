# Portfolio content editor

This standalone Sanity Studio manages projects, biographies, contact details and social links. It is separate from the public portfolio bundle.

The owner's dedicated project is `dntp46vk`, with a verified public `production` dataset. Studio and website-reader builds pass. Media/documents have not yet been imported; token authorization, editor origin access and end-to-end activation remain outstanding.

From this folder, run `npm ci`. The actual project and dataset are defaults in `environment.ts`; `.env.example` documents public overrides. Keep authentication tokens out of files and public source. The one-time import uses the project-scoped `SANITY_AUTH_TOKEN` supplied through secure environment settings, rather than borrowing a browser/CLI session.

```sh
npm run typecheck
npm test
npm run import:check
npm run dev
```

The migration checks all original-media checksums before writing. It imports only the complete published cases from the portfolio's existing records, preserves slugs, order, credits and homepage visibility, and uploads original images, full films and lightweight gallery previews to owned Sanity storage. It never overwrites an existing imported document or draft. Missing full films require `npm run import:assets` from the repository root first.

After binding the dedicated project's token, run `npm run import:content`. This creates public published content and uploads media; a dry run never writes to Sanity. The current source contains eleven published projects and one global profile. The importer rechecks existing documents/drafts after uploading assets and never replaces them.

The reserved editor host is the personal-account Cloudflare Pages project `yeshua-obi-studio`. Before publishing it, allow the exact origin `https://yeshua-obi-studio.pages.dev` with credentials in this Sanity project's CORS settings. Then build and deploy with the owner's personal Cloudflare authentication:

```sh
npm run build
CLOUDFLARE_ACCOUNT_ID=4cc9c7cf9ced4d7ddfbd94fb29a84342 npx wrangler pages deploy dist --project-name yeshua-obi-studio --branch main
```

The editor is excluded from indexing and uses Sanity's own user authentication for editing. A project write token is never part of its public bundle.

Only after the imported content is verified, set `SANITY_PROJECT_ID=dntp46vk` and `SANITY_DATASET=production` for the public portfolio build. It reads a published snapshot without credentials; configured API errors/incomplete global content fail the build rather than silently reverting to stale content. Drafts stay out of cards, routes, structured data and sitemap, and `showOnHome` controls the homepage independently. Without those activation variables, the reviewed local content remains available for development and review builds.

Public website reads and deploy-on-publish must be connected and verified before editor changes are described as live. The temporary Cloudflare project uses direct uploads; automatic builds require resolving Git integration or configuring an authenticated CI deployment. Existing GitHub app access must be preserved during troubleshooting.
