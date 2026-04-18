import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, path.resolve(__dirname, '.'), '');
  const siteUrl = (env.APP_URL || env.VITE_PUBLIC_SITE_URL || '')
    .trim()
    .replace(/\/+$/, '');

  const seoExtraLinks = siteUrl
    ? `<link rel="canonical" href="${siteUrl}/" />\n    <meta property="og:url" content="${siteUrl}/" />`
    : '';

  const ogImageHref = siteUrl
    ? `${siteUrl}/assets/images/1.jpeg`
    : './assets/images/1.jpeg';

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'html-seo-placeholders',
        transformIndexHtml(html) {
          return html
            .replace('%SEO_EXTRA_LINKS%', seoExtraLinks)
            .replaceAll('%SEO_OG_IMAGE%', ogImageHref);
        },
      },
    ],
    build: {
      outDir: path.resolve(__dirname, '..'),
      emptyOutDir: false,
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
