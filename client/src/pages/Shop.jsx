import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { ProductCard } from '@/components/product/ProductCard';
import { GridMessage, ProductGridSkeleton } from '@/components/product/ProductListingPage';
import { dedupeProducts, isSaleActive } from '@/lib/badges';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CATEGORIES = [
  { name: 'Oversized T-shirts', slug: 'oversized-t-shirts' },
  { name: 'Regular Fit T-shirts', slug: 'regular-fit-t-shirts' },
  { name: 'Drop Shoulder T-shirts', slug: 'drop-shoulder-t-shirts' },
  { name: 'Graphic T-shirts', slug: 'graphic-t-shirts' },
  { name: 'Plain T-shirts', slug: 'plain-t-shirts' },
  { name: 'Polo T-shirts', slug: 'polo-t-shirts' },
  { name: "Men's Collection", slug: 'mens-collection' },
  { name: "Women's Collection", slug: 'womens-collection' },
  { name: 'Unisex Collection', slug: 'unisex-collection' },
  { name: 'Couple T-shirts', slug: 'couple-t-shirts' },
  { name: 'Limited Edition', slug: 'limited-edition' },
  { name: 'Seasonal Collections', slug: 'seasonal-collections' },
  { name: 'Sale Collection', slug: 'sale-collection' },
];

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const effectivePrice = (product) => {
  const price = Number(product.price) || 0;
  return isSaleActive(product) ? Number(product.salePrice) : price;
};

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') || '';
  const setSearch = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('q', value);
    else next.delete('q');
    setSearchParams(next, { replace: true });
  };
  const [category, setCategory] = useState(() => searchParams.get('category') || 'All');
  const [sort, setSort] = useState('featured');
  const [priceRange, setPriceRange] = useState('all');

  useEffect(() => {
    setCategory(searchParams.get('category') || 'All');
  }, [searchParams]);

  const selectCategory = (nextCategory) => {
    setCategory(nextCategory);
    const next = new URLSearchParams(searchParams);
    if (nextCategory === 'All') next.delete('category');
    else next.set('category', nextCategory);
    setSearchParams(next, { replace: true });
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => (await api.get('/products', { params: { limit: 200 } })).data.products,
  });
  const products = dedupeProducts(data || []);

  const query = search.trim().toLowerCase();
  const selectedCategory = slugify(category);
  const filtered = products.filter((p) => {
    const matchSearch =
      !query ||
      [p.name, p.sku, p.fit, p.fabric, p.category, ...(p.categoryIds || [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    const productCategories = [p.category, ...(p.categoryIds || [])].filter(Boolean).map(slugify);
    const matchCat = category === 'All' || productCategories.includes(selectedCategory);
    const price = effectivePrice(p);
    const matchPrice =
      priceRange === 'all' ||
      (priceRange === '0-1000' && price <= 1000) ||
      (priceRange === '1000-1500' && price > 1000 && price <= 1500) ||
      (priceRange === '1500+' && price > 1500);
    return matchSearch && matchCat && matchPrice;
  }).sort((a, b) => {
    if (sort === 'priceAsc') return effectivePrice(a) - effectivePrice(b);
    if (sort === 'priceDesc') return effectivePrice(b) - effectivePrice(a);
    if (sort === 'newest') return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    return 0;
  });

  return (
    <section className="py-12 md:py-20">
      <div className="container-premium">
        <div className="flex flex-col lg:flex-row gap-6 mb-12 items-start lg:items-center">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-brand-black mb-2">Shop</h1>
            <p className="text-brand-muted">Discover our collections.</p>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Input
              type="search"
              placeholder="Search products or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 max-w-md sm:w-80"
            />
            <Button type="submit">Search</Button>
          </form>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Filters sidebar */}
          <div className="space-y-6 lg:col-span-3 lg:space-y-8">
            <div>
              <h3 className="font-bold text-brand-black mb-4">Category</h3>
              <div className="space-y-2">
                <Button variant={category === 'All' ? 'default' : 'ghost'} size="sm" className="w-full text-left justify-start" onClick={() => selectCategory('All')}>
                  All Categories
                </Button>
                {CATEGORIES.map((c) => (
                  <Button key={c.slug} variant={category === c.slug ? 'default' : 'ghost'} size="sm" className="w-full text-left justify-start" onClick={() => selectCategory(c.slug)}>
                    {c.name}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-brand-black mb-4">Sort by</h3>
              <div className="space-y-2">
                {['featured', 'newest', 'priceAsc', 'priceDesc'].map((s) => (
                  <Button key={s} variant={sort === s ? 'default' : 'ghost'} size="sm" className="w-full text-left justify-start" onClick={() => setSort(s)}>
                    {s === 'featured' ? 'Featured' : s === 'newest' ? 'Newest' : s === 'priceAsc' ? 'Price: Low to High' : 'Price: High to Low'}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-brand-black mb-4">Price Range</h3>
              <div className="space-y-2">
                {['all', '0-1000', '1000-1500', '1500+'].map((r) => (
                  <Button key={r} variant={priceRange === r ? 'default' : 'ghost'} size="sm" className="w-full text-left justify-start" onClick={() => setPriceRange(r)}>
                    {r === 'all' ? 'All' : r === '1500+' ? '৳1,500+' : `৳${r.replace('0-', '0 - ৳')}`}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Product grid */}
          <div className="lg:col-span-9">
            <div className="flex justify-between items-end mb-6">
              <p className="text-brand-muted text-sm">
                {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
              </p>
            </div>
            {isLoading ? (
              <ProductGridSkeleton count={8} />
            ) : isError ? (
              <div className="grid"><GridMessage title="We couldn't load products." text="Check your connection and try again." action={<button type="button" onClick={() => refetch()} className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-black underline decoration-brand-accent decoration-2 underline-offset-4">Try again</button>} /></div>
            ) : filtered.length === 0 ? (
              <div className="grid"><GridMessage title="No products found." text="Try a different search, category or price range." /></div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:gap-6 xl:grid-cols-3">
                {filtered.map((p) => <ProductCard key={p.id || p.slug} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
