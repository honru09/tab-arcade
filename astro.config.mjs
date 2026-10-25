import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Production site: https://tabarcade.online/ (GitHub Pages + custom domain)
export default defineConfig({
  site: 'https://tabarcade.online',
  base: '/',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
