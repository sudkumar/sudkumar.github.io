import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import { remarkSandpack } from "remark-sandpack";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  prefetch: true,
  integrations: [
    react(),
    mdx({
      remarkPlugins: [remarkSandpack],
    }),
    tailwind(),
    sitemap(),
  ],
});
