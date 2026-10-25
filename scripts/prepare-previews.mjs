import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const projects = JSON.parse(await readFile("src/content/projects.json", "utf8"));
const assets = JSON.parse(await readFile("src/content/assets.json", "utf8"));
const manifest = JSON.parse(await readFile("src/content/previews.json", "utf8"));
await mkdir("public/previews", { recursive: true });
for (const source of new Set(projects.map(project => project.video).filter(Boolean))) {
  const key = new URL(source); key.search = "";
  const asset = assets[key.href];
  if (!asset) throw new Error(`Import the original video before preparing its preview: ${key.pathname}`);
  const path = `/previews/${createHash("sha256").update(key.href).digest("hex").slice(0, 20)}.mp4`;
  if (manifest[key.href]?.sourceSha256 === asset.sha256 && await stat(`public${path}`).catch(() => null)) continue;
  await exec("ffmpeg", ["-nostdin", "-y", "-v", "error", "-i", `public${asset.path}`, "-t", "12", "-an", "-vf", "scale='min(960,iw)':-2,fps=24", "-c:v", "libx264", "-threads", "2", "-preset", "fast", "-crf", "28", "-pix_fmt", "yuv420p", "-movflags", "+faststart", `public${path}`], { maxBuffer: 4096 });
  const bytes = await readFile(`public${path}`);
  manifest[key.href] = { path, sourceSha256: asset.sha256, sha256: createHash("sha256").update(bytes).digest("hex") };
  console.log(`${(bytes.length / 1024).toFixed(0)} KB / ${key.pathname.split("/").pop()}`);
}
await writeFile("src/content/previews.json", `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${Object.keys(manifest).length} real project previews prepared; original films retained.`);
