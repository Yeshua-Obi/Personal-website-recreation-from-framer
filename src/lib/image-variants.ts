import images from "@/content/images.json";

type ImageSet = { variants: { width: number; path: string }[] };
const manifest = images as Record<string, ImageSet>;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function imageVariantUrl(src: string, width: number): string {
  const local = basePath && src.startsWith(`${basePath}/`) ? src.slice(basePath.length) : src;
  const set = manifest[local];
  if (!set?.variants.length) return src;
  const variant = set.variants.find(variant => variant.width >= width) || set.variants[set.variants.length - 1];
  return `${basePath}${variant.path}`;
}
