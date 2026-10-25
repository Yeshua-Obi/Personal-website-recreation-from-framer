import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile, mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const exec = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "src/content/assets.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const documents = await Promise.all(["projects", "site"].map(async name => JSON.parse(await readFile(path.join(root, `src/content/${name}.json`), "utf8"))));
const sources = new Set();
function collect(value) {
  // V2 typography is self-hosted through Fontsource. Legacy Framer font
  // references remain as source documentation, not runtime dependencies.
  if (value && typeof value === "object" && "family" in value) return;
  if (typeof value === "string" && /^https:\/\/(framerusercontent\.com|fonts\.gstatic\.com)\//.test(value)) {
    const url = new URL(value);
    if (/\.(png|jpg|jpeg|webp|avif|gif|mp4|woff2)$/.test(url.pathname)) { url.search = ""; sources.add(url.href); }
  } else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === "object") Object.values(value).forEach(collect);
}
documents.forEach(collect);
await mkdir(path.join(root, "public/media"), { recursive: true });
const failedHosts = new Set();
const errors = [];
let imported = 0, cached = 0;
const sha = data => createHash("sha256").update(data).digest("hex");
const queue = [...sources];

async function worker() {
  while (queue.length) {
    const source = queue.shift();
    const url = new URL(source);
    if (failedHosts.has(url.hostname)) continue;
    const known = manifest[source];
    if (known) {
      const existing = await readFile(path.join(root, "public", known.path)).catch(() => null);
      if (existing) {
        if (sha(existing) !== known.sha256) throw new Error(`Local asset changed: ${known.path}. Preserve that change before reimporting.`);
        cached++;
        continue;
      }
    }
    const extension = path.extname(url.pathname);
    const relative = `/media/${sha(source).slice(0, 20)}${extension}`;
    const target = path.join(root, "public", relative);
    const temporary = `${target}.download`;
    // Framer's supported resize parameter avoids importing full camera-resolution images.
    const request = new URL(source);
    if (url.pathname.startsWith("/images/") && extension !== ".gif") request.searchParams.set("scale-down-to", "2048");
    try {
      await exec("curl", ["--fail", "--silent", "--show-error", "--location", "--proto", "=https", "--proto-redir", "=https", "--connect-timeout", "15", "--max-time", "120", "--max-filesize", "104857600", "--output", temporary, request.href], { maxBuffer: 4096 });
      const bytes = await readFile(temporary);
      if (bytes.length < 20 || bytes.subarray(0, 80).toString().match(/<!doctype html|<html/i)) throw new Error("The response is not a media asset");
      if (extension === ".woff2" && bytes.subarray(0, 4).toString() !== "wOF2") throw new Error("Invalid WOFF2 font");
      if (extension === ".mp4" && bytes.subarray(4, 8).toString() !== "ftyp") throw new Error("Invalid MP4 video");
      await rename(temporary, target);
      manifest[source] = { path: relative, sha256: sha(bytes) };
      imported++;
    } catch (error) {
      await rm(temporary, { force: true });
      const message = String(error.stderr || error.message).trim().slice(0, 200);
      errors.push(`${url.hostname}: ${message}`);
      // A policy denial affects the entire host; do not hammer it for every image.
      if (/403|CONNECT|resolve host/.test(message)) failedHosts.add(url.hostname);
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${imported} assets imported, ${cached} verified from cache; ${sources.size} unique source assets.`);
if (errors.length) {
  console.error([...new Set(errors)].slice(0, 5).join("\n"));
  console.error("Some assets could not be imported. The app retains their original public CDN URLs. Apply required domain access in environment settings, then rerun npm run import:assets.");
  process.exitCode = 1;
}
