import fallbackSite from "../content/site.json";
import { selectPublishedProjects, type Project } from "./projects";

export type SiteContent = typeof fallbackSite;
export type PublishedContent = { site: SiteContent; projects: Project[] };
const object = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === "string";
const paragraphs = (value: unknown): string[] => Array.isArray(value) ? value.filter(text) : [];
const assetUrl = (value: unknown): string | undefined => {
  if (!text(value)) return undefined;
  try { return new URL(value).protocol === "https:" ? value : undefined; } catch { return undefined; }
};

export function decodeCmsContent(value: unknown): PublishedContent {
  if (!object(value) || !object(value.site) || !Array.isArray(value.projects)) throw new Error("Sanity needs a published About & contact document and project collection before activation.");
  const profile = value.site;
  for (const key of ["name", "displayName", "role", "tagline", "email", "intro"] as const) {
    if (!text(profile[key]) || !profile[key].trim()) throw new Error(`Sanity profile is missing ${key}.`);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email as string)) throw new Error("Sanity profile email is invalid.");
  const portrait = assetUrl(profile.portrait), mark = assetUrl(profile.mark);
  if (!portrait || !mark || !paragraphs(profile.biography).length || !Array.isArray(profile.socials)) throw new Error("Sanity profile is incomplete.");
  const socials = profile.socials.map(social => {
    if (!object(social) || !text(social.label) || !assetUrl(social.url)) throw new Error("Sanity social link needs a name and HTTPS address.");
    return { label: social.label, url: social.url as string };
  });
  const site = {
    ...fallbackSite, ...Object.fromEntries(["name", "displayName", "role", "tagline", "email", "intro"].map(key => [key, profile[key]])),
    portrait, mark, socials, biography: paragraphs(profile.biography), about: paragraphs(profile.about),
    phone: text(profile.phone) ? profile.phone : "", personalNote: text(profile.personalNote) ? profile.personalNote : "",
  } as SiteContent;
  const projects = value.projects.filter(object).map(record => ({
    ...record, content: paragraphs(record.content).length ? paragraphs(record.content) : Array.isArray(record.sections) ? record.sections.filter(object).flatMap(section => paragraphs(section.paragraphs)) : [],
    categories: Array.isArray(record.categories) ? record.categories.filter(text) : [],
    image: assetUrl(record.image), video: assetUrl(record.video) || null, film: assetUrl(record.film) || null,
    sections: Array.isArray(record.sections) ? record.sections.filter(object).filter(section => text(section.heading)).map(section => ({ heading: section.heading, paragraphs: paragraphs(section.paragraphs) })) : [],
    gallery: Array.isArray(record.gallery) ? record.gallery.filter(object).filter(item => assetUrl(item.src)).map(item => ({ src: item.src, alt: text(item.alt) ? item.alt : `${record.title} — project image`, width: typeof item.width === "number" && item.width > 0 ? item.width : 1600, height: typeof item.height === "number" && item.height > 0 ? item.height : 1000 })) : [],
  })) as Project[];
  return { site, projects: selectPublishedProjects(projects) };
}

export const publishedContentQuery = `{
  "site": *[_type == "siteSettings" && _id == "site-settings"][0]{name,displayName,role,tagline,email,phone,intro,biography,about,personalNote,socials[]{label,url},"portrait":portrait.asset->url,"mark":mark.asset->url},
  "projects": *[_type == "project" && status == "published"] | order(sortOrder asc, slug.current asc){
    "slug":slug.current,title,category,categories,description,status,showOnHome,content,sections[]{heading,paragraphs},services,location,date,role,credit,disclosure,sourceUrl,accent,
    "updatedAt":_updatedAt,"image":image.asset->url,"video":video.asset->url,"film":film.asset->url,
    "gallery":gallery[]{"src":asset->url,alt,"width":asset->metadata.dimensions.width,"height":asset->metadata.dimensions.height}
  }
}`;
