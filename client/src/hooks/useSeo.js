import { useEffect } from 'react';
import { useBrand } from '@/hooks/useStoreSettings';

const setMeta = (attr, key, value) => {
  if (!value) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
};

/**
 * Sets the document title, description and Open Graph tags for the current page.
 * Pass the page's own title (e.g. "Shop All"); the brand name is appended automatically.
 * With no title, the brand default "Brand | Tagline" is used.
 */
export const useSeo = ({ title, description, image } = {}) => {
  const brand = useBrand();
  useEffect(() => {
    const full = title ? `${title} | ${brand.name}` : `${brand.name} | ${brand.tagline}`;
    const desc = description || brand.description;
    document.title = full;
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', full);
    setMeta('property', 'og:description', desc);
    setMeta('name', 'twitter:title', full);
    setMeta('name', 'twitter:description', desc);
    if (image) { setMeta('property', 'og:image', image); setMeta('name', 'twitter:image', image); }
    return () => {
      // Restore the brand default so pages that don't call useSeo never show a stale title.
      document.title = `${brand.name} | ${brand.tagline}`;
      setMeta('name', 'description', brand.description);
      setMeta('property', 'og:title', `${brand.name} | ${brand.tagline}`);
      setMeta('property', 'og:description', brand.description);
    };
  }, [title, description, image, brand.name, brand.tagline, brand.description]);
};
