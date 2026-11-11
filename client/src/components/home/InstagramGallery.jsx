import { Instagram } from 'lucide-react';

const FALLBACK_URL = 'https://www.instagram.com/';

const handleFromUrl = (url) => {
  try {
    const path = new URL(url).pathname.replace(/\//g, '');
    return path ? `@${path}` : '@unhingedco';
  } catch {
    return '@unhingedco';
  }
};

export const InstagramGallery = ({ images = [], fallbackImages = [], url = '' }) => {
  const unique = [...new Set([...(images || []), ...(fallbackImages || [])].filter(Boolean))].slice(0, 6);
  if (unique.length === 0) return null;

  const href = url || FALLBACK_URL;

  return (
    <section id="instagram" className="bg-brand-offwhite py-16 md:py-24">
      <div className="container-premium">
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-brand-accent">Follow the studio</p>
            <h2 className="text-3xl leading-tight tracking-tight text-brand-black md:text-4xl">From the daily rotation.</h2>
          </div>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-black transition-colors hover:text-brand-accent"
          >
            <Instagram className="h-4 w-4" />
            {handleFromUrl(href)}
          </a>
        </div>

        <div className="grid gap-6 lg:gap-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {unique.map((src, index) => (
            <a
              key={`${src}-${index}`}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label="View on Instagram"
              className="group relative block overflow-hidden rounded-xl border border-white/10 dark:border-white/10 bg-[#202020] dark:bg-[#202020] shadow-none hover:shadow-[0_16px_32px_-16px_rgba(0,0,0,0.20)] transition-all duration-300"
            >
              <span className="absolute inset-0 aspect-square">
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </span>
              <span className="absolute inset-0 flex items-center justify-center bg-brand-night/0 text-white opacity-0 transition-all duration-300 group-hover:bg-brand-night/45 group-hover:opacity-100">
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
