import { test, expect } from "@playwright/test";
import { projectCategories, projectsInCategory } from "../../src/lib/project-categories";
import { getPublishedProjects } from "../../src/lib/projects";

test("category previews, full collections, case navigation and browser history work", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/portfolio");
  const original = getPublishedProjects();
  await expect(page.locator(".work-page-grid .project-link")).toHaveCount(original.length);
  expect(await page.locator(".work-page-grid .project-link").evaluateAll(links => links.map(link => link.getAttribute("href")))).toEqual(original.map(project => `/portfolio/${project.slug}`));
  await page.getByRole("navigation", { name: "Project views", exact: true }).getByRole("link", { name: "By category", exact: true }).click();
  await expect(page.locator(".project-category")).toHaveCount(4);
  for (const category of projectCategories) {
    const section = page.locator(".project-category").filter({ has: page.getByRole("heading", { name: category.label, exact: true }) });
    await expect(section.locator(".project-link")).toHaveCount(Math.min(3, projectsInCategory(original, category.slug).length));
  }
  await page.getByRole("link", { name: "View all Brand systems (7)", exact: true }).click();
  await expect(page.locator(".project-category")).toHaveCount(1);
  await expect(page.locator(".project-category .project-link")).toHaveCount(7);
  await expect(page.getByRole("heading", { name: "Brand systems", exact: true })).toBeFocused();
  await page.locator(".project-category").getByRole("link", { name: /Baron Architecture$/ }).click();
  await expect(page).toHaveURL(/\/portfolio\/baron-architecture$/);
  await page.goBack();
  await expect(page.locator(".project-category .project-link")).toHaveCount(7);
  await page.getByRole("link", { name: "All categories", exact: true }).click();
  await expect(page.locator(".project-category")).toHaveCount(4);
  await page.goBack();
  await expect(page.locator(".project-category")).toHaveCount(1);
  await page.goForward();
  await expect(page.locator(".project-category")).toHaveCount(4);
  await page.getByRole("navigation", { name: "Project views", exact: true }).getByRole("link", { name: "All projects", exact: true }).click();
  await expect(page.locator(".work-page-grid .project-link")).toHaveCount(11);
  await expect(page.locator(".project-index .index-row")).toHaveCount(11);
  expect(errors).toEqual([]);
});

test("each homepage discipline opens and focuses its category, including direct loads", async ({ page }) => {
  for (const category of projectCategories) {
    await page.goto("/");
    await page.locator(".practice-strip").getByRole("link", { name: category.label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`category=${category.slug}`));
    await expect(page.locator(`#category-${category.slug}`)).toBeFocused();
    await page.reload();
    await expect(page.locator(`#category-${category.slug}`)).toBeFocused();
    await expect(page.locator(".project-category")).toHaveCount(4);
  }
});

test("compact motion control pauses playback and remembers the choice across navigation and reload", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const control = page.getByRole("button", { name: "Pause motion", exact: true });
  await expect(control).toHaveAccessibleDescription("Pause looping animations throughout the website.");
  await expect(control).toHaveCSS("width", "44px");
  await control.focus();
  await expect(control).toHaveCSS("width", "164px");
  await control.press("Enter");
  await expect(page.locator(".motion-scene")).toHaveAttribute("data-motion", "off");
  expect(await page.locator("video").evaluateAll(videos => videos.every(video => (video as HTMLVideoElement).paused))).toBe(true);
  await page.getByRole("navigation", { name: "Footer navigation", exact: true }).getByRole("link", { name: "About", exact: true }).click();
  await expect(page.getByRole("button", { name: "Resume motion", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.getByRole("button", { name: "Resume motion", exact: true })).toBeEnabled();
  await expect(page.locator(".motion-scene")).toHaveAttribute("data-motion", "off");
  await page.getByRole("button", { name: "Resume motion", exact: true }).click();
  await expect(page.locator(".motion-scene")).toHaveAttribute("data-motion", "on");
});

test("mobile hides the floating motion control, respects system preferences and keeps footer navigation", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000/");
  await expect(page.locator(".motion-control")).toBeHidden();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".motion-scene")).toHaveAttribute("data-motion", "off");
  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  await expect(page.locator(".footer-wordmark")).toHaveAttribute("href", "/about");
  await expect(page.locator(".social-links").getByRole("link", { name: "YouTube", exact: true })).toHaveAttribute("href", "https://www.youtube.com/@yeshuaobi");
  const nav = page.getByRole("navigation", { name: "Footer navigation", exact: true });
  await expect(nav.getByRole("link")).toHaveCount(5);
  await nav.getByRole("link", { name: "Contact", exact: true }).tap();
  await expect(page).toHaveURL(/\/contact$/);
  await context.close();
});
