import type { MetadataRoute } from "next";
import { projectHref } from "@/lib/projects";
import { getPublishedProjects } from "@/lib/content";
import { getSiteUrl } from "@/lib/site";
import { categoryPageHref, projectCategories } from "@/lib/project-categories";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteUrl();
  if (!origin) return [];
  return [
    { url: origin, changeFrequency: "monthly", priority: 1 },
    { url: `${origin}/portfolio`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${origin}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${origin}/manual`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${origin}/contact`, changeFrequency: "yearly", priority: 0.6 },
    ...projectCategories.map(category => ({ url: `${origin}${categoryPageHref(category.slug)}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...(await getPublishedProjects()).map((project) => ({ url: `${origin}${projectHref(project.slug)}`, ...(project.updatedAt ? { lastModified: project.updatedAt } : {}), changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
