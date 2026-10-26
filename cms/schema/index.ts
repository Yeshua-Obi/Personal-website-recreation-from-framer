import { defineArrayMember, defineField, defineType } from "sanity";

import { ProjectPosition } from "../project-position";
import { AssumptionField } from "../project-suggestions";

const paragraphs = () => ({ type: "array", of: [defineArrayMember({ type: "text", rows: 4 })] });
const image = (name: string, title: string) => defineField({ name, title, type: "image", options: { hotspot: true }, fields: [
  defineField({ name: "alt", title: "Image description", type: "string", validation: rule => rule.required() }),
] });
const categories = [
  { title: "Brand systems", value: "brand-systems" },
  { title: "Digital products", value: "digital-products" },
  { title: "AI workflows", value: "ai-workflows" },
  { title: "Visual storytelling", value: "visual-storytelling" },
];

const project = defineType({
  name: "project", title: "Project", type: "document",
  groups: [
    { name: "overview", title: "Overview", default: true },
    { name: "story", title: "Story" },
    { name: "media", title: "Images & films" },
    { name: "credits", title: "Credits" },
    { name: "publishing", title: "Publishing" },
  ],
  initialValue: async (_params, context) => {
    const last = await context.getClient({apiVersion:"2025-02-19"}).fetch<number | null>(' *[_type == "project"] | order(sortOrder desc)[0].sortOrder', {}, {perspective:"raw"});
    return {sortOrder:(last ?? 0)+1,status:"draft",showOnHome:true};
  },
  fields: [
    defineField({ name: "title", title: "Project title", type: "string", group: "overview", validation: rule => rule.required() }),
    defineField({ name: "slug", title: "Page address", type: "slug", group: "publishing", options: { source: "title", maxLength: 96 }, description: "Keep existing addresses unchanged so saved links continue to work.", validation: rule => rule.required().custom(value => !value?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) ? true : "Use lowercase words separated by hyphens.") }),
    defineField({ name: "status", title: "Visibility", type: "string", group: "publishing", options: { list: [{ title: "Draft — hidden from the website", value: "draft" }, { title: "Published", value: "published" }], layout: "radio" }, initialValue: "draft", validation: rule => rule.required() }),
    defineField({ name: "showOnHome", title: "Show on the homepage", type: "boolean", group: "publishing", initialValue: true, description: "Published projects can stay in Work without appearing on the homepage." }),
    defineField({ name: "sortOrder", title: "Project position", type: "number", group: "publishing", components:{input:ProjectPosition}, readOnly:true, description:"Use the Project priority tab to drag projects into position. New projects start after the last priority value.", validation: rule => rule.required().integer().min(0) }),
    defineField({ name: "brief", title: "Project brief for suggestions", type:"text", rows:8, group:"overview", description:"Describe the project in your own words, then choose Suggest missing details from the document actions. Suggestions use this text only; media analysis is not enabled." }),
    defineField({ name:"assumedFields", title:"Assumptions awaiting review", type:"array", of:[{type:"string"}], group:"overview", description:"These fields were suggested from your brief. Review them and remove each name when confirmed. This list never appears on the website." }),
    defineField({ name: "category", components:{field:AssumptionField}, title: "Short discipline label", type: "string", group: "overview", validation: rule => rule.required() }),
    defineField({ name: "categories", components:{field:AssumptionField}, title: "Collections", type: "array", group: "overview", of: [{ type: "string" }], options: { list: categories }, validation: rule => rule.required().min(1).unique() }),
    defineField({ name: "description", components:{field:AssumptionField}, title: "Project summary", type: "text", rows: 5, group: "overview", validation: rule => rule.required() }),
    defineField({ name: "content", components:{field:AssumptionField}, title: "Story paragraphs", ...paragraphs(), group: "story", description: "Use these paragraphs for a simple story, or add structured story sections below." }),
    defineField({ name: "sections", title: "Story sections", type: "array", group: "story", of: [defineArrayMember({ type: "object", fields: [
      defineField({ name: "heading", title: "Section heading", type: "string", validation: rule => rule.required() }),
      defineField({ name: "paragraphs", title: "Paragraphs", ...paragraphs(), validation: rule => rule.required().min(1) }),
    ], preview: { select: { title: "heading" } } })] }),
    defineField({ ...image("image", "Cover image"), group: "media", validation: rule => rule.required() }),
    defineField({ name: "gallery", title: "Gallery", type: "array", group: "media", of: [defineArrayMember({ type: "image", options: { hotspot: true }, fields: [
      defineField({ name: "alt", title: "Image description", type: "string", validation: rule => rule.required() }),
    ] })] }),
    defineField({ name: "video", title: "Homepage hero & grid preview", type: "file", group: "media", options: { accept: "video/mp4,video/webm" }, description: "This preview drives both the homepage hero and project cards. Use a short, compressed MP4 or WebM; without one, the cover and gallery images animate instead." }),
    defineField({ name: "filmUrl", title: "Hosted full film URL", type: "url", group: "media", description: "Existing hosted film. Uploading a full project film above takes priority.", validation: rule => rule.uri({scheme: ["https"]}) }),
    defineField({ name: "film", title: "Full project film", type: "file", group: "media", options: { accept: "video/*" } }),
    defineField({ name: "accent", title: "Project colour", type: "string", group: "overview", validation: rule => rule.regex(/^#[0-9a-fA-F]{6}$/, { name: "hex colour" }) }),
    defineField({ name: "services", title: "Services", type: "array", of: [{ type: "string" }], group: "credits" }),
    ...["location", "role", "credit", "disclosure"].map(name => defineField({ name, title: name[0].toUpperCase() + name.slice(1), type: name === "disclosure" ? "text" : "string", group: "credits" })),
    defineField({ name: "date", title: "Project date", type: "date", group: "credits" }),
    defineField({ name: "sourceUrl", title: "Original case study", type: "url", group: "credits", readOnly: true }),
  ],
  validation: rule => rule.custom(document => {
    const hasCopy = (value: unknown) => Array.isArray(value) && value.some(paragraph => typeof paragraph === "string" && paragraph.trim());
    const sections = Array.isArray(document?.sections) ? document.sections : [];
    return document?.status !== "published" || hasCopy(document?.content) || sections.some(section => section && hasCopy(section.paragraphs))
      ? true : "Add story paragraphs or a story section before publishing the project.";
  }),
  orderings: [{ title: "Website order", name: "websiteOrder", by: [{ field: "sortOrder", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "category", media: "image" } },
});

const siteSettings = defineType({
  name: "siteSettings", title: "Profile, images & contact", type: "document",
  fields: [
    ...["displayName", "name", "role", "tagline"].map(name => defineField({ name, title: ({ displayName: "Display name", name: "Full name", role: "Role", tagline: "Tagline" })[name], type: "string", validation: rule => rule.required() })),
    defineField({ name: "intro", title: "Introduction", type: "text", rows: 4, validation: rule => rule.required() }),
    defineField({ name: "biography", title: "Biography", ...paragraphs(), validation: rule => rule.required().min(1) }),
    defineField({ name: "about", title: "About paragraphs", ...paragraphs() }),
    defineField({ name: "personalNote", title: "Personal note", type: "text", rows: 3 }),
    image("portrait", "About page portrait"),
    image("mark", "Logo"),
    defineField({ name: "email", title: "Email", type: "email", validation: rule => rule.required() }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "socials", title: "Social links", type: "array", of: [defineArrayMember({ type: "object", fields: [
      defineField({ name: "label", title: "Name", type: "string", validation: rule => rule.required() }),
      defineField({ name: "url", title: "Address", type: "url", validation: rule => rule.required().uri({ scheme: ["https"] }) }),
    ], preview: { select: { title: "label", subtitle: "url" } } })] }),
  ],
  preview: { prepare: () => ({ title: "Profile, images & contact" }) },
});

export const schemaTypes = [project, siteSettings];
