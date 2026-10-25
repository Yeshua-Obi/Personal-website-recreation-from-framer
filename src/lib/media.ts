import assets from "@/content/assets.json";
import previews from "@/content/previews.json";

type Asset = { path: string; sha256: string };
const localAssets = assets as Record<string, Asset>;
const localPreviews = previews as Record<string, Asset>;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function mediaUrl(source: string): string {
  if (!source.startsWith("https://")) return source.startsWith("/") ? `${basePath}${source}` : source;
  const key = new URL(source);
  key.search = "";
  // The portable review carries lightweight loops locally; full films retain
  // their original public source so the review bundle stays easy to publish.
  if ((process.env.NEXT_PUBLIC_REVIEW_EXPORT === "1" || process.env.NEXT_PUBLIC_STATIC_EXPORT === "1") && key.pathname.endsWith(".mp4")) return source;
  return localAssets[key.href] ? `${basePath}${localAssets[key.href].path}` : source;
}

export function previewUrl(source: string): string {
  const key = new URL(source); key.search = "";
  return localPreviews[key.href] ? `${basePath}${localPreviews[key.href].path}` : mediaUrl(source);
}
