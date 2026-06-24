import { defineConfig } from "fumapress";
import { lucideIconsPlugin } from "fumadocs-core/source/plugins/lucide-icons";
import { fumadocsMdx } from "fumapress/adapters/mdx";
import { flexsearchPlugin } from "fumapress/plugins/flexsearch";
import { docs } from "./.source/server";
import { DocsPageWithoutActions } from "./src/docs-page";

export default defineConfig({
  mode: "static",
  content: docs.toFumadocsSource(),
  loaderOptions: {
    plugins: [lucideIconsPlugin()],
  },
  site: {
    name: "LabWiki",
    baseUrl: "https://cug-cs-632.github.io/labwiki/",
  },
})
  .layouts({
    page: DocsPageWithoutActions,
  })
  .plugins(flexsearchPlugin())
  .adapters(fumadocsMdx());
