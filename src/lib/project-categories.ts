import { selectPublishedProjects, type Project } from "./projects";

export const projectCategories = [
  { slug: "brand-systems", label: "Brand systems", title: "Brand Strategy & Visual Identity Design", description: "Explore Yeshua Obi’s brand strategy, visual identities, packaging and design systems, from discovery to a cohesive visual language.", intro: "A brand is a connected system of decisions: strategy, identity, language and the details people meet along the way. These projects bring those parts together across digital and physical touchpoints." },
  { slug: "digital-products", label: "Digital products", title: "Digital Product, Website & UX Design", description: "Selected website, e-commerce, UX and prototyping projects by Yeshua Obi, Brand & Systems Designer in Lagos, Nigeria.", intro: "Digital experiences give a brand somewhere useful to live. This collection includes website direction, online stores, UX strategy and prototypes, with attention to both the visual system and the people using it." },
  { slug: "ai-workflows", label: "AI workflows", title: "AI Workflow Design & Visualization", description: "AI-assisted visualization, compositing and presentation workflows by Yeshua Obi. Explore the NIBSS and SAKA case studies.", intro: "The useful part of AI is the workflow around it. These projects document AI-assisted architectural visualization, compositing and presentation work, turning complex spatial information into a clearer visual narrative." },
  { slug: "visual-storytelling", label: "Visual storytelling", title: "Visual Storytelling, Film & Visualization", description: "Film, cinematography, colour grading and architectural visualization by Yeshua Obi. Explore selected visual storytelling projects.", intro: "Images carry rhythm, atmosphere and meaning. This collection moves between architectural film, cinematography, colour grading and visualization, with each case study describing the work and the thinking behind it." },
] as const;

export type ProjectCategory = typeof projectCategories[number]["slug"];

export const categoryPageHref = (category: ProjectCategory) => `/portfolio/category/${category}`;

export function categoryHref(category?: ProjectCategory, expanded = false) {
  const params = new URLSearchParams({ view: "categories" });
  if (category) params.set("category", category);
  if (category && expanded) params.set("expanded", "1");
  return `/portfolio?${params}#${category ? `category-${category}` : "project-browser"}`;
}

export function projectsInCategory(projects: readonly Project[], category: ProjectCategory) {
  // Owner-editable metadata only; never infer categories from titles or footage.
  return selectPublishedProjects(projects).filter(project => project.categories?.includes(category));
}
