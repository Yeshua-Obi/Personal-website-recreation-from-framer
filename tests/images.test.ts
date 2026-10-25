import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import assets from "../src/content/assets.json";
import imageSets from "../src/content/images.json";
import { imageVariantUrl } from "../src/lib/image-variants";
import { getPublishedProjects, toProjectPreview } from "../src/lib/projects";

test("responsive variants cover every imported image and exist on disk", () => {
  for (const asset of Object.values(assets).filter(asset => /\.(png|jpe?g|webp)$/i.test(asset.path))) {
    const set = (imageSets as Record<string, { sourceSha256: string; variants: { width: number; path: string }[] }>)[asset.path];
    assert.equal(set.sourceSha256, asset.sha256);
    assert.ok(set.variants.length);
    for (const variant of set.variants) assert.ok(existsSync(`public${variant.path}`), variant.path);
    const url = imageVariantUrl(asset.path, 480);
    assert.match(url, /\/images\/.+\.webp$/);
  }
  assert.equal(imageVariantUrl("https://example.test/not-imported.jpg", 480), "https://example.test/not-imported.jpg");
});

test("preview clients receive card data without full case-study copy", () => {
  const project = getPublishedProjects()[0];
  const card = toProjectPreview(project);
  assert.equal(card.slug, project.slug);
  assert.equal(card.title, project.title);
  assert.ok(card.gallery!.length <= 3);
  assert.ok(!("description" in card));
  assert.ok(!("content" in card));
  assert.ok(!("sections" in card));
  assert.ok(JSON.stringify(card).length < JSON.stringify(project).length / 2);
});
