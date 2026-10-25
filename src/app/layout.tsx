import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { MotionScene } from "@/components/motion";
import { SiteHeader } from "@/components/header";
import { SiteFooter } from "@/components/site-sections";
import { description, getSiteUrl, siteName } from "@/lib/site";
import { getSiteContent } from "@/lib/content";
import { JsonLd } from "@/components/json-ld";
import { identitySchema, getPublicBase, socialImage } from "@/lib/seo";
import "./globals.css";

const sans = localFont({ src: "../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2", weight: "400", display: "swap", variable: "--font-sans", fallback: ["Arial"], adjustFontFallback: "Arial", preload: true });
const mono = localFont({ src: "../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2", weight: "400", display: "swap", variable: "--font-mono", fallback: ["monospace"], adjustFontFallback: false, preload: true });
const hand = localFont({ src: "../../node_modules/@fontsource/caveat/files/caveat-latin-400-normal.woff2", weight: "400", display: "swap", variable: "--font-hand", fallback: ["cursive"], adjustFontFallback: false, preload: true });

const siteUrl = getSiteUrl();
const publicBase = getPublicBase();

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  return {
    metadataBase: publicBase ? new URL(publicBase) : undefined,
    title: { default: "Yeshua Obi — Brand & Systems Designer in Lagos", template: "%s — Yeshua Obi" },
    description,
    authors: [{ name: site.name }],
    robots: { index: Boolean(siteUrl), follow: Boolean(siteUrl) },
    verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
    openGraph: { type: "website", siteName, locale: "en_NG", title: "Yeshua Obi — Brand & Systems Designer in Lagos", description, images: [socialImage()], ...(publicBase ? { url: publicBase } : {}) },
    twitter: { card: "summary_large_image", title: "Yeshua Obi — Brand & Systems Designer in Lagos", description, images: [socialImage()] },
  };
}

export const viewport: Viewport = { themeColor: "#fefcf6" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteContent();
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${sans.variable} ${mono.variable} ${hand.variable}`}>
      <body>
        <JsonLd data={identitySchema(site)} />
        <a href="#main" className="skip-link">Skip to content</a>
        <MotionScene>
          <SiteHeader identity={{ displayName: site.displayName, tagline: site.tagline, mark: site.mark }} />
          {children}
          <SiteFooter />
        </MotionScene>
      </body>
    </html>
  );
}
