import { SourceImage } from "@/components/source-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject, getPublishedProjects, projectHref, projectSummary } from "@/lib/projects";
import { pageMetadata, projectSchema, breadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { imageVariantUrl } from "@/lib/image-variants";
import { mediaUrl } from "@/lib/media";
import { ActionLink, Arrow, SectionTitle } from "@/components/site-ui";

export const dynamicParams = false;
export function generateStaticParams() { return getPublishedProjects().map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project not found", robots: { index: false, follow: false } };
  return pageMetadata(project.title, projectSummary(project), projectHref(slug));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const projects = getPublishedProjects();
  const next = projects[(projects.findIndex(p => p.slug === slug) + 1) % projects.length];
  const image = project.image ? mediaUrl(project.image) : undefined;
  return <main id="main" className="project-page">
    <div className="case-heading shell"><Link href="/portfolio" className="text-link"><Arrow direction="left" /> All projects</Link><p className="eyebrow">{project.category}</p><h1>{project.title}</h1>{project.disclosure && <p className="project-disclosure">{project.disclosure}</p>}<div className="case-meta"><p>{project.location}<span>{project.date && new Date(`${project.date}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</span></p><ul>{project.services?.map(service => <li key={service}>{service}</li>)}</ul><p>{project.credit}<span>{project.role}</span></p></div></div>
    {image && <div className="case-cover shell"><SourceImage src={image} alt={`${project.title} — project overview`} fill preload sizes="(max-width: 1300px) 95vw, 1280px" unoptimized={image.startsWith("https:")} /></div>}
    <article className="case-content shell"><section className="case-section"><SectionTitle number="I">Project Overview</SectionTitle><p className="case-overview">{project.description}</p></section>
      {project.film && <div className="case-film"><video src={mediaUrl(project.film)} poster={image ? imageVariantUrl(image, 1600) : undefined} controls playsInline preload="none" aria-label={`${project.title} project film`} /><p>{project.title} / Film & motion</p></div>}
      {project.sections?.map((section, index) => <section className="case-section" key={`${section.heading}-${index}`}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph, p) => <p key={p}>{paragraph}</p>)}</section>)}
      <div className="case-gallery">{project.gallery?.map((asset, i) => { const src = mediaUrl(asset.src); return <figure key={asset.src}><SourceImage src={src} alt={asset.alt} width={asset.width} height={asset.height} sizes="(max-width: 800px) 95vw, 85vw" loading="lazy" unoptimized={src.startsWith("https:")} /><figcaption>{project.title} / {String(i + 1).padStart(2,"0")}</figcaption></figure>; })}</div>
    </article>
    <section className="next-project shell"><p className="eyebrow">Next project</p><h2>{next.title}</h2><ActionLink href={projectHref(next.slug)}>View project</ActionLink></section>
    <JsonLd data={projectSchema(project)} /><JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Work", path: "/portfolio" }, { name: project.title, path: projectHref(slug) }])} />
  </main>;
}
