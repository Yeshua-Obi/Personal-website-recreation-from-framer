import { spawnSync } from "node:child_process";
import { readFile, writeFile, readdir, rm, mkdir } from "node:fs/promises";
import path from "node:path";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const images = spawnSync(process.execPath, ["scripts/prepare-images.mjs"], { stdio: "inherit" });
if (images.status !== 0) process.exit(images.status || 1);
const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
  stdio: "inherit",
  env: { ...process.env, SITE_URL: "", PREVIEW_ORIGIN: "https://yeshua-obi.github.io", NEXT_PUBLIC_REVIEW_EXPORT: "1", NEXT_PUBLIC_BASE_PATH: basePath },
});
if (result.status !== 0) process.exit(result.status || 1);
// The complete films remain on their original CDN in a portable review;
// native gallery loops and all images are included locally.
for (const file of await readdir("out/media")) if (file.endsWith(".mp4")) await rm(path.join("out/media", file));
const imageSets = JSON.parse(await readFile("src/content/images.json", "utf8"));
for (const original of Object.keys(imageSets)) await rm(path.join("out", original), { force: true });
await writeFile("out/.nojekyll", "");
await writeFile("out/_headers", "/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n");
const projects = JSON.parse(await readFile("src/content/projects.json", "utf8")).filter(p => p.status === "published");
await writeFile("out/_redirects", projects.map(p => `/projects/${p.slug} /portfolio/${p.slug}/ 308`).join("\n") + "\n");
for (const project of projects) {
  const directory = path.join("out/projects", project.slug);
  await mkdir(directory, { recursive: true });
  const target = `${basePath}/portfolio/${project.slug}/`;
  await writeFile(path.join(directory, "index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=${target}"><title>Project moved</title></head><body><a href="${target}">Continue to project</a></body></html>`);
}
console.log(`Review built in out/: 5 main pages, ${projects.length} case studies, 4 category pages, responsive media, and noindex. Base path: ${basePath || "/"}`);
