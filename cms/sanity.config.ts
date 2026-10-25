import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { studioEnvironment } from "./environment";
import { schemaTypes } from "./schema";

export default defineConfig({
  name: "portfolio",
  title: "Yeshua Obi — Portfolio",
  ...studioEnvironment(),
  plugins: [structureTool({ structure: S => S.list().title("Portfolio").items([
    S.documentTypeListItem("project").title("Projects"),
    S.listItem().title("About & contact").child(S.document().schemaType("siteSettings").documentId("site-settings")),
  ]) })],
  schema: { types: schemaTypes },
  document: { newDocumentOptions: options => options.filter(option => option.templateId !== "siteSettings") },
});
