import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { ProductCard } from '@/components/product/ProductCard';
import { dedupeProducts } from '@/lib/badges';

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="overflow-hidden rounded-lg border border-brand-border bg-brand-white">
        <div className="aspect-[4/5] animate-pulse bg-brand-offwhite" />
        <div className="space-y-3 p-5">
          <div className="h-4 w-3/4 animate-pulse rounded bg-brand-offwhite" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-brand-offwhite" />
          <div className="h-10 w-full animate-pulse rounded bg-brand-offwhite" />
        </div>
      </div>
    ))}
  </div>
);

export const GridMessage = ({ title, text, action }) => (
  <div className="col-span-full border border-dashed border-brand-border bg-brand-white px-6 py-14 text-center">
    <p className="text-sm font-medium text-brand-black">{title}</p>
    {text && <p className="mt-1 text-sm text-brand-muted">{text}</p>}
    {action}
  </div>
);

export const ProductListingPage = ({ title, subtitle, queryKey, params, emptyTitle, emptyText }) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => (await api.get('/products', { params })).data.products,
  });
  const products = dedupeProducts(data || []);

  return (
    <section className="py-12 md:py-20">
      <div className="container-premium">
        <nav className="mb-8 text-sm text-brand-muted" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand-black">Home</Link> <span>/</span> <span className="text-brand-black">{title}</span>
        </nav>
        <div className="mb-10 border-b border-brand-border pb-7">
          <h1 className="mb-2 text-4xl font-bold text-brand-black">{title}</h1>
          <p className="text-brand-muted">{subtitle}</p>
        </div>
        {isLoading ? (
          <ProductGridSkeleton />
        ) : isError ? (
          <GridMessage
            title="We couldn't load products."
            text="Check your connection and try again."
            action={<button type="button" onClick={() => refetch()} className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-black underline decoration-brand-accent decoration-2 underline-offset-4">Try again</button>}
          />
        ) : products.length === 0 ? (
          <GridMessage
            title={emptyTitle}
            text={emptyText}
            action={<Link to="/shop" className="mt-5 inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-black underline decoration-brand-accent decoration-2 underline-offset-4">Browse the shop</Link>}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id || p.slug} product={p} />)}
          </div>
        )}
      </div>
    </section>
  );
};
