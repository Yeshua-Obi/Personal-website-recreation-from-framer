import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { studioEnvironment } from "./environment";
import { SuggestDetails } from "./project-suggestions";
import {orderableDocumentListDeskItem} from "@sanity/orderable-document-list";
import { schemaTypes } from "./schema";

export default defineConfig({
  name: "portfolio",
  title: "Yeshua Obi — Portfolio",
  ...studioEnvironment(),
  plugins: [structureTool({ structure: (S, context) => S.list().title("Portfolio").items([
    orderableDocumentListDeskItem({type:"project",title:"Projects",id:"project",S,context}),
    S.listItem().title("Profile, images & contact").child(S.document().schemaType("siteSettings").documentId("site-settings")),
  ]) })],
  schema: { types: schemaTypes },
  document: { actions:(actions,context)=>context.schemaType === "project" ? [...actions,SuggestDetails] : actions, newDocumentOptions: options => options.filter(option => option.templateId !== "siteSettings") },
});
