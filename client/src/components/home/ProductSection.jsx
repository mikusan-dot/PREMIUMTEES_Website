import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { cn } from '@/lib/utils';

const SkeletonCard = () => (
  <div className="overflow-hidden rounded-xl bg-[#1B1B1B] dark:bg-[#1B1B1B] border-0 dark:border-0 shadow-none">
    <div className="aspect-[4/5] animate-pulse bg-[#202020] dark:bg-[#202020]" />
    <div className="space-y-3 p-5">
      <div className="h-4 w-3/4 animate-pulse rounded bg-[#202020] dark:bg-[#202020]" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-[#202020] dark:bg-[#202020]" />
      <div className="h-8 w-full animate-pulse rounded bg-[#202020] dark:bg-[#202020]" />
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
  const hasProducts = products.length > 0;

  return (
    <section id={id} className={cn('py-16 md:py-24', className)}>
      <div className="container-premium">
        <div className="mb-12 flex flex-col gap-6 border-b border-white/10 dark:border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {eyebrow && (
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-brand-accent">{eyebrow}</p>
            )}
            <h2 className="text-3xl leading-tight tracking-tight text-brand-black md:text-4xl">{title}</h2>
            {description && (
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-brand-muted">{description}</p>
            )}
          </div>
          {hasProducts && (
            <Link
              to={viewAllHref}
              className="group inline-flex shrink-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-black"
            >
              {viewAllLabel}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : hasProducts ? (
          <div className="grid gap-y-12 gap-x-6 sm:gap-x-8 lg:gap-x-10 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} className="flex flex-col h-full" />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-white/20 dark:border-white/20 bg-[#1B1B1B] dark:bg-[#1B1B1B] px-8 py-16 text-center rounded-2xl">
            <p className="text-sm font-medium text-brand-black">New pieces are on the way.</p>
            <p className="mt-2 text-sm text-brand-muted">Check back soon or browse the full collection.</p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-black underline decoration-brand-accent decoration-2 underline-offset-4"
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
