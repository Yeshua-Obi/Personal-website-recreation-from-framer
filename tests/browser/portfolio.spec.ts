import { expect, test } from "@playwright/test";
import path from "node:path";
import projects from "../../src/content/projects.json";

const published = projects.filter(project => project.status === "published");
const origin = process.env.SITE_URL?.replace(/\/$/, "");

test("home uses the real identity and keeps 10 distinct home projects and all 11 case studies", async ({ page, request }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle("Yeshua Obi — Brand & Systems Designer in Lagos");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Yeshua\s*Obi\./);
  await expect(page.locator(".project-grid .project-link")).toHaveCount(10);
  await expect(page.locator(".television, .tv-controls, .scanlines")).toHaveCount(0);
  const hrefs = await page.locator(".project-grid .project-link").evaluateAll(nodes => nodes.map(node => node.getAttribute("href")));
  expect(hrefs).toEqual(published.filter(project => project.showOnHome !== false).map(project => `/portfolio/${project.slug}`));
  await expect(page.locator(".work-introduction .eyebrow")).toContainText(`${String(hrefs.length).padStart(2, "0")} projects`);
  for (const project of published) {
    const response = await request.get(`/portfolio/${project.slug}`);
    expect(response.status(), project.slug).toBe(200);
    expect(await response.text()).toContain(project.title);
  }
  await page.locator(".project-grid").getByRole("link", { name: /Baron Architecture$/ }).click();
  await expect(page).toHaveURL(/\/portfolio\/baron-architecture$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Baron Architecture");
  expect(errors).toEqual([]);
});

test("the recovered logo and background orb follow the pointer and respect pause", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".motion-scene")).toHaveAttribute("data-motion", "on");
  const box = await page.locator(".brand").boundingBox();
  if (!box) throw new Error("Logo is not visible");
  await page.mouse.move(box.x + box.width - 4, box.y + 8);
  await expect.poll(() => page.locator(".brand-mark").evaluate(node => parseFloat(node.style.getPropertyValue("--magnet-x")))).toBeGreaterThan(0);
  await page.mouse.move(950, 350);
  const sphere = page.locator(".ambient");
  await expect(sphere).toHaveCSS("mix-blend-mode", "normal");
  await expect.poll(() => sphere.evaluate(node => parseFloat(node.style.getPropertyValue("--sphere-x")))).toBeGreaterThan(900);
  await page.mouse.move(150, 650);
  await expect.poll(() => sphere.evaluate(node => parseFloat(node.style.getPropertyValue("--sphere-x")))).toBeLessThan(200);
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: "instant" }));
  await expect.poll(() => page.locator(".motion-scene").evaluate(node => parseFloat(node.style.getPropertyValue("--parallax")))).toBeGreaterThan(5);
  await page.getByRole("button", { name: "Pause motion" }).click();
  await expect(page.locator(".motion-scene")).toHaveAttribute("data-motion", "off");
  await expect(page.locator(".motion-scene")).toHaveCSS("--orb-x", "0px");
  await page.getByRole("button", { name: "Resume motion" }).click();
  await expect(page.locator(".motion-scene")).toHaveAttribute("data-motion", "on");
});

test("native preview playback is muted, loops, and pauses offscreen and on request (test media)", async ({ page }) => {
  // Exercise actual Chromium decoding/playback independently of Framer CDN access.
  // This generated clip is only a test response; it is never portfolio content.
  await page.route(/\.mp4(?:\?|$)/, route => route.fulfill({
    path: path.join(process.cwd(), "tests/fixtures/preview.webm"),
    contentType: "video/webm",
    headers: { "Access-Control-Allow-Origin": "*" },
  }));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const card = page.locator(".project-grid .project-preview").first();
  const video = card.locator("video");
  await card.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate(node => !(node as HTMLVideoElement).paused && (node as HTMLVideoElement).currentTime > 0)).toBe(true);
  expect(await video.evaluate(node => (node as HTMLVideoElement).muted && (node as HTMLVideoElement).loop && (node as HTMLVideoElement).playsInline)).toBe(true);
  await page.getByRole("button", { name: "Pause motion" }).click();
  await expect.poll(() => video.evaluate(node => (node as HTMLVideoElement).paused)).toBe(true);
  await expect(video).toHaveCSS("opacity", "1");
  await page.getByRole("button", { name: "Resume motion" }).click();
  await expect.poll(() => video.evaluate(node => (node as HTMLVideoElement).paused)).toBe(false);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect.poll(() => video.evaluate(node => (node as HTMLVideoElement).paused)).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await card.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate(node => (node as HTMLVideoElement).paused)).toBe(true);
});

test("all main pages fit a mobile viewport and system reduced motion stops image animation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const url of ["/", "/portfolio", "/about", "/manual", "/contact", "/portfolio/oyntcda"]) {
    await page.goto(url);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), url).toBe(false);
  }
  await page.goto("/");
  await expect(page.locator(".motion-toggle")).toBeDisabled();
  await expect(page.locator(".motion-control")).toBeHidden();
  await expect(page.locator(".motion-scene")).toHaveAttribute("data-motion", "off");
  await expect(page.locator(".preview-image").first()).toHaveCSS("animation-name", "none");
});

test("contact offers an email draft and validates required fields", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Create email draft" }).click();
  await expect(page.locator(".contact-form [role='status']")).toHaveCount(0);
  await expect(page.locator("#contact-name:invalid")).toHaveCount(1);
  await page.getByLabel("Your name").fill("Example Visitor");
  await page.getByLabel("Email address").fill("visitor@example.test");
  await page.getByLabel("Tell me about your project").fill("A test enquiry for the contact form.");
  await page.getByRole("button", { name: "Create email draft" }).click();
  await expect(page.locator(".contact-form [role='status']")).toContainText("Your draft is ready to open");
  const draft = await page.getByRole("link", { name: "Open email draft", exact: true }).getAttribute("href");
  expect(draft).toContain("mailto:joshobi984@gmail.com?subject=");
  expect(decodeURIComponent(draft || "")).toContain("A test enquiry for the contact form.");
  await expect(page.locator(".contact-channels a[href='mailto:joshobi984@gmail.com']")).toBeVisible();
});

test("crawler endpoints, social image, old URL redirects and unknown project 404s work", async ({ request }) => {
  const missing = await request.get("/portfolio/not-a-published-project");
  expect(missing.status()).toBe(404);
  const old = await request.get("/projects/baron-architecture", { maxRedirects: 0 });
  expect(old.status()).toBe(308);
  expect(old.headers().location).toBe("/portfolio/baron-architecture");
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain(origin ? "Allow: /" : "Disallow: /");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  if (origin) {
    expect((xml.match(/<loc>/g) || []).length).toBe(20);
    for (const project of published) expect(xml).toContain(`${origin}/portfolio/${project.slug}`);
  } else expect(xml).not.toContain("<loc>");
  const socialImage = await request.get("/opengraph-image");
  expect(socialImage.status()).toBe(200);
  expect(socialImage.headers()["content-type"]).toContain("image/png");
});

test("featured reel advances at the end of a real clip and remains navigable with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const current = page.locator(".reel-current");
  await expect(current).toHaveAttribute("data-project", "baron-architecture");
  await expect.poll(() => current.locator("video").evaluate(node => (node as HTMLVideoElement).readyState >= 2 && !(node as HTMLVideoElement).paused)).toBe(true);
  await current.locator("video").evaluate(node => { const video = node as HTMLVideoElement; video.currentTime = video.duration - .1; });
  await expect(current).toHaveAttribute("data-project", "numenhaus");
  await page.getByRole("button", { name: "Pause motion", exact: true }).click();
  await expect.poll(() => current.locator("video").evaluate(node => (node as HTMLVideoElement).paused)).toBe(true);
  await page.clock.install();
  await page.clock.fastForward(25_000);
  await expect(current).toHaveAttribute("data-project", "numenhaus");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Next featured project", exact: true }).click();
  await expect(current).toHaveAttribute("data-project", "oyntcda");
  await page.clock.fastForward(25_000);
  await expect(current).toHaveAttribute("data-project", "oyntcda");
  await expect(page.locator(".reel-slide")).toHaveCount(1);
});

test("cursor keeps blue hover ink behind links and disappears over the magnetic logo", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".motion-scene")).toHaveAttribute("data-motion", "on");
  await page.mouse.move(500, 400);
  const cursor = page.locator(".cursor-follower");
  await expect(cursor).toHaveCSS("opacity", "1");
  await expect(cursor).toHaveCSS("mix-blend-mode", "difference");
  await expect(cursor.locator("span")).toHaveCSS("background-color", "rgb(122, 154, 191)");
  expect(await page.locator("body").evaluate(node => getComputedStyle(node).cursor)).toContain("data:image/svg+xml");
  const link = page.getByRole("navigation", { name: "Main navigation", exact: true }).getByRole("link", { name: "Manual", exact: true });
  await link.hover();
  await expect(cursor).toHaveAttribute("data-interactive", "true");
  await expect(cursor).toHaveCSS("opacity", "0");
  const ink = await link.evaluate(node => { const style = getComputedStyle(node, "::before"); return { color: style.backgroundColor, opacity: style.opacity, layer: style.zIndex }; });
  expect(ink).toEqual({ color: "rgb(122, 154, 191)", opacity: "0.24", layer: "-1" });
  await page.locator(".brand").hover();
  await expect(cursor).toHaveAttribute("data-mode", "hidden");
  await expect(page.locator(".cursor-hover-target")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(cursor).toHaveCSS("display", "none");
});
