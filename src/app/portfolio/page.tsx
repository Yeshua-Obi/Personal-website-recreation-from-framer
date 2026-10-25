import type { Metadata } from "next";
import { Suspense } from "react";
import { PortfolioBrowser, PortfolioViewLinks } from "@/components/portfolio-browser";
import Link from "next/link";
import { Gallery } from "@/components/gallery";
import { ContactSection, Arrow } from "@/components/site-ui";
import { getPublishedProjects, projectHref, toProjectPreview } from "@/lib/projects";
import { pageMetadata, collectionSchema } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = pageMetadata("Brand, Digital, AI & Film Projects", "Explore Yeshua Obi’s selected brand identities, websites, AI-assisted workflows, architectural visualization and film, with complete project case studies.", "/portfolio");

export default function PortfolioPage() {
  const projects = getPublishedProjects();
  const original = <><div className="work-section work-page-grid shell"><Gallery projects={projects.map(toProjectPreview)} /></div><section className="project-index shell" aria-labelledby="index-title"><h2 id="index-title" className="eyebrow">The index / All work</h2>{projects.map((project,index) => <Link className="index-row" key={project.slug} href={projectHref(project.slug)}><span className="index-number">{String(index+1).padStart(2,"0")}</span><h3>{project.title}</h3><span>{project.category}</span><span>{project.date?.slice(0, 4)}</span><Arrow /></Link>)}</section></>;
  return <main id="main"><section className="page-intro shell"><p className="eyebrow">01 / MAKE / Selected projects</p><h1>Work, in<br /><span className="muted">many forms.</span></h1><div className="page-intro-bottom"><p>Brand & systems design. Digital experiences.<br />AI workflows. Visual storytelling.</p><span className="eyebrow">{String(projects.length).padStart(2,"0")} projects / A continuing collection</span></div></section><div id="project-browser" tabIndex={-1}><Suspense fallback={<><PortfolioViewLinks />{original}</>}><PortfolioBrowser projects={projects.map(toProjectPreview)}>{original}</PortfolioBrowser></Suspense></div><JsonLd data={collectionSchema("Selected projects by Yeshua Obi", "/portfolio", projects)} /><ContactSection /></main>;
}
