import type { CSSProperties } from "react";
import { mediaUrl } from "./media";

// A still from the original Framer noise texture: consistent grain without
// an unpausable animated GIF, and with the review deployment prefix intact.
export const brandTextureStyle = {
  "--grain-image": `url("${mediaUrl("/media/framer-grain-still.png")}")`,
} as CSSProperties;
