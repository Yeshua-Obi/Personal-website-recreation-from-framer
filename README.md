# Yeshua Obi — personal portfolio

A Next.js portfolio for Yeshua Obi, Brand & Systems Designer / The Creative Nomad. It contains Home, Work, About, Manual, Contact, eleven published case studies and four project-category collections.

## Development

Use Node 24 and npm.

```sh
npm ci
npm run dev
```

`npm run prepare:images` prepares responsive WebP variants and the logo icons. Builds run it automatically and reuse the cached files. Source photographs and native preview clips are included. Large original film files can be imported for local server development with `npm run import:assets`; they are excluded from Git. Static builds use their existing public source URLs until the CMS media migration is complete.

## Checks

```sh
npm test
npm run typecheck
npm run test:e2e -- --workers=1
```

For a production-domain SEO check:

```sh
SITE_URL=https://your-real-domain.com npm run build:static
SITE_URL=https://your-real-domain.com npm run check:seo
```

## Cloudflare Pages

The selected final domain is `yeshuaobi.com`. Keep indexing disabled until the domain is registered, connected and verified.

The temporary direct-upload project is `yeshua-obi-portfolio`, at `https://yeshua-obi-portfolio.pages.dev`, in the portfolio owner's personal Cloudflare account. `wrangler.json` selects that project; the supported `CLOUDFLARE_ACCOUNT_ID` deployment setting selects its owner. Authentication must belong to that personal account:

```sh
CF_PAGES_URL=https://yeshua-obi-portfolio.pages.dev npm run build:static
CLOUDFLARE_ACCOUNT_ID=4cc9c7cf9ced4d7ddfbd94fb29a84342 npx wrangler pages deploy out --project-name yeshua-obi-portfolio --branch main
```

The earlier `yeshua-obi-portfolio-preview.pages.dev` address forwards to this personal-account deployment, preserving paths and query strings. That older project serves redirects only.

Cloudflare's Git integration returned installation error 8000011 during setup. Automatic GitHub deployments are not configured. Direct-upload projects cannot convert to Git integration; resolve that connection and create a separate Git-integrated production project before configuring automatic CMS-triggered builds.

For the future Git-integrated project, connect this repository's `main` branch in Cloudflare Pages:

- Framework preset: None (the app exports a static site).
- Root directory: repository root.
- Build command: `npm run build:static`.
- Output directory: `out`.
- Node version: 24.
- Leave `SITE_URL` empty for the temporary address and preview deployments. This keeps them excluded from indexing. Cloudflare supplies `CF_PAGES_URL` for share-image URLs.
- Set `SITE_URL` to the final HTTPS origin once the selected domain is purchased, connected and ready for indexing. `GOOGLE_SITE_VERIFICATION` can hold the owner's real Search Console verification value.

The export generates clean URLs, caching/security headers, legacy project redirects and crawler rules. The large film originals remain on their existing public asset host until migration to owned CMS storage; complete that migration before retiring the Framer site.

`wrangler.json` provides the temporary Pages project name and output directory for direct CLI deployments. Cloudflare authentication is required.

## Content

Project records are in `src/content/projects.json`; site identity and biography are in `src/content/site.json`. Publication and homepage visibility use shared selectors. The homepage count derives from the same records as the grid, with three columns on desktop. V320 is published in Work and excluded from Home. Category membership is explicit.

The CMS connection follows hosting. Preserve project slugs, credits, disclosures, categories, ordering and homepage visibility during import. Use real provider project/dataset IDs and keep write credentials in authenticated CLI/build environments.

The standalone editor and repeatable migration are in [cms/](cms/README.md), configured for the owner's real Sanity project `dntp46vk` and its public `production` dataset. The public website can read published content at build time with `SANITY_PROJECT_ID` and `SANITY_DATASET`, without a token. Leave those variables unset until media/documents are imported and verified. Type checks, publication/reader tests and the checksum-verified migration dry run run without provider credentials. The remote import, editor CORS/deployment, real-data activation and automatic publishing remain to be verified.

## Review deployment

`npm run publish:review` publishes the separate GitHub Pages review from generated output to `gh-pages`. It preserves the source branch and working index. Review pages remain noindex. The production source is on `main`.

The site uses the owner's actual crown/JO mark, self-hosted Inter / IBM Plex Mono / Caveat and the established paper, ink, dusty-blue, lilac and teal palette. The existing design and public case-study content are retained. Private working notes stay in the ignored `docs/` folder.
