import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/gallery";
import { CategoryHeading } from "@/components/category-heading";
import { JsonLd } from "@/components/json-ld";
import { ActionLink, Arrow, ContactSection } from "@/components/site-ui";
import { getPublishedProjects, toProjectPreview } from "@/lib/projects";
import { categoryHref, categoryPageHref, projectCategories, projectsInCategory } from "@/lib/project-categories";
import { breadcrumbSchema, collectionSchema, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() { return projectCategories.map(({ slug }) => ({ category: slug })); }

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = projectCategories.find(category => category.slug === slug);
  return category ? pageMetadata(category.title, category.description, categoryPageHref(category.slug)) : { title: "Category not found", robots: { index: false, follow: false } };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = projectCategories.find(category => category.slug === slug);
  if (!category) notFound();
  const projects = projectsInCategory(getPublishedProjects(), category.slug);
  return <main id="main"><section className="page-intro shell"><Link className="text-link" href={categoryHref(category.slug)}><Arrow direction="left" /> All categories</Link><p className="eyebrow category-page-label">Selected work / {category.label}</p><CategoryHeading id={`category-${category.slug}`}>{category.label}</CategoryHeading><div className="page-intro-bottom"><p>{category.intro}</p><span className="eyebrow">{String(projects.length).padStart(2, "0")} projects / {category.label}</span></div></section><section className="project-category category-page-grid shell" aria-labelledby={`category-${category.slug}`}><Gallery projects={projects.map(toProjectPreview)} /></section><div className="category-page-return shell"><ActionLink href="/portfolio">All projects</ActionLink><ActionLink href={categoryHref()}>Browse by category</ActionLink></div><JsonLd data={collectionSchema(category.title, categoryPageHref(category.slug), projects)} /><JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Work", path: "/portfolio" }, { name: category.label, path: categoryPageHref(category.slug) }])} /><ContactSection /></main>;
}
