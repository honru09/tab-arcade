import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages project site: https://honru09.github.io/tab-arcade/
export default defineConfig({
  site: 'https://honru09.github.io',
  base: '/tab-arcade',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
