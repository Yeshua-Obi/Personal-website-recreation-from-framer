import { test, expect } from "@playwright/test";
import { projectCategories, categoryPageHref, projectsInCategory } from "../../src/lib/project-categories";
import { getPublishedProjects, projectHref } from "../../src/lib/projects";

test("all public routes have unique search metadata and categories exist without client rendering", async ({ request }) => {
  const paths = ["/", "/about", "/portfolio", "/manual", "/contact", ...projectCategories.map(category => categoryPageHref(category.slug)), ...getPublishedProjects().map(project => projectHref(project.slug))];
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const path of paths) {
    const response = await request.get(path, { headers: { "User-Agent": "Googlebot" } });
    expect(response.status(), path).toBe(200);
    const html = await response.text();
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
    expect(title, path).toBeTruthy();
    expect(description, path).toBeTruthy();
    expect(titles.has(title!), path).toBe(false);
    expect(descriptions.has(description!), path).toBe(false);
    titles.add(title!); descriptions.add(description!);
    expect(html, path).toContain('/social/portfolio-card.png');
    expect(html, path).toMatch(/<h1\b/);
  }
  for (const category of projectCategories) {
    const html = await (await request.get(categoryPageHref(category.slug))).text();
    for (const project of projectsInCategory(getPublishedProjects(), category.slug)) expect(html).toContain(project.title);
  }
  expect((await request.get("/portfolio/category/not-a-category")).status()).toBe(404);
});

test("real logo icons and responsive images load, with the hand pointer preserving hover ink", async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  for (const href of await page.locator('head link[rel="icon"],head link[rel="apple-touch-icon"]').evaluateAll(links => links.map(link => link.getAttribute("href")!))) {
    const response = await request.get(href);
    expect(response.status(), href).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/image\//);
  }
  const hero = page.locator('.reel-current img').first();
  await expect.poll(() => hero.evaluate(img => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)).toBe(true);
  expect(await hero.evaluate(img => (img as HTMLImageElement).currentSrc)).toContain('/images/');
  expect(await hero.getAttribute('srcset')).toContain('.webp');
  await expect(page.locator('.reel-current .preview-slide')).toHaveCount(1);
  const link = page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'About', exact: true });
  const normal = await page.locator('body').evaluate(el => getComputedStyle(el).cursor);
  await link.hover();
  const hand = await link.evaluate(el => getComputedStyle(el).cursor);
  expect(hand).not.toBe(normal);
  expect(hand).toContain('pointer');
  expect(decodeURIComponent(hand)).toContain("fill='#000'");
  await expect(link).toHaveClass(/cursor-hover-target/);
  expect(await link.evaluate(el => getComputedStyle(el, '::before').opacity)).toBe('0.24');
  await page.locator('.brand').hover();
  expect(await page.locator('.brand').evaluate(el => getComputedStyle(el).cursor)).toBe(normal);
  await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
  await expect(page.locator('.motion-scene')).toHaveAttribute('data-motion', 'off');
});
