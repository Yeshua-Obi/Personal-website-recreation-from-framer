import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { projectDocument, publishedRecords, siteDocument } from "./migration.mjs";

const records = JSON.parse(await readFile(new URL("../src/content/projects.json", import.meta.url)));
const site = JSON.parse(await readFile(new URL("../src/content/site.json", import.meta.url)));

test("migration preserves every public project, order, copy and attribution", () => {
  const projects = publishedRecords(records);
  assert.equal(projects.length, 11);
  assert.deepEqual(projects.map(project => project.slug), records.map(project => project.slug));
  for (const [index, project] of projects.entries()) {
    const document = projectDocument(project, index);
    assert.equal(document.slug.current, project.slug);
    assert.equal(document.sortOrder, index);
    for (const field of ["title", "description", "content", "categories", "role", "credit", "disclosure", "date", "services"]) assert.deepEqual(document[field], project[field]);
    assert.deepEqual(document.sections?.map(({ _key, _type, ...section }) => section), project.sections);
  }
  assert.equal(projectDocument(projects.find(project => project.slug === "v320"), 10).showOnHome, false);
  assert.equal(projects.filter(project => project.showOnHome !== false).length, 10);
});

test("draft, incomplete and duplicate projects cannot enter the import", () => {
  const valid = records[0];
  assert.deepEqual(publishedRecords([valid, { ...valid }, { ...valid, slug: "private-work", status: "draft" }, { ...valid, slug: "missing-copy", content: [] }, { ...valid, slug: "invalid/slug" }]).map(project => project.slug), [valid.slug]);
});

test("profile migration preserves biography, contacts and social addresses", () => {
  const document = siteDocument(site);
  assert.equal(document._id, "site-settings");
  for (const field of ["name", "displayName", "role", "email", "phone", "biography", "about", "personalNote"]) assert.deepEqual(document[field], site[field]);
  assert.deepEqual(document.socials.map(({ _key, _type, ...social }) => social), site.socials);
  assert.equal(document.fonts, undefined);
});
