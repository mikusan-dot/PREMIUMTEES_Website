import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useSeo } from '@/hooks/useSeo';
import { useCategories, FALLBACK_CATEGORY_IMAGE } from '@/hooks/useCategories';
import { ProductBrowser } from '@/components/product/ProductBrowser';
import { GridMessage } from '@/components/product/ProductListingPage';

const linkClass = 'mt-5 inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-black underline decoration-brand-accent decoration-2 underline-offset-4';

export const CategoryPage = () => {
  const { slug } = useParams();
  const { categories } = useCategories();
  const { data: category, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['category', slug],
    queryFn: async () => (await api.get(`/categories/${encodeURIComponent(slug)}`)).data.category,
    retry: (count, err) => err?.response?.status !== 404 && count < 2,
  });

  useSeo({
    title: category ? category.seoTitle || `${category.name} | Premium Tees` : undefined,
    description: category ? category.seoDescription || category.description : undefined,
    image: category?.bannerImage || category?.image,
  });

  if (isLoading) {
    return (
      <section className="py-12"><div className="container-premium"><div className="h-56 animate-pulse bg-brand-white" /></div></section>
    );
  }

  if (isError || !category) {
    const notFound = error?.response?.status === 404;
    return (
      <section className="py-20">
        <div className="container-premium grid">
          <GridMessage
            title={notFound ? 'Category not found.' : "We couldn't load this category."}
            text={notFound ? 'It may have been renamed or is no longer available.' : 'Check your connection and try again.'}
            action={notFound ? <Link to="/categories" className={linkClass}>Browse all categories</Link> : <button type="button" onClick={() => refetch()} className={linkClass}>Try again</button>}
          />
          {notFound && categories.length > 0 && (
            <ul className="mt-6 flex flex-wrap justify-center gap-3">
              {categories.map((c) => (
                <li key={c.slug}><Link to={`/category/${c.slug}`} className="inline-flex min-h-[44px] items-center border border-brand-border px-4 text-sm text-brand-charcoal hover:border-brand-black">{c.name}</Link></li>
              ))}
            </ul>
          )}
        </div>
      </section>
    );
  }

  const banner = category.bannerImage || category.image || FALLBACK_CATEGORY_IMAGE;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-brand-night">
        <img
          src={banner}
          alt=""
          decoding="async"
          onError={(e) => { e.currentTarget.src = FALLBACK_CATEGORY_IMAGE; e.currentTarget.onerror = null; }}
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-55"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-night/85 via-brand-night/55 to-brand-night/10" />
        <div className="container-premium flex min-h-[220px] flex-col justify-end py-9 md:min-h-[300px] md:py-12">
          <nav className="mb-4 text-xs text-white/60" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white">Home</Link> <span>/</span>{' '}
            <Link to="/categories" className="hover:text-white">Categories</Link> <span>/</span>{' '}
            <span className="text-white">{category.name}</span>
          </nav>
          <h1 className="font-serif text-4xl leading-[0.95] text-white md:text-6xl">{category.name}</h1>
          {category.description && <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">{category.description}</p>}
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
            {category.productCount} {category.productCount === 1 ? 'piece' : 'pieces'}
          </p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container-premium">
          <ProductBrowser
            queryKey="category-products"
            fixedParams={{ category: category.slug }}
            emptyTitle={`No ${category.name.toLowerCase()} match your filters.`}
            emptyText={category.productCount === 0 ? 'New pieces are on the way — check back soon.' : 'Try a different size, colour or price range.'}
          />
        </div>
      </section>
    </>
  );
};

export default CategoryPage;
