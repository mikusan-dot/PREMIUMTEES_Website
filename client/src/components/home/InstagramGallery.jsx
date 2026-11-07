import { Instagram } from 'lucide-react';

const FALLBACK_URL = 'https://www.instagram.com/';

const handleFromUrl = (url) => {
  try {
    const path = new URL(url).pathname.replace(/\//g, '');
    return path ? `@${path}` : '@premiumtees';
  } catch {
    return '@premiumtees';
  }
};

export const InstagramGallery = ({ images = [], fallbackImages = [], url = '' }) => {
  const unique = [...new Set([...(images || []), ...(fallbackImages || [])].filter(Boolean))].slice(0, 6);
  if (unique.length === 0) return null;

  const href = url || FALLBACK_URL;

  return (
    <section id="instagram" className="bg-white py-16 md:py-24">
      <div className="container-premium">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-accent">Follow the studio</p>
            <h2 className="text-3xl leading-tight tracking-tight text-brand-black md:text-4xl">From the daily rotation.</h2>
          </div>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-black transition-colors hover:text-brand-accent"
          >
            <Instagram className="h-4 w-4" />
            {handleFromUrl(href)}
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {unique.map((src, index) => (
            <a
              key={`${src}-${index}`}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label="View on Instagram"
              className="group relative aspect-square overflow-hidden bg-white"
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-brand-black/0 text-white opacity-0 transition-all duration-300 group-hover:bg-brand-black/45 group-hover:opacity-100">
                <Instagram className="h-6 w-6" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramGallery;
