import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSeo } from '@/hooks/useSeo';
import { useCategories, FALLBACK_CATEGORY_IMAGE } from '@/hooks/useCategories';
import { GridMessage, ProductGridSkeleton } from '@/components/product/ProductListingPage';

export const Categories = () => {
  const { categories, isLoading, isError, refetch } = useCategories();
  useSeo({ title: 'Shop by Category', description: 'Browse T-shirts, drop shoulder, hoodies, full sleeves and sweatshirts from Unhinged Co.' });

  return (
    <section className="py-12 md:py-20">
      <div className="container-premium">
        <nav className="mb-8 text-sm text-brand-muted" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand-black">Home</Link> <span>/</span> <span className="text-brand-black">Categories</span>
        </nav>
        <div className="mb-10 border-b border-brand-border pb-7">
          <h1 className="mb-2 text-4xl font-bold text-brand-black">Shop by category</h1>
          <p className="text-brand-muted">Find your fit.</p>
        </div>
        {isLoading ? (
          <ProductGridSkeleton count={5} />
        ) : isError ? (
          <div className="grid"><GridMessage title="We couldn't load categories." text="Check your connection and try again." action={<button type="button" onClick={() => refetch()} className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-black underline decoration-brand-accent decoration-2 underline-offset-4">Try again</button>} /></div>
        ) : categories.length === 0 ? (
          <div className="grid"><GridMessage title="No categories yet." text="Browse everything in the shop." action={<Link to="/shop" className="mt-5 inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-black underline decoration-brand-accent decoration-2 underline-offset-4">Shop all</Link>} /></div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {categories.map((c) => (
              <Link key={c.slug} to={`/category/${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-lg border border-brand-border bg-brand-offwhite">
                <img src={c.image || FALLBACK_CATEGORY_IMAGE} alt={c.name} loading="lazy" onError={(e) => { e.currentTarget.src = FALLBACK_CATEGORY_IMAGE; e.currentTarget.onerror = null; }} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                <span className="absolute inset-0 bg-gradient-to-t from-brand-night/80 via-brand-night/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-5">
                  <div className="min-w-0">
                    <h2 className="font-serif text-lg leading-snug text-white md:text-2xl">{c.name}</h2>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">{c.productCount} {c.productCount === 1 ? 'piece' : 'pieces'}</p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 text-white transition-colors group-hover:bg-white group-hover:text-brand-night"><ArrowRight className="h-4 w-4" /></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
export default Categories;
