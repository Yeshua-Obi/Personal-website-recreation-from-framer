import { writeFile } from "node:fs/promises";

await writeFile(new URL("./dist/_headers", import.meta.url), [
  "/*", "  X-Robots-Tag: noindex, nofollow", "  X-Content-Type-Options: nosniff",
  "  Referrer-Policy: strict-origin-when-cross-origin", "  Cache-Control: no-cache",
  "/static/*", "  Cache-Control: public, max-age=31536000, immutable", "",
].join("\n"));
console.log("Studio hosting headers prepared; search indexing disabled.");
