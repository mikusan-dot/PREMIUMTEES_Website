import { useEffect } from 'react';
import { useBrand } from '@/hooks/useStoreSettings';
import { BRAND } from '@/config/brand';

const setLink = (rel, href, extra = {}) => {
  let el = document.head.querySelector(`link[rel="${rel}"]${extra.sizes ? `[sizes="${extra.sizes}"]` : ''}`);
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
  Object.entries(extra).forEach(([k, v]) => el.setAttribute(k, v));
  el.setAttribute('href', href);
};
const setMeta = (attr, key, value) => {
  if (!value) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', value);
};

// Keeps site-wide <head> data in sync with the admin-editable brand: favicon, site name,
// canonical URL and Open Graph defaults. Page titles are handled per page by useSeo().
export const BrandHead = () => {
  const brand = useBrand();
  useEffect(() => {
    if (brand.faviconUrl) setLink('icon', brand.faviconUrl, { type: '' });
    setMeta('property', 'og:site_name', brand.name);
    setMeta('property', 'og:type', 'website');
    setMeta('name', 'application-name', brand.name);
    setMeta('name', 'apple-mobile-web-app-title', brand.name);
    setMeta('name', 'twitter:card', 'summary_large_image');
  }, [brand.faviconUrl, brand.name]);

  useEffect(() => {
    const url = `${BRAND.siteUrl}${window.location.pathname}`.replace(/\/+$/, '') || BRAND.siteUrl;
    setLink('canonical', url);
    setMeta('property', 'og:url', url);
  });
  return null;
};
