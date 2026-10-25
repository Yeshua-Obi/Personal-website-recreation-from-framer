import { test } from "node:test";
import assert from "node:assert/strict";
import { getPublishedProjects, selectPublishedProjects, selectHomepageProjects, projectSummary, type Project } from "../src/lib/projects";
import { getSiteUrl } from "../src/lib/site";

const complete: Project = {
  slug: "example-case-study",
  title: "Test case study",
  category: "Test fixture",
  description: "Only used by the automated tests.",
  status: "published",
  content: ["A complete test case study."],
};

test("only published projects with real page content reach the gallery and routes", () => {
  const result = selectPublishedProjects([
    { ...complete, slug: "still-a-draft", status: "draft" },
    { ...complete, slug: "no-case-study", content: [] },
    { ...complete, slug: "blank-case-study", content: ["   "] },
    { ...complete, slug: "no-description", description: " " },
    { ...complete, slug: "no-title", title: " " },
    complete,
  ]);
  assert.deepEqual(result, [complete]);
  assert.deepEqual(selectHomepageProjects([
    complete,
    { ...complete, slug: "hidden-from-home", showOnHome: false },
    { ...complete, slug: "draft-on-home", status: "draft", showOnHome: true },
  ]), [complete]);
});

test("unroutable slugs and duplicate channels do not become project links", () => {
  const result = selectPublishedProjects([
    { ...complete, slug: "../../private" },
    { ...complete, slug: "has space" },
    complete,
    { ...complete, title: "Duplicate" },
  ]);
  assert.deepEqual(result, [complete]);
});

test("the imported portfolio includes 11 complete case studies and rejects PNG sources as video", () => {
  const published = getPublishedProjects();
  assert.equal(published.length, 11);
  assert.equal(published.filter(project => project.video).length, 9);
  for (const project of published) {
    assert.ok(project.sourceUrl?.startsWith("https://yeshuaobi.framer.website/portfolio/"));
    if (project.video) assert.ok(new URL(project.video).pathname.endsWith(".mp4"));
    assert.ok(projectSummary(project).length <= 160);
  }
  assert.equal(published.find(project => project.slug === "nibss")?.video, null);
  assert.equal(published.find(project => project.slug === "saka")?.video, null);
});

test("a missing deployment origin does not invent a canonical URL", () => {
  assert.equal(getSiteUrl(""), undefined);
  assert.equal(getSiteUrl("https://portfolio.test"), "https://portfolio.test");
});

test("deployment origin rejects paths, credentials, and development placeholders", () => {
  for (const url of ["http://portfolio.test", "https://localhost", "https://your-domain.example", "https://portfolio.test/projects", "https://name:secret@portfolio.test", "https://portfolio.test?query=1"]) {
    assert.throws(() => getSiteUrl(url));
  }
});
