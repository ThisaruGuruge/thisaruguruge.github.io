// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { visit } from 'unist-util-visit';

// Custom rehype plugin to add loading="lazy" to all images
function rehypeImgLazy() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img') {
        node.properties = node.properties || {};
        node.properties.loading = 'lazy';
      }
    });
  };
}

export default defineConfig({
  site: 'https://thisaruguruge.github.io',
  integrations: [tailwind(), sitemap()],
  output: 'static',
  trailingSlash: 'always',
  vite: {
    ssr: {
      noExternal: ['@astrojs/tailwind']
    }
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    },
    rehypePlugins: [rehypeImgLazy]
  }
});
