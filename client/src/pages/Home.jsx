import { dedupeProducts } from '@/lib/badges';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { api } from '@/services/api';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { ProductSection } from '@/components/home/ProductSection';
import { Reviews } from '@/components/home/Reviews';
import { InstagramGallery } from '@/components/home/InstagramGallery';
import { Newsletter } from '@/components/home/Newsletter';
import { cn } from '@/lib/utils';

const HERO_IMAGE = 'https://images.pexels.com/photos/9558577/pexels-photo-9558577.jpeg?auto=compress&cs=tinysrgb&w=1400';
const PROMO_IMAGE = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1800';

const CATEGORY_FALLBACKS = [
  {
    name: 'Oversized T-Shirts',
    slug: 'oversized-t-shirts',
    description: 'Relaxed, dropped shoulders',
    image: 'https://images.pexels.com/photos/9558577/pexels-photo-9558577.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Regular Fit T-Shirts',
    slug: 'regular-fit-t-shirts',
    description: 'Clean, everyday cuts',
    image: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Drop Shoulder T-Shirts',
    slug: 'drop-shoulder-t-shirts',
    description: 'Easy, modern silhouettes',
    image: 'https://images.pexels.com/photos/4066293/pexels-photo-4066293.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Graphic T-Shirts',
    slug: 'graphic-t-shirts',
    description: 'Statement prints',
    image: 'https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Plain T-Shirts',
    slug: 'plain-t-shirts',
    description: 'The essentials',
    image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Polo T-Shirts',
    slug: 'polo-t-shirts',
    description: 'Smart-casual staples',
    image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

const CATEGORY_IMAGES = Object.fromEntries(CATEGORY_FALLBACKS.map((category) => [category.slug, category.image]));

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const money = (value) => `৳${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

const currentPrice = (product) => {
  const price = Number(product?.price) || 0;
  const sale = Number(product?.salePrice) || 0;
  return sale > 0 && sale < price ? sale : price;
};

const productImage = (product) => product?.images?.find(Boolean) || '';

const LookTile = ({ product, className, priority = false }) => (
  <Link
    to={`/product/${product.slug}`}
    className={cn('group relative block overflow-hidden bg-brand-offwhite', className)}
  >
    <img
      src={productImage(product)}
      alt={product.name}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-brand-night/80 via-brand-night/15 to-transparent" />
    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-6">
      <div className="min-w-0">
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-white/60">Shop the look</p>
        <h3 className="truncate font-serif text-xl text-white md:text-2xl">{product.name}</h3>
        <p className="mt-1 text-xs text-white/70">{money(currentPrice(product))}</p>
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 text-white transition-colors group-hover:bg-white group-hover:text-brand-night">
        <ArrowRight className="h-4 w-4" />
      </span>
    </div>
  </Link>
);

export const Home = () => {
  const settings = useStoreSettings();

  const {
    data: products = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['home-products'],
    queryFn: async () => {
      const { data } = await api.get('/products?limit=100');
      return data.products || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.categories || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const uniqueProducts = dedupeProducts(products);
  const sortedProducts = [...uniqueProducts].sort((a, b) =>
    String(b.createdAt || '').localeCompare(String(a.createdAt || '')),
  );
  const newArrivals = sortedProducts.slice(0, 8);
  // Best sellers are ranked by real units sold (soldCount); the admin flag only fills gaps.
  const rankedBest = uniqueProducts
    .filter((product) => Number(product.soldCount) > 0 || product.bestSeller)
    .sort((a, b) => (Number(b.soldCount) || 0) - (Number(a.soldCount) || 0));
  const newIds = new Set(newArrivals.map((product) => product.id));
  const distinctBest = rankedBest.filter((product) => !newIds.has(product.id));
  const bestSellers = (distinctBest.length > 0 ? distinctBest : rankedBest).slice(0, 8);
  const lookbook = sortedProducts.filter((product) => productImage(product)).slice(0, 3);
  const featuredProduct = sortedProducts.find((product) => productImage(product)) || null;
  const heroImage = featuredProduct ? productImage(featuredProduct) : HERO_IMAGE;
  const productGallery = [...new Set(sortedProducts.map(productImage).filter(Boolean))].slice(0, 6);

  const seenCategories = new Set();
  const categoryCards = [];
  categories.forEach((category) => {
    const slug = category.slug || slugify(category.name);
    if (!slug || seenCategories.has(slug)) return;
    seenCategories.add(slug);
    const matchedProduct = products.find(
      (product) =>
        (product.categoryIds || []).some((value) => value === category.id || value === slug || value === category.slug) &&
        productImage(product),
    );
    categoryCards.push({
      name: category.name,
      slug,
      description: category.description || 'Explore the collection',
      image: category.image || (matchedProduct && productImage(matchedProduct)) || CATEGORY_IMAGES[slug] || CATEGORY_IMAGES['oversized-t-shirts'],
    });
  });
  CATEGORY_FALLBACKS.forEach((category) => {
    if (seenCategories.has(category.slug)) return;
    seenCategories.add(category.slug);
    categoryCards.push(category);
  });
  const shownCategories = categoryCards.slice(0, 6);

  return (
    <>
      <section className="overflow-hidden bg-brand-offwhite">
        <div className="container-premium grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:py-20">
          <div className="lg:col-span-6 xl:col-span-5">
            <p className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-accent">
              <span className="h-px w-8 bg-brand-accent" />
              New collection · 2026
            </p>
            <h1 className="font-serif text-[3.15rem] leading-[0.92] tracking-[-0.03em] text-brand-black sm:text-6xl md:text-7xl xl:text-[5.5rem]">
              Wear your
              <br />
              <em className="font-normal italic">identity.</em>
            </h1>
            <p className="mt-7 max-w-md text-base leading-relaxed text-brand-charcoal/75">
              Minimalist premium t-shirts designed for everyday confidence. Clean fits, quality fabric,
              and timeless essentials — made for Bangladesh.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/shop"
                className="group inline-flex items-center justify-center gap-3 whitespace-nowrap bg-brand-black px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-white transition-colors hover:bg-brand-charcoal"
              >
                Explore Collection
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/new-arrivals"
                className="inline-flex items-center justify-center whitespace-nowrap border border-brand-black px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-black transition-colors hover:bg-brand-black hover:text-brand-white"
              >
                Shop New Arrivals
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-2 text-[9px] font-medium uppercase tracking-[0.14em] text-brand-muted sm:text-[10px] sm:tracking-[0.16em]">
              <span>Considered fits</span>
              <span>Quality cotton</span>
              <span>Made for everyday</span>
            </div>
          </div>

          <div className="relative lg:col-span-6 xl:col-span-7">
            <div className="relative h-[420px] overflow-hidden bg-brand-offwhite sm:h-[520px] lg:ml-auto lg:h-[610px] lg:max-w-[560px] xl:h-[660px] xl:max-w-[600px]">
              <img
                src={heroImage}
                alt={featuredProduct ? featuredProduct.name : 'Premium Tees editorial'}
                loading="eager"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.src = HERO_IMAGE;
                  event.currentTarget.onerror = null;
                }}
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-night/20 via-transparent to-transparent" />
              {featuredProduct && (
                <Link
                  to={`/product/${featuredProduct.slug}`}
                  className="absolute bottom-4 left-4 right-4 bg-brand-white/95 p-4 backdrop-blur transition-colors hover:bg-brand-white sm:right-auto sm:max-w-[250px]"
                >
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-brand-accent">Featured piece</p>
                  <p className="mt-1.5 truncate font-serif text-lg text-brand-black">{featuredProduct.name}</p>
                  <p className="mt-1 flex items-center justify-between gap-3 text-xs text-brand-muted">
                    <span>{money(currentPrice(featuredProduct))}</span>
                    <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-[0.14em] text-brand-black">
                      Shop
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </p>
                </Link>
              )}
            </div>
            <p className="mt-4 hidden text-right text-[9px] font-medium uppercase tracking-[0.28em] text-brand-muted lg:block">
              Designed in Dhaka · Delivered nationwide
            </p>
          </div>
        </div>
      </section>

      {isError && (
        <div className="border-y border-red-200 bg-red-50">
          <div className="container-premium flex flex-col gap-3 py-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <span>We couldn’t load the collection right now. Please try again.</span>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 self-start border border-red-300 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-red-100 disabled:opacity-60 sm:self-auto"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
              {isFetching ? 'Retrying' : 'Retry'}
            </button>
          </div>
        </div>
      )}

      <section className="border-t border-brand-border bg-brand-white py-16 md:py-24">
        <div className="container-premium">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-accent">Shop by category</p>
              <h2 className="text-3xl leading-tight tracking-tight text-brand-black md:text-4xl">Find your fit.</h2>
            </div>
            <Link
              to="/categories"
              className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-black"
            >
              All categories
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {shownCategories.map((category) => (
              <Link
                key={category.slug}
                to={`/shop?category=${encodeURIComponent(category.slug)}`}
                className="group relative aspect-[4/3] overflow-hidden bg-brand-offwhite"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-brand-night/80 via-brand-night/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-5">
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 font-serif text-base leading-snug text-white sm:text-lg md:text-xl">
                      {category.name}
                    </h3>
                    <p className="mt-1 truncate text-[9px] uppercase tracking-[0.12em] text-white/60 sm:text-[10px]">
                      {category.description}
                    </p>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/40 text-white transition-colors group-hover:bg-white group-hover:text-brand-night">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ProductSection
        eyebrow="Just landed"
        title="New arrivals."
        description="The latest cuts, colours, and weights to enter the studio. Available while stock lasts."
        products={newArrivals}
        isLoading={isLoading}
        viewAllHref="/new-arrivals"
      />

      <section className="relative overflow-hidden bg-brand-night">
        <img
          src={PROMO_IMAGE}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-night via-brand-night/65 to-brand-night/0" />
        <div className="container-premium relative z-10 flex min-h-[420px] items-center py-16 md:min-h-[520px]">
          <div className="max-w-xl">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">Limited release</p>
            <h2 className="font-serif text-4xl leading-[0.95] text-white md:text-6xl">
              The Core
              <br />
              <em className="font-normal italic">Edit.</em>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/65">
              A focused edit of the pieces we reach for most. Clean lines, considered fits, available
              while stock lasts.
            </p>
            <Link
              to="/shop"
              className="group mt-8 inline-flex items-center gap-3 bg-white px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-night transition-colors hover:bg-white/85"
            >
              Shop the Drop
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {bestSellers.length > 0 && (
        <ProductSection
          eyebrow="Most wanted"
          title="Best sellers."
          description="The pieces our customers keep coming back to, in the fits and colours that earned their place."
          products={bestSellers}
          viewAllHref="/best-sellers"
          className="bg-brand-offwhite"
        />
      )}

      {lookbook.length >= 2 && (
        <section className="bg-brand-white py-16 md:py-24">
          <div className="container-premium">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-accent">The lookbook</p>
                <h2 className="text-3xl leading-tight tracking-tight text-brand-black md:text-4xl">One tee. Three ways.</h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-muted">
                  Styling notes from the studio, built around the pieces in the current collection.
                </p>
              </div>
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-black"
              >
                Shop the story
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            {lookbook.length >= 3 ? (
              <div className="grid gap-3 md:grid-cols-2">
                <LookTile
                  product={lookbook[0]}
                  priority
                  className="h-[420px] md:row-span-2 md:h-full md:min-h-[620px]"
                />
                <div className="grid gap-3">
                  <LookTile product={lookbook[1]} className="h-[300px] md:h-[304px]" />
                  <LookTile product={lookbook[2]} className="h-[300px] md:h-[304px]" />
                </div>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {lookbook.map((product, index) => (
                  <LookTile key={product.id} product={product} priority={index === 0} className="h-[420px] md:h-[520px]" />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <Reviews />

      <InstagramGallery
        images={settings.instagramImages || []}
        fallbackImages={productGallery}
        url={settings.instagramUrl}
      />

      <Newsletter />
    </>
  );
};

export default Home;
