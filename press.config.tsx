import { defineConfig } from "fumapress";
import { fumadocsMdx } from "fumapress/adapters/mdx";
import { flexsearchPlugin } from "fumapress/plugins/flexsearch";
import { llmsPlugin } from "fumapress/plugins/llms.txt";
import { docs } from "./.source/server";

export default defineConfig({
  content: docs.toFumadocsSource(),
  site: {
    name: "LabWiki",
    baseUrl: "https://cug-cs-632.github.io/labwiki/",
  },
})
  .plugins(flexsearchPlugin(), llmsPlugin())
  .adapters(fumadocsMdx());
