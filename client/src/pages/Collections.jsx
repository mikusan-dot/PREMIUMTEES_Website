import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { api } from '@/services/api';
import { ProductCard } from '@/components/product/ProductCard';
import { GridMessage, ProductGridSkeleton } from '@/components/product/ProductListingPage';
import { dedupeProducts } from '@/lib/badges';

const FALLBACK = 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800';
const linkClass = 'mt-5 inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-black underline decoration-brand-accent decoration-2 underline-offset-4';

const Crumbs = ({ items }) => (
  <nav className="mb-8 text-sm text-brand-muted" aria-label="Breadcrumb">
    {items.map((item, i) => (
      <span key={item.label}>
        {i > 0 && <span> / </span>}
        {item.to ? <Link to={item.to} className="hover:text-brand-black">{item.label}</Link> : <span className="text-brand-black">{item.label}</span>}
      </span>
    ))}
  </nav>
);

export const Collections = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => (await api.get('/collections')).data.collections,
  });
  const collections = (data || []).filter((c) => c.productCount > 0 || c.productCount === undefined);

  return (
    <section className="py-12 md:py-20">
      <div className="container-premium">
        <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Collections' }]} />
        <div className="mb-10 border-b border-brand-border pb-7">
          <h1 className="mb-2 text-4xl font-bold text-brand-black">Collections</h1>
          <p className="text-brand-muted">Curated drops from the studio.</p>
        </div>
        {isLoading ? (
          <ProductGridSkeleton count={3} />
        ) : isError ? (
          <div className="grid"><GridMessage title="We couldn't load collections." text="Check your connection and try again." action={<button type="button" onClick={() => refetch()} className={linkClass}>Try again</button>} /></div>
        ) : collections.length === 0 ? (
          <div className="grid"><GridMessage title="New collections are on the way." text="Browse everything in the meantime." action={<Link to="/shop" className={linkClass}>Browse the shop</Link>} /></div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {collections.map((c) => (
              <Link key={c.id || c.slug} to={`/collections/${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-lg border border-brand-border bg-brand-offwhite">
                <img
                  src={c.image || FALLBACK}
                  alt={c.name}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = FALLBACK; e.currentTarget.onerror = null; }}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-brand-night/80 via-brand-night/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <h2 className="font-serif text-2xl leading-tight text-white">{c.name}</h2>
                    {c.description && <p className="mt-1 line-clamp-2 text-xs text-white/70">{c.description}</p>}
                    {c.productCount > 0 && <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">{c.productCount} {c.productCount === 1 ? 'piece' : 'pieces'}</p>}
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 text-white transition-colors group-hover:bg-white group-hover:text-brand-night">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export const CollectionDetail = () => {
  const { slug } = useParams();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['collection', slug],
    queryFn: async () => (await api.get(`/collections/${encodeURIComponent(slug)}`)).data,
    retry: (count, err) => err?.response?.status !== 404 && count < 2,
  });
  const notFound = error?.response?.status === 404;
  const collection = data?.collection;
  const products = dedupeProducts(data?.products || []);

  return (
    <section className="py-12 md:py-20">
      <div className="container-premium">
        <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Collections', to: '/collections' }, { label: collection?.name || '…' }]} />
        {isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : isError ? (
          <div className="grid">
            <GridMessage
              title={notFound ? 'Collection not found.' : "We couldn't load this collection."}
              text={notFound ? 'It may have ended or been renamed.' : 'Check your connection and try again.'}
              action={notFound ? <Link to="/collections" className={linkClass}>All collections</Link> : <button type="button" onClick={() => refetch()} className={linkClass}>Try again</button>}
            />
          </div>
        ) : (
          <>
            <div className="mb-10 border-b border-brand-border pb-7">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-accent">Collection</p>
              <h1 className="mb-2 text-4xl font-bold text-brand-black">{collection.name}</h1>
              {collection.description && <p className="max-w-xl text-brand-muted">{collection.description}</p>}
            </div>
            {products.length === 0 ? (
              <div className="grid"><GridMessage title="Pieces are coming soon." text="This collection has no products yet." action={<Link to="/shop" className={linkClass}>Browse the shop</Link>} /></div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
                {products.map((p) => <ProductCard key={p.id || p.slug} product={p} />)}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
