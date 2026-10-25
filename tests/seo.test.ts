import { test } from "node:test";
import assert from "node:assert/strict";
import sitemap from "../src/app/sitemap";
import robots from "../src/app/robots";
import { getPublishedProjects, projectHref } from "../src/lib/projects";
import { categoryPageHref, projectCategories } from "../src/lib/project-categories";
import { identitySchema, collectionSchema, projectSchema, breadcrumbSchema, pageMetadata } from "../src/lib/seo";

test("configured-domain sitemap and crawler rules cover the real pages and only published projects", () => {
  const previous = process.env.SITE_URL;
  process.env.SITE_URL = "https://portfolio.test";
  try {
    const entries = sitemap();
    const expected = ["", "/portfolio", "/about", "/manual", "/contact", ...projectCategories.map(category => categoryPageHref(category.slug)), ...getPublishedProjects().map(project => projectHref(project.slug))];
    assert.deepEqual(entries.map(entry => entry.url), expected.map(path => `https://portfolio.test${path}`));
    assert.deepEqual(robots(), { rules: { userAgent: "*", allow: "/" }, sitemap: "https://portfolio.test/sitemap.xml" });
  } finally {
    if (previous === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = previous;
  }
});

test("page metadata and structured entities reference the configured launch domain", () => {
  const previous = process.env.SITE_URL;
  process.env.SITE_URL = "https://yeshuaobi.com";
  try {
    const metadata = pageMetadata("Brand systems", "Real project work.", "/portfolio/category/brand-systems");
    assert.equal(metadata.alternates?.canonical, "https://yeshuaobi.com/portfolio/category/brand-systems");
    assert.equal(metadata.description, "Real project work.");
    const identity = identitySchema();
    assert.equal(identity?.["@graph"][0]["@id"], "https://yeshuaobi.com/#person");
    assert.equal(identity?.["@graph"][0].name, "Yeshua Obi");
    assert.ok(identity?.["@graph"][0].sameAs?.includes("https://www.youtube.com/@yeshuaobi"));
    const projects = getPublishedProjects();
    assert.equal(collectionSchema("Work", "/portfolio", projects)?.mainEntity.numberOfItems, projects.length);
    assert.equal(projectSchema(projects[0])?.creator["@id"], "https://yeshuaobi.com/#person");
    const breadcrumbs = breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Work", path: "/portfolio" }]);
    assert.deepEqual(breadcrumbs?.itemListElement.map(item => item.position), [1, 2]);
    assert.equal(breadcrumbs?.itemListElement[1].item, "https://yeshuaobi.com/portfolio");
  } finally {
    if (previous === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = previous;
  }
});

test("unset deployment domain keeps local development out of search results", () => {
  const previous = process.env.SITE_URL;
  delete process.env.SITE_URL;
  try {
    assert.deepEqual(sitemap(), []);
    assert.deepEqual(robots(), { rules: { userAgent: "*", disallow: "/" } });
  } finally {
    if (previous !== undefined) process.env.SITE_URL = previous;
  }
});
