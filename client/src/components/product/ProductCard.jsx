import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { getProductColors, isProductInStock, toCartItem } from '@/lib/product';
import { cn } from '@/lib/utils';
import { getProductBadges, getStockLabel, isSaleActive, nextCampaignEnd } from '@/lib/badges';
import { useNow } from '@/hooks/useNow';

const PLACEHOLDER = 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800';

const COLOR_HEX = {
  black: '#0a0a0a',
  white: '#ffffff',
  offwhite: '#f7f5f1',
  charcoal: '#374151',
  gray: '#9ca3af',
  grey: '#9ca3af',
  navy: '#1e3a8a',
  blue: '#2563eb',
  sky: '#7dd3fc',
  pink: '#f9a8d4',
  red: '#dc2626',
  green: '#16a34a',
  olive: '#4d5d3a',
  beige: '#d6c7b0',
  brown: '#6b4f3a',
  sand: '#e5d3b3',
  maroon: '#7f1d1d',
  purple: '#7c3aed',
  yellow: '#facc15',
  orange: '#f97316',
  cream: '#f5f0e1',
  teal: '#0d9488',
};

const money = (value) => `৳${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

const swatchStyle = (color) => {
  const hex = COLOR_HEX[String(color || '').trim().toLowerCase()];
  return hex ? { backgroundColor: hex } : { backgroundColor: '#d1d5db' };
};

export const ProductCard = ({ product, className, imagePriority = false }) => {
  const { addItem } = useCartStore();
  const { ids, toggle } = useWishlistStore();
  const saved = ids.includes(product.id);
  const inStock = isProductInStock(product);

  const hasCampaign = nextCampaignEnd(product) !== null;
  const now = useNow(hasCampaign);
  const price = Number(product.price) || 0;
  const salePrice = Number(product.salePrice) || 0;
  const hasSale = isSaleActive(product, now);
  const currentPrice = hasSale ? salePrice : price;
  const discount = hasSale ? Math.round((1 - salePrice / price) * 100) : 0;
  const badges = getProductBadges(product, now).filter((b) => b.key !== 'out-of-stock').slice(0, 2);
  const stockInfo = getStockLabel(product);

  const colors = getProductColors(product);
  const visibleColors = colors.slice(0, 4);
  const extraColors = colors.length - visibleColors.length;

  const meta = [product.fit, product.fabric].filter(Boolean).join(' · ');

  const handleAdd = () => {
    if (!inStock) return;
    addItem(toCartItem(product));
  };

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-lg border border-brand-border bg-brand-white transition-all duration-300 hover:border-brand-charcoal/25 hover:shadow-[0_18px_40px_-28px_rgba(10,10,10,0.45)]',
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-brand-offwhite">
        <Link to={product.slug ? `/product/${product.slug}` : '/shop'} aria-label={`View ${product.name}`} className="block h-full w-full">
          <img
            src={product.images?.[0] || PLACEHOLDER}
            alt={product.name}
            loading={imagePriority ? 'eager' : 'lazy'}
            decoding="async"
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER;
              e.currentTarget.onerror = null;
            }}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-night/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>

        <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          {discount > 0 && (
            <span className="bg-[#dc2626] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              -{discount}%
            </span>
          )}
          {badges.filter((b) => b.key !== 'sale').slice(0, 1).map((b) => (
            <span
              key={b.key}
              className={cn(
                'px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]',
                b.tone === 'accent' && 'bg-brand-accent text-white',
                b.tone === 'amber' && 'bg-amber-100 text-amber-800',
                b.tone === 'ink' && 'bg-brand-black text-brand-white',
                b.tone === 'red' && 'bg-[#dc2626] text-white',
              )}
            >
              {b.label}
            </span>
          ))}
          {hasSale && badges.find((b) => b.key === 'sale' && b.label !== 'Sale') && (
            <span className="bg-[#dc2626] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              {badges.find((b) => b.key === 'sale').label}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => toggle(product.id)}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={saved}
          title={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-brand-white/90 text-brand-black shadow-sm backdrop-blur transition-all hover:bg-brand-white hover:scale-105"
        >
          <Heart className={cn('h-4 w-4', saved && 'fill-brand-black')} />
        </button>

        {!inStock && (
          <div className="absolute inset-x-0 bottom-0 z-10 bg-brand-night/85 px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            Out of Stock
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <Link to={product.slug ? `/product/${product.slug}` : '/shop'} className="min-w-0">
            <h3 className="truncate text-sm font-semibold tracking-tight text-brand-black transition-colors group-hover:text-brand-accent sm:text-base">
              {product.name}
            </h3>
          </Link>
          {colors.length > 0 && (
            <div className="flex shrink-0 items-center gap-1 pt-0.5" aria-label="Available colors">
              {visibleColors.map((color) => (
                <span
                  key={color}
                  title={color}
                  className="h-3 w-3 rounded-full border border-brand-charcoal/20"
                  style={swatchStyle(color)}
                />
              ))}
              {extraColors > 0 && <span className="text-[10px] text-brand-muted">+{extraColors}</span>}
            </div>
          )}
        </div>

        {meta && <p className="mt-1 truncate text-[11px] uppercase tracking-[0.12em] text-brand-muted">{meta}</p>}

        <div className="mt-auto pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-brand-black sm:text-base">{money(currentPrice)}</span>
            {hasSale && <span className="text-xs text-brand-muted line-through">{money(price)}</span>}
          </div>
          <p
            className={cn(
              'mt-1 text-[11px] font-medium',
              stockInfo.tone === 'in' && 'text-green-700',
              stockInfo.tone === 'low' && 'text-amber-700',
              stockInfo.tone === 'out' && 'text-brand-muted',
            )}
          >
            {stockInfo.label}
          </p>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!inStock}
            className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 border border-brand-black px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-black transition-colors hover:bg-brand-black hover:text-brand-white disabled:cursor-not-allowed disabled:border-brand-border disabled:text-brand-muted disabled:hover:bg-transparent"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
