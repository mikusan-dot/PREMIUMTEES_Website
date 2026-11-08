import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { cn } from '@/lib/utils';

const SkeletonCard = () => (
  <div className="overflow-hidden rounded-lg border border-brand-border bg-brand-white">
    <div className="aspect-[4/5] animate-pulse bg-brand-offwhite" />
    <div className="space-y-3 p-5">
      <div className="h-4 w-3/4 animate-pulse rounded bg-brand-offwhite" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-brand-offwhite" />
      <div className="h-8 w-full animate-pulse rounded bg-brand-offwhite" />
    </div>
  </div>
);

export const ProductSection = ({
  id,
  eyebrow,
  title,
  description,
  products = [],
  isLoading = false,
  viewAllHref = '/shop',
  viewAllLabel = 'View all',
  className,
}) => {
  const desktopColumns =
    products.length === 1
      ? 'lg:grid-cols-1'
      : products.length === 2
        ? 'lg:grid-cols-2'
        : products.length === 3
          ? 'lg:grid-cols-3'
          : 'lg:grid-cols-4';

  return (
    <section id={id} className={cn('py-16 md:py-24', className)}>
    <div className="container-premium">
      <div className="mb-10 flex flex-col gap-5 border-b border-brand-border pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow && (
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-accent">{eyebrow}</p>
          )}
          <h2 className="text-3xl leading-tight tracking-tight text-brand-black md:text-4xl">{title}</h2>
          {description && <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-muted">{description}</p>}
        </div>
        <Link
          to={viewAllHref}
          className="group inline-flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-black"
        >
          {viewAllLabel}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className={cn('grid grid-cols-2 gap-4 md:gap-6', desktopColumns)}>
          {products.map((product, index) => (
            <ProductCard key={product.id || product.slug || index} product={product} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-brand-border bg-brand-white px-6 py-14 text-center">
          <p className="text-sm font-medium text-brand-black">New pieces are on the way.</p>
          <p className="mt-1 text-sm text-brand-muted">Check back soon or browse the full collection.</p>
          <Link
            to="/shop"
            className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-black underline decoration-brand-accent decoration-2 underline-offset-4"
          >
            Shop the collection
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
      </div>
    </section>
  );
};

export default ProductSection;
