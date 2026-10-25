export const siteName = "Yeshua Obi";
export const description = "Yeshua Obi is a Brand & Systems Designer in Lagos, Nigeria. Explore brand identities, digital products, AI workflows and visual storytelling projects.";

export function getSiteUrl(raw = process.env.SITE_URL): string | undefined {
  if (!raw?.trim()) return undefined;
  const url = new URL(raw);
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/"
    || url.search || url.hash || url.hostname === "localhost" || url.hostname.endsWith(".example")) {
    throw new Error("SITE_URL must be the final public HTTPS origin, without a path or credentials.");
  }
  return url.origin;
}
