import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";

const assets = JSON.parse(await readFile("src/content/assets.json", "utf8"));
const previous = JSON.parse(await readFile("src/content/images.json", "utf8").catch(() => "{}"));
const manifest = {};
await mkdir("public/images", { recursive: true });
const images = Object.values(assets).filter(asset => /\.(png|jpe?g|webp)$/i.test(asset.path));
let completed = 0;
async function prepare(asset) {
  const cached = previous[asset.path];
  if (cached?.sourceSha256 === asset.sha256 && cached.version === 1
    && (await Promise.all(cached.variants.map(variant => stat(`public${variant.path}`).catch(() => null)))).every(Boolean)) {
    manifest[asset.path] = cached;
    return;
  }
  const original = await readFile(`public${asset.path}`);
  if (createHash("sha256").update(original).digest("hex") !== asset.sha256) throw new Error(`Original changed: ${asset.path}`);
  const { width, height } = await sharp(original).metadata();
  const widths = [...new Set([96, 192, 480, 960, 1600, 2048].map(target => Math.min(target, width)))];
  const variants = [];
  for (const size of widths) {
    const bytes = await sharp(original).rotate().resize({ width: size, withoutEnlargement: true }).webp({ quality: 84, effort: 4 }).toBuffer();
    const hash = createHash("sha256").update(bytes).digest("hex");
    const path = `/images/${hash.slice(0, 20)}-${size}.webp`;
    await writeFile(`public${path}`, bytes);
    variants.push({ width: size, path, bytes: bytes.length });
  }
  manifest[asset.path] = { width, height, sourceSha256: asset.sha256, version: 1, variants };
  if (++completed % 10 === 0) console.log(`Prepared ${completed}/${images.length} original images`);
}
// Bound CPU/memory usage; keep originals and their import checksums untouched.
let next = 0;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (next < images.length) await prepare(images[next++]);
}));
await writeFile("src/content/images.json", `${JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2)}\n`);

const site = JSON.parse(await readFile("src/content/site.json", "utf8"));
const logoUrl = new URL(site.mark); logoUrl.search = "";
const mark = await sharp(`public${assets[logoUrl.href].path}`).trim().toBuffer();
async function icon(size) {
  const logo = await sharp(mark).resize({ width: Math.round(size * .68), height: Math.round(size * .84), fit: "inside" }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: "#fefcf6" } }).composite([{ input: logo, gravity: "centre" }]).png().toBuffer();
}
await writeFile("src/app/icon.png", await icon(96));
await writeFile("src/app/apple-icon.png", await icon(180));
const png = await icon(48);
const ico = Buffer.alloc(22);
ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4);
ico[6] = 48; ico[7] = 48; ico.writeUInt16LE(1, 10); ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(png.length, 14); ico.writeUInt32LE(22, 18);
await writeFile("src/app/favicon.ico", Buffer.concat([ico, png]));
console.log(`${images.length} image sets ready; actual crown/JO mark prepared as favicon and Apple icon.`);
