// Single source of truth for the storefront brand. Every value can be overridden from
// Admin -> Settings (served by /api/settings/public); these are the fallbacks used while
// loading or if the server is unreachable.
export const BRAND = {
  name: 'Unhinged Co.',
  wordmark: 'UNHINGED CO.',
  tagline: 'Wear Without Limits.',
  description: 'Unhinged Co. is a premium streetwear brand from Bangladesh. Wear Without Limits.',
  logoUrl: '',
  faviconUrl: '',
  supportEmail: 'support@unhingedco.com',
  phone: '+880 1700 000000',
  address: 'Dhaka, Bangladesh',
  instagramUrl: '',
  facebookUrl: '',
  tiktokUrl: '',
  // Canonical site URL used for SEO tags (override with VITE_SITE_URL at build time).
  siteUrl: (import.meta.env.VITE_SITE_URL || 'https://unhinged-co.onrender.com').replace(/\/+$/, ''),
};
