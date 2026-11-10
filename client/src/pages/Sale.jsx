import { Link } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';
import { ProductBrowser } from '@/components/product/ProductBrowser';

export const Sale = () => {
  useSeo({ title: 'Sale | Premium Tees', description: 'Premium tees, hoodies and sweatshirts at reduced prices while the sale lasts.' });
  return (
    <section className="py-12 md:py-20">
      <div className="container-premium">
        <nav className="mb-8 text-sm text-brand-muted" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand-black">Home</Link> <span>/</span> <span className="text-brand-black">Sale</span>
        </nav>
        <div className="mb-10 border-b border-brand-border pb-7">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-accent">Limited time</p>
          <h1 className="mb-2 text-4xl font-bold text-brand-black">Sale</h1>
          <p className="text-brand-muted">Reduced prices while stock and campaigns last.</p>
        </div>
        <ProductBrowser
          queryKey="sale-products"
          fixedParams={{ onSale: true }}
          emptyTitle="No sale items right now."
          emptyText="Check back soon, or browse everything in the shop."
        />
      </div>
    </section>
  );
};
export default Sale;
