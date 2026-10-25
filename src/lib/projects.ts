import records from "../content/projects.json";
import type { ProjectCategory } from "./project-categories";

export type Project = {
  slug: string;
  title: string;
  category: string;
  categories?: ProjectCategory[];
  description: string;
  status: "draft" | "published";
  showOnHome?: boolean;
  content: string[];
  image?: string;
  video?: string | null;
  film?: string | null;
  sections?: { heading: string; paragraphs: string[] }[];
  gallery?: { src: string; alt: string; width: number; height: number }[];
  services?: string[];
  location?: string;
  date?: string;
  role?: string;
  credit?: string;
  disclosure?: string;
  sourceUrl?: string;
  updatedAt?: string;
  accent?: string;
};

export type PreviewProject = Pick<Project, "slug" | "title" | "category" | "categories" | "date" | "image" | "video" | "accent"> & {
  gallery?: { src: string }[];
};

// Card/reel clients never need a case study's full copy or complete gallery.
export function toProjectPreview(project: Project): PreviewProject {
  return {
    slug: project.slug, title: project.title, category: project.category,
    categories: project.categories, date: project.date, image: project.image,
    video: project.video, accent: project.accent,
    gallery: project.gallery?.slice(0, 3).map(({ src }) => ({ src })),
  };
}

export const projectHref = (slug: string) => `/portfolio/${slug}`;

export function projectSummary(project: Project): string {
  const text = project.description.replace(/\s+/g, " ").trim();
  return text.length <= 160 ? text : `${text.slice(0, 157).replace(/\s+\S*$/, "")}…`;
}

// The gallery, routes and sitemap all use this exact publication gate.
// A project needs real page content before it can appear anywhere publicly.
export function selectPublishedProjects(input: readonly Project[]): Project[] {
  const slugs = new Set<string>();
  return input.filter((project) => {
    const eligible = project.status === "published"
      && typeof project.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)
      && typeof project.title === "string" && project.title.trim().length > 0
      && typeof project.description === "string" && project.description.trim().length > 0
      && Array.isArray(project.content) && project.content.some((paragraph) => typeof paragraph === "string" && paragraph.trim().length > 0);
    if (!eligible || slugs.has(project.slug)) return false;
    slugs.add(project.slug);
    return true;
  });
}

export function getPublishedProjects(): Project[] {
  return selectPublishedProjects(records as Project[]);
}

export function selectHomepageProjects(input: readonly Project[]): Project[] {
  return selectPublishedProjects(input).filter(project => project.showOnHome !== false);
}

export function getHomepageProjects(): Project[] {
  return selectHomepageProjects(records as Project[]);
}

export function getProject(slug: string): Project | undefined {
  return getPublishedProjects().find((project) => project.slug === slug);
}
