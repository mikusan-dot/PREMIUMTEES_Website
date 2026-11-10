import { useEffect } from 'react';

const BASE_TITLE = 'Premium Tees | Minimalist T-Shirt Brand';

const setMeta = (selector, attr, key, value) => {
  let el = document.head.querySelector(selector);
  if (!value) return;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
};

/** Sets the document title, description and Open Graph tags for the current page; restores the defaults on leave. */
export const useSeo = ({ title, description, image } = {}) => {
  useEffect(() => {
    if (!title) return undefined;
    const previousTitle = document.title;
    const descEl = document.head.querySelector('meta[name="description"]');
    const previousDescription = descEl?.getAttribute('content');
    document.title = title;
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:image"]', 'property', 'og:image', image);
    return () => {
      document.title = previousTitle || BASE_TITLE;
      if (previousDescription) descEl?.setAttribute('content', previousDescription);
    };
  }, [title, description, image]);
};
