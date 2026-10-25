import type { Metadata } from "next";
import site from "@/content/site.json";
import { getSiteUrl, description, siteName } from "./site";
import { mediaUrl } from "./media";
import { imageVariantUrl } from "./image-variants";
import { type Project, projectHref } from "./projects";

export function getPublicBase(): string | undefined {
  return getSiteUrl() || (process.env.PREVIEW_ORIGIN ? `${process.env.PREVIEW_ORIGIN}${process.env.NEXT_PUBLIC_BASE_PATH || ""}` : undefined);
}

export function socialImage() {
  const base = getPublicBase();
  return { url: `${base || ""}/social/portfolio-card.png`, width: 1200, height: 630, alt: "Yeshua Obi — Brand & Systems Designer" };
}

export function pageMetadata(title: string, summary: string, path: string): Metadata {
  const origin = getSiteUrl();
  const url = origin ? `${origin}${path}` : undefined;
  const shareBase = getPublicBase();
  return {
    title, description: summary,
    alternates: { canonical: url },
    openGraph: { title: `${title} — ${siteName}`, description: summary, type: "website", images: [socialImage()], ...(shareBase ? { url: `${shareBase}${path}` } : {}) },
    twitter: { card: "summary_large_image", title: `${title} — ${siteName}`, description: summary, images: [socialImage()] },
  };
}

export function identitySchema() {
  const origin = getSiteUrl();
  if (!origin) return undefined;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Person", "@id": `${origin}/#person`, name: site.displayName,
        alternateName: [site.name, "Joshua Obi"], jobTitle: site.role, url: origin,
        description, image: new URL(imageVariantUrl(mediaUrl(site.portrait), 960), origin).href,
        homeLocation: { "@type": "Place", name: "Lagos, Nigeria" },
        knowsAbout: ["Brand strategy", "Brand identity design", "Digital product design", "AI workflows", "Visual storytelling"],
        sameAs: site.socials.map(social => social.url) },
      { "@type": "WebSite", "@id": `${origin}/#website`, name: siteName, url: origin,
        description, inLanguage: "en", publisher: { "@id": `${origin}/#person` } },
    ],
  };
}

export function profileSchema() {
  const origin = getSiteUrl();
  return origin ? { "@context": "https://schema.org", "@type": "ProfilePage", url: `${origin}/about`, name: "About Yeshua Obi", mainEntity: { "@id": `${origin}/#person` }, isPartOf: { "@id": `${origin}/#website` } } : undefined;
}

export function projectSchema(project: Project) {
  const origin = getSiteUrl();
  if (!origin) return undefined;
  return { "@context": "https://schema.org", "@type": "CreativeWork", name: project.title,
    description: project.description, creator: { "@id": `${origin}/#person` },
    url: `${origin}${projectHref(project.slug)}`, mainEntityOfPage: `${origin}${projectHref(project.slug)}`,
    ...(project.image ? { image: new URL(imageVariantUrl(mediaUrl(project.image), 1600), origin).href } : {}),
    ...(project.date ? { dateCreated: project.date } : {}),
    ...(project.updatedAt ? { dateModified: project.updatedAt } : {}),
    ...(project.services ? { keywords: project.services.join(", ") } : {}) };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  const origin = getSiteUrl();
  if (!origin) return undefined;
  return { "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: `${origin}${item.path}` })) };
}

export function collectionSchema(name: string, path: string, projects: { title: string; slug: string }[]) {
  const origin = getSiteUrl();
  if (!origin) return undefined;
  return { "@context": "https://schema.org", "@type": "CollectionPage", name, url: `${origin}${path}`,
    isPartOf: { "@id": `${origin}/#website` },
    mainEntity: { "@type": "ItemList", numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => ({ "@type": "ListItem", position: index + 1, name: project.title, url: `${origin}/portfolio/${project.slug}` })) } };
}
