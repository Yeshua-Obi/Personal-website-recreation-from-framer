import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";

const origin = process.env.SITE_URL?.replace(/\/$/, "");
if (!origin?.startsWith("https://")) throw new Error("Set SITE_URL to the intended production origin for this launch audit.");
const records = JSON.parse(await readFile("src/content/projects.json", "utf8"));
const categories = (await readdir("out/portfolio/category")).filter(name => name.endsWith(".html")).map(name => `/portfolio/category/${name.slice(0, -5)}`);
const routes = ["/", "/about", "/portfolio", "/manual", "/contact", ...categories, ...records.filter(project => project.status === "published").map(project => `/portfolio/${project.slug}`)];
const titles = new Set(), descriptions = new Set(), report = [];
for (const route of routes) {
  const filename = route === "/" ? "out/index.html" : `out${route}.html`;
  const html = await readFile(filename, "utf8");
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert.ok(title && !titles.has(title), `Missing/duplicate title: ${route}`);
  assert.ok(description && !descriptions.has(description), `Missing/duplicate description: ${route}`);
  titles.add(title); descriptions.add(description);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `Heading structure: ${route}`);
  assert.ok(html.includes(`<link rel="canonical" href="${origin}${route === "/" ? "" : route}"`), `Canonical: ${route}`);
  assert.ok(!/<meta name="robots" content="[^"]*noindex/.test(html), `Accidental noindex: ${route}`);
  assert.ok(!html.includes("http://localhost"), `Localhost URL: ${route}`);
  assert.ok(html.includes(`${origin}/social/portfolio-card.png`), `Share image: ${route}`);
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  for (const match of html.matchAll(/(?:src|href|poster)="(\/(?:images|media|social|_next)\/[^"?]+)[^"]*"/g)) {
    assert.ok(await stat(path.join("out", match[1])).catch(() => null), `Missing asset ${match[1]} on ${route}`);
  }
  report.push({ route, title, titleLength: title.replace(/&amp;/g, "&").length, htmlBytes: Buffer.byteLength(html) });
}
const robots = await readFile("out/robots.txt", "utf8");
assert.ok(robots.includes("Allow: /") && robots.includes(`${origin}/sitemap.xml`));
const sitemap = await readFile("out/sitemap.xml", "utf8");
assert.equal((sitemap.match(/<loc>/g) || []).length, routes.length);
for (const route of routes) assert.ok(sitemap.includes(`<loc>${origin}${route === "/" ? "" : route}</loc>`));
assert.ok(!(await readFile("out/_headers", "utf8")).includes("noindex"));
await writeFile("/tmp/portfolio-seo-audit.json", `${JSON.stringify({ origin, pages: routes.length, report }, null, 2)}\n`);
console.log(`SEO launch audit passed for ${routes.length} pages: unique metadata, canonicals, headings, JSON-LD, local assets, share images, sitemap and crawl permissions.`);
