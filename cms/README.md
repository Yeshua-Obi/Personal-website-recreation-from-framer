# Portfolio content editor

This standalone Sanity Studio manages projects, biographies, contact details and social links. It is separate from the public portfolio bundle.

The schemas and migration are prepared. A real Sanity project/dataset, owner authentication, schema deployment, media import and website data connection are still required. No placeholder project IDs are configured.

From this folder, run `npm ci`, then set `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET` in `.env.local` using the actual project values. These are public identifiers; keep authentication tokens out of these files and public source. Use the owner's authenticated CLI session.

```sh
npm run typecheck
npm test
npm run import:check
npm run dev
```

The migration checks all original-media checksums before writing. It imports only the complete published cases from the portfolio's existing records, preserves slugs, order, credits and homepage visibility, and uploads original images, full films and lightweight gallery previews to owned Sanity storage. It never overwrites an existing imported document or draft. Missing full films require `npm run import:assets` from the repository root first.

After authenticating to the intended project/dataset, run `npm run import:content`. This creates public published content and uploads media; a dry run never writes to Sanity. The current source contains eleven published projects and one global profile.

Public website reads and deploy-on-publish must be connected and verified before editor changes are described as live. The temporary Cloudflare project uses direct uploads; automatic builds require resolving Git integration or configuring an authenticated CI deployment. Existing GitHub app access must be preserved during troubleshooting.
