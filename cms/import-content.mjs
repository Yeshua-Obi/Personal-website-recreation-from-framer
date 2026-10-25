import { readFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assetKey, projectDocument, publishedRecords, siteDocument, sourceKey } from "./migration.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const json = async name => JSON.parse(await readFile(path.join(root, "src/content", `${name}.json`), "utf8"));
const [records, site, originals, previews] = await Promise.all([json("projects"), json("site"), json("assets"), json("previews")]);
const projects = publishedRecords(records);
const assets = new Map();

function planAsset(source, kind, preview = false) {
  if (!source) return;
  const key = assetKey(source, preview);
  if (assets.has(key)) return;
  const normalized = sourceKey(source);
  const entry = (preview ? previews : originals)[normalized];
  if (!entry) throw new Error(`Missing ${preview ? "preview" : "original"} manifest entry for ${normalized}`);
  const file = path.resolve(root, "public", entry.path.replace(/^\//, ""));
  if (!file.startsWith(path.join(root, "public") + path.sep)) throw new Error("Media path leaves public/.");
  if (preview && entry.sourceSha256 !== originals[normalized]?.sha256) throw new Error(`Preview source mismatch: ${normalized}`);
  assets.set(key, { key, source: normalized, file, kind, checksum: entry.sha256 });
}

for (const project of projects) {
  planAsset(project.image, "image");
  for (const item of project.gallery || []) planAsset(item.src, "image");
  planAsset(project.video, "file", true);
  planAsset(project.film, "file");
}
planAsset(site.portrait, "image");
planAsset(site.mark, "image");

// Verify retained originals and derived clips before any external write.
let bytes = 0;
for (const asset of assets.values()) {
  let contents;
  try { contents = await readFile(asset.file); }
  catch { throw new Error(`Missing source file ${path.relative(root, asset.file)}. Run npm run import:assets in the repository root before migration.`); }
  if (createHash("sha256").update(contents).digest("hex") !== asset.checksum) throw new Error(`Checksum mismatch: ${path.relative(root, asset.file)}`);
  bytes += contents.length;
}

const documents = projects.map(projectDocument).concat(siteDocument(site));
console.log(`Migration checked: ${projects.length} published projects, 1 profile, ${assets.size} media assets (${Math.round(bytes / 1024 / 1024)} MiB).`);
console.log(`Homepage selection: ${projects.filter(project => project.showOnHome !== false).length} projects.`);

if (!process.argv.includes("--apply")) {
  console.log("Dry run only. No provider writes were made.");
  process.exit(0);
}

if (!process.env.SANITY_AUTH_TOKEN) throw new Error("Add the dedicated project's SANITY_AUTH_TOKEN in secure environment settings before importing.");
const { createClient } = await import("@sanity/client");
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || "dntp46vk",
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  apiVersion: "2025-02-19", useCdn: false, token: process.env.SANITY_AUTH_TOKEN,
});
const ids = documents.flatMap(document => [document._id, `drafts.${document._id}`]);
const existing = new Set(await client.fetch("*[_id in $ids]._id", { ids }, { perspective: "raw" }));
const pending = documents.filter(document => !existing.has(document._id) && !existing.has(`drafts.${document._id}`));
if (!pending.length) {
  console.log("All imported documents already exist. Existing content and drafts were preserved.");
  process.exit(0);
}

const needed = new Set();
for (const document of pending) {
  if (document._type === "siteSettings") {
    needed.add(assetKey(site.portrait)); needed.add(assetKey(site.mark));
  } else {
    const source = projects.find(project => `project.${project.slug}` === document._id);
    if (source.image) needed.add(assetKey(source.image));
    for (const item of source.gallery || []) needed.add(assetKey(item.src));
    if (source.video) needed.add(assetKey(source.video, true));
    if (source.film) needed.add(assetKey(source.film));
  }
}
const uploaded = new Map();
let count = 0;
for (const key of needed) {
  const asset = assets.get(key);
  const result = await client.assets.upload(asset.kind, createReadStream(asset.file), { filename: path.basename(asset.file) });
  uploaded.set(key, { _type: "reference", _ref: result._id });
  console.log(`Media uploaded ${++count}/${needed.size}`);
}
const image = (source, alt, key) => ({ _type: "image", ...(key ? { _key: key } : {}), alt, asset: uploaded.get(assetKey(source)) });
const file = (source, preview = false) => ({ _type: "file", asset: uploaded.get(assetKey(source, preview)) });
// Preserve edits/drafts created while media uploads were in progress too.
const current = new Set(await client.fetch("*[_id in $ids]._id", { ids }, { perspective: "raw" }));
const writable = pending.filter(document => !current.has(document._id) && !current.has(`drafts.${document._id}`));
let transaction = client.transaction();
for (const document of writable) {
  if (document._type === "siteSettings") {
    document.portrait = image(site.portrait, `${site.displayName}, ${site.role}`);
    document.mark = image(site.mark, `${site.displayName} logo`);
  } else {
    const source = projects.find(project => `project.${project.slug}` === document._id);
    if (source.image) document.image = image(source.image, `${source.title} — project overview`);
    document.gallery = (source.gallery || []).map((item, index) => image(item.src, item.alt || `${source.title} — image ${index + 1}`, `image-${index}`));
    if (source.video) document.video = file(source.video, true);
    if (source.film) document.film = file(source.film);
  }
  transaction = transaction.createIfNotExists(document);
}
if (writable.length) await transaction.commit();
console.log(`Imported ${writable.length} documents. Existing documents and drafts were not overwritten.`);
