import test from "node:test";
import assert from "node:assert/strict";
import site from "../src/content/site.json";
import records from "../src/content/projects.json";
import { decodeCmsContent } from "../src/lib/cms-content";
import { selectHomepageProjects } from "../src/lib/projects";
import { imageVariantUrl } from "../src/lib/image-variants";
import { getPublishedProjects, getHomepageProjects, getSiteContent } from "../src/lib/content";

test("CMS snapshots preserve existing routes, ordering, credit and homepage visibility", () => {
  const content = decodeCmsContent({ site, projects: records });
  assert.equal(content.projects.length, 11);
  assert.deepEqual(content.projects.map(project => project.slug), records.map(project => project.slug));
  assert.equal(selectHomepageProjects(content.projects).length, 10);
  assert.equal(content.projects.find(project => project.slug === "v320")?.showOnHome, false);
  assert.equal(content.site.email, site.email);
  assert.deepEqual(content.site.biography, site.biography);
  assert.deepEqual(content.projects.map(project => project.credit), records.map(project => project.credit));
});

test("CMS drafts and malformed records never reach routes or counts", () => {
  const content = decodeCmsContent({ site, projects: [records[0], { ...records[0], slug: "unpublished-fixture", status: "draft" }, { ...records[0], slug: "incomplete-fixture", content: null, sections: [] }, { ...records[0], slug: "broken-title", title: null }] });
  assert.deepEqual(content.projects.map(project => project.slug), [records[0].slug]);
  assert.throws(() => decodeCmsContent({ site: null, projects: records }));
  assert.throws(() => decodeCmsContent({ site: { ...site, email: "" }, projects: records }));
  assert.throws(() => decodeCmsContent({ site: { ...site, socials: [{ label: "Unsafe fixture", url: "javascript:void(0)" }] }, projects: records }));
});

test("new projects can publish a structured story without duplicating its copy", () => {
  const story = [{ heading: "A real process", paragraphs: ["A complete project story."] }];
  const content = decodeCmsContent({ site, projects: [{ ...records[0], content: null, sections: story }] });
  assert.equal(content.projects.length, 1);
  assert.deepEqual(content.projects[0].content, story[0].paragraphs);
});

test("Sanity images receive bounded responsive CDN transforms", () => {
  const source = "https://cdn.sanity.io/images/dntp46vk/production/fixture-1000x500.png";
  const result = new URL(imageVariantUrl(source, 480));
  assert.equal(result.searchParams.get("w"), "480");
  assert.equal(result.searchParams.get("auto"), "format");
  assert.equal(result.searchParams.get("fit"), "max");
  assert.equal(new URL(imageVariantUrl(source, 9000)).searchParams.get("w"), "4096");
  assert.equal(imageVariantUrl("https://example.test/image.png", 480), "https://example.test/image.png");
});

test("activated website reads only the published perspective without write credentials", async () => {
  const previous = { project: process.env.SANITY_PROJECT_ID, dataset: process.env.SANITY_DATASET, fetch: globalThis.fetch };
  process.env.SANITY_PROJECT_ID = "dntp46vk";
  process.env.SANITY_DATASET = "production";
  globalThis.fetch = async (input, options) => {
    const url = new URL(String(input));
    assert.equal(url.hostname, "dntp46vk.api.sanity.io");
    assert.equal(url.searchParams.get("perspective"), "published");
    assert.equal(options?.headers, undefined);
    return new Response(JSON.stringify({ result: { site, projects: records } }));
  };
  try {
    assert.equal((await getPublishedProjects()).length, 11);
    assert.equal((await getHomepageProjects()).length, 10);
    assert.equal((await getSiteContent()).email, site.email);
    globalThis.fetch = async () => new Response("unavailable", { status: 503 });
    await assert.rejects(getPublishedProjects(), /could not be read/);
    globalThis.fetch = async () => new Response(JSON.stringify({ result: { site: null, projects: [] } }));
    await assert.rejects(getPublishedProjects(), /published About/);
  } finally {
    globalThis.fetch = previous.fetch;
    if (previous.project === undefined) delete process.env.SANITY_PROJECT_ID; else process.env.SANITY_PROJECT_ID = previous.project;
    if (previous.dataset === undefined) delete process.env.SANITY_DATASET; else process.env.SANITY_DATASET = previous.dataset;
  }
});
