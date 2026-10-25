import "server-only";
import { cache } from "react";
import fallbackSite from "../content/site.json";
import { getPublishedProjects as fallbackProjects, selectHomepageProjects } from "./projects";
import { decodeCmsContent, publishedContentQuery, type PublishedContent } from "./cms-content";

const getContent = cache(async (): Promise<PublishedContent> => {
  const projectId = process.env.SANITY_PROJECT_ID, dataset = process.env.SANITY_DATASET;
  if (!projectId && !dataset) return { site: fallbackSite, projects: fallbackProjects() };
  if (!projectId || !/^[a-z0-9-]+$/.test(projectId) || !dataset || !/^[a-z0-9][a-z0-9_-]*$/.test(dataset)) throw new Error("Set both SANITY_PROJECT_ID and SANITY_DATASET to the activated portfolio project.");
  const url = new URL(`https://${projectId}.api.sanity.io/v2025-02-19/data/query/${dataset}`);
  url.searchParams.set("query", publishedContentQuery);
  url.searchParams.set("perspective", "published");
  // Default Next fetch semantics take a fresh snapshot on each static build.
  // No write credential is used by the public website.
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Published Sanity content could not be read (${response.status}).`);
  const body = await response.json();
  return decodeCmsContent(body.result);
});

export async function getSiteContent() { return (await getContent()).site; }
export async function getPublishedProjects() { return (await getContent()).projects; }
export async function getHomepageProjects() { return selectHomepageProjects(await getPublishedProjects()); }
export async function getProject(slug: string) { return (await getPublishedProjects()).find(project => project.slug === slug); }
