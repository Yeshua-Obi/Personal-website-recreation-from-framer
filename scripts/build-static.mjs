import { spawnSync } from "node:child_process";
import { readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

for (const args of [["scripts/prepare-images.mjs"], ["node_modules/next/dist/bin/next", "build"]]) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit", env: {
    ...process.env, NEXT_PUBLIC_REVIEW_EXPORT: "0", NEXT_PUBLIC_STATIC_EXPORT: "1", NEXT_PUBLIC_BASE_PATH: "",
    PREVIEW_ORIGIN: process.env.CF_PAGES_URL || process.env.PREVIEW_ORIGIN || "",
  } });
  if (result.status !== 0) process.exit(result.status || 1);
}
for (const file of await readdir("out/media")) if (file.endsWith(".mp4")) await rm(path.join("out/media", file));
const images = JSON.parse(await readFile("src/content/images.json", "utf8"));
for (const source of Object.keys(images)) await rm(path.join("out", source), { force: true });
const projects = JSON.parse(await readFile("src/content/projects.json", "utf8")).filter(project => project.status === "published");
await writeFile("out/_redirects", projects.map(project => `/projects/${project.slug} /portfolio/${project.slug} 308`).join("\n") + "\n");
const indexing = Boolean(process.env.SITE_URL?.trim());
await writeFile("out/_headers", [
  "/*", "  X-Content-Type-Options: nosniff", "  Referrer-Policy: strict-origin-when-cross-origin", "  X-Frame-Options: DENY",
  ...(!indexing ? ["  X-Robots-Tag: noindex, nofollow"] : []),
  "/_next/static/*", "  Cache-Control: public, max-age=31536000, immutable",
  "/images/*", "  Cache-Control: public, max-age=31536000, immutable",
  "/previews/*", "  Cache-Control: public, max-age=31536000, immutable",
  "/social/*", "  Cache-Control: public, max-age=3600",
  "/opengraph-image", "  Content-Type: image/png", "",
].join("\n"));
console.log(`Cloudflare Pages export ready in out/. Indexing ${indexing ? "enabled for the configured SITE_URL" : "disabled until launch domain is configured"}.`);
