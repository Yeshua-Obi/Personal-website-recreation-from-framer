"use client";

import type { ImageLoaderProps } from "next/image";
import { imageVariantUrl } from "./image-variants";

// Generated WebP variants work on static hosting as well as a Next server.
export default function imageLoader({ src, width }: ImageLoaderProps): string {
  return imageVariantUrl(src, width);
}
