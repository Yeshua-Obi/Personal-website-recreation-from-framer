const copyFields = ["title", "category", "categories", "description", "status", "content", "services", "location", "date", "role", "credit", "disclosure", "sourceUrl", "accent"];

export function publishedRecords(records) {
  const slugs = new Set();
  return records.filter(project => {
    const eligible = project.status === "published"
      && typeof project.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)
      && typeof project.title === "string" && project.title.trim()
      && typeof project.description === "string" && project.description.trim()
      && Array.isArray(project.content) && project.content.some(paragraph => typeof paragraph === "string" && paragraph.trim());
    if (!eligible || slugs.has(project.slug)) return false;
    slugs.add(project.slug);
    return true;
  });
}

export function projectDocument(project, sortOrder) {
  const document = {
    _id: `project.${project.slug}`, _type: "project",
    slug: { _type: "slug", current: project.slug }, sortOrder,
    showOnHome: project.showOnHome !== false,
    showInCarousel: project.showInCarousel === true,
    showInHomeGrid: project.showInHomeGrid === true,
  };
  for (const field of copyFields) if (project[field] !== undefined) document[field] = structuredClone(project[field]);
  if (project.sections) document.sections = project.sections.map((section, index) => ({ _key: `section-${index}`, _type: "object", ...structuredClone(section) }));
  return document;
}

export function siteDocument(site) {
  const document = { _id: "site-settings", _type: "siteSettings" };
  for (const field of ["displayName", "name", "role", "tagline", "intro", "biography", "about", "personalNote", "email", "phone"]) {
    if (site[field] !== undefined) document[field] = structuredClone(site[field]);
  }
  document.socials = site.socials.map((social, index) => ({ _key: `social-${index}`, _type: "object", ...social }));
  return document;
}

export function sourceKey(source) {
  const url = new URL(source);
  if (url.protocol !== "https:") throw new Error("Migration media must use HTTPS.");
  url.search = "";
  return url.href;
}

export function assetKey(source, preview = false) {
  return `${preview ? "preview" : "original"}:${sourceKey(source)}`;
}
