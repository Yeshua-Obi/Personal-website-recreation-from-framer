import images from "@/content/images.json";

type ImageSet = { variants: { width: number; path: string }[] };
const manifest = images as Record<string, ImageSet>;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function imageVariantUrl(src: string, width: number): string {
  if (isSanityImage(src)) {
    const url = new URL(src);
    url.searchParams.set("w", String(Math.max(1, Math.min(4096, Math.round(width)))));
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "max");
    return url.href;
  }
  const local = basePath && src.startsWith(`${basePath}/`) ? src.slice(basePath.length) : src;
  const set = manifest[local];
  if (!set?.variants.length) return src;
  const variant = set.variants.find(variant => variant.width >= width) || set.variants[set.variants.length - 1];
  return `${basePath}${variant.path}`;
}

export function isSanityImage(src: string): boolean {
  try { const url = new URL(src); return url.protocol === "https:" && url.hostname === "cdn.sanity.io" && url.pathname.startsWith("/images/"); }
  catch { return false; }
}
