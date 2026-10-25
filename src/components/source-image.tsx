"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

// Keep the original source and its dimensions when a visitor cannot reach the CDN.
export function SourceImage(props: ImageProps) {
  const [unavailable, setUnavailable] = useState(false);
  return <><Image {...props} style={{ ...props.style, ...(unavailable ? { visibility: "hidden" } : {}) }} onLoad={() => setUnavailable(false)} onError={() => setUnavailable(true)} />{unavailable && <span className="source-image-unavailable">Original image unavailable</span>}</>;
}
