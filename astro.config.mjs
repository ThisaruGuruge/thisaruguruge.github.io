// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://thisaru.dev',
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
    }
  }
});
