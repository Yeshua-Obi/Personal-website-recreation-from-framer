"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Gallery } from "./gallery";
import { Arrow } from "./site-ui";
import { categoryHref, categoryPageHref, projectCategories } from "@/lib/project-categories";
import type { PreviewProject } from "@/lib/projects";

export function PortfolioViewLinks({ categorized = false }: { categorized?: boolean }) {
  return <nav className="project-view-links shell" aria-label="Project views">
    <Link href="/portfolio#project-browser" scroll={false} aria-current={!categorized ? "true" : undefined}>All projects</Link>
    <Link href={categoryHref()} scroll={false} aria-current={categorized ? "true" : undefined}>By category</Link>
  </nav>;
}

export function PortfolioBrowser({ projects, children }: { projects: PreviewProject[]; children: ReactNode }) {
  const params = useSearchParams();
  const categorized = params.get("view") === "categories";
  const selected = projectCategories.find(category => category.slug === params.get("category"));
  const expanded = categorized && selected && params.get("expanded") === "1";
  const query = params.toString();

  useEffect(() => {
    // Focus the newly revealed heading after rendering; Link's normal history
    // keeps overview, full category and case-study back/forward behavior intact.
    const frame = requestAnimationFrame(() => {
      const hash = window.location.hash.slice(1);
      const id = categorized && selected ? `category-${selected.slug}`
        : categorized && projectCategories.some(category => hash === `category-${category.slug}`) ? hash
        : "project-browser";
      if (!categorized && !window.location.hash) return;
      const target = document.getElementById(id);
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: "start", behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [query, categorized, selected]);

  return <>
    <PortfolioViewLinks categorized={categorized} />
    {!categorized ? children : <div className="category-collection shell">
      <nav className="category-jump-links" aria-label="Project categories">
        {projectCategories.map(category => <Link key={category.slug} href={categoryHref(category.slug)} scroll={false} aria-current={selected?.slug === category.slug ? "true" : undefined}>{category.label}</Link>)}
      </nav>
      {expanded && <Link className="text-link category-return" href={categoryHref()} scroll={false}><Arrow direction="left" /> All categories</Link>}
      {(expanded ? [selected] : projectCategories).map(category => {
        const collection = projects.filter(project => project.categories?.includes(category.slug));
        return <section className="project-category" key={category.slug} aria-labelledby={`category-${category.slug}`}>
          <div className="category-heading"><h2 id={`category-${category.slug}`} tabIndex={-1}>{category.label}</h2><p className="eyebrow">{collection.length} {collection.length === 1 ? "project" : "projects"}</p></div>
          {collection.length ? <Gallery projects={expanded ? collection : collection.slice(0, 3)} /> : <p className="empty-category">No published projects in this category yet. Explore another category or all projects.</p>}
          {!expanded && collection.length > 0 && <Link className="action-link category-view-all" href={`${categoryPageHref(category.slug)}#category-${category.slug}`}><span>View all {category.label} ({collection.length})</span><i><Arrow /></i></Link>}
        </section>;
      })}
    </div>}
  </>;
}
