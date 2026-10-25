import { test } from "node:test";
import assert from "node:assert/strict";
import { getPublishedProjects, type Project } from "../src/lib/projects";
import { projectCategories, projectsInCategory } from "../src/lib/project-categories";

test("categories use explicit metadata, retain publication rules and preserve source order", () => {
  const published = getPublishedProjects();
  const draft: Project = { ...published[0], slug: "unpublished-project", status: "draft" };
  const uncategorized: Project = { ...published[0], slug: "unassigned-project", categories: undefined };
  const source = [draft, ...published, uncategorized];
  assert.deepEqual(projectsInCategory(source, "digital-products").map(project => project.slug), [
    "baron-architecture", "taikez", "ozithy-nylon-depot", "leanne-pero-foundation",
  ]);
  assert.deepEqual(projectsInCategory(source, "ai-workflows").map(project => project.slug), ["nibss", "saka"]);
  for (const project of published) {
    assert.ok(project.categories?.length);
    for (const category of project.categories) assert.ok(projectCategories.some(record => record.slug === category));
  }
});
