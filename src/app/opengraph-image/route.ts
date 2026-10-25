import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-static";

// Retain the original image URL; metadata uses the cacheable .png asset.
export async function GET() {
  const image = await readFile(path.join(process.cwd(), "public/social/portfolio-card.png"));
  return new Response(new Uint8Array(image), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" } });
}
