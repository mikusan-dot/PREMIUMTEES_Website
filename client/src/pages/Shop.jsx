import { Link } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';
import { useCategories } from '@/hooks/useCategories';
import { ProductBrowser } from '@/components/product/ProductBrowser';

export const Shop = () => {
  const { categories } = useCategories();
  useSeo({ title: 'Shop All', description: 'Browse every Unhinged Co. piece: T-shirts, drop shoulder, hoodies, full sleeves and sweatshirts.' });
  return (
    <section className="py-12 md:py-20">
      <div className="container-premium">
        <nav className="mb-8 text-sm text-brand-muted" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand-black">Home</Link> <span>/</span> <span className="text-brand-black">Shop</span>
        </nav>
        <div className="mb-10 border-b border-brand-border pb-7">
          <h1 className="mb-2 text-4xl font-bold text-brand-black">Shop</h1>
          <p className="text-brand-muted">Discover the full collection.</p>
        </div>
        <ProductBrowser queryKey="shop-products" categoryOptions={categories} emptyTitle="No products found." emptyText="Try a different search, category or price range." />
      </div>
    </section>
  );
};
