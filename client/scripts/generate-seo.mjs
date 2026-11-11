// Writes public/robots.txt and public/sitemap.xml for the configured site URL.
// Runs automatically before `npm run build`. Set VITE_SITE_URL on Render (e.g. https://unhinged-co.onrender.com,
// later https://unhingedco.com) so canonical URLs, the sitemap and robots.txt all point at the live domain.
import { writeFileSync } from 'node:fs';
const site = (process.env.VITE_SITE_URL || 'https://unhinged-co.onrender.com').replace(/\/+$/, '');
const paths = ['/', '/shop', '/new-arrivals', '/best-sellers', '/sale', '/categories', '/collections', '/about', '/contact', '/privacy', '/terms'];
const today = new Date().toISOString().slice(0, 10);
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
  .map((p) => `  <url><loc>${site}${p === '/' ? '' : p}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n')}\n</urlset>\n`;
writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml);
writeFileSync(
  new URL('../public/robots.txt', import.meta.url),
  `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout\nDisallow: /cart\n\nSitemap: ${site}/sitemap.xml\n`,
);
console.log(`SEO files written for ${site}`);
