import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { studioEnvironment } from "./environment";
import { SuggestDetails } from "./project-suggestions";
import ProjectOrder from "./project-order";
import { schemaTypes } from "./schema";

export default defineConfig({
  name: "portfolio",
  title: "Yeshua Obi — Portfolio",
  ...studioEnvironment(),
  tools: [{name:"priority", title:"Project priority", component:ProjectOrder}],
  plugins: [structureTool({ structure: S => S.list().title("Portfolio").items([
    S.documentTypeListItem("project").title("Projects"),
    S.listItem().title("Profile, images & contact").child(S.document().schemaType("siteSettings").documentId("site-settings")),
  ]) })],
  schema: { types: schemaTypes },
  document: { actions:(actions,context)=>context.schemaType === "project" ? [...actions,SuggestDetails] : actions, newDocumentOptions: options => options.filter(option => option.templateId !== "siteSettings") },
});
