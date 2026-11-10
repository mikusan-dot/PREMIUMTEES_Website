import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Minus, Plus, ShoppingBag } from 'lucide-react';
import { api } from '@/services/api';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { colorHex, getCurrentPrice, getDefaultVariant, getProductColors, getProductSizes, getVariants } from '@/lib/product';
import { dedupeProducts, getProductBadges, getStockLabel, isSaleActive, nextCampaignEnd } from '@/lib/badges';
import { useNow } from '@/hooks/useNow';
import { useCategories } from '@/hooks/useCategories';
import { ProductCard } from '@/components/product/ProductCard';
import { GridMessage } from '@/components/product/ProductListingPage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PLACEHOLDER = 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800';
const money = (v) => `৳${Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

const SIZE_CHART = {
  S: { chest: '52 cm', length: '70 cm' },
  M: { chest: '56 cm', length: '72 cm' },
  L: { chest: '60 cm', length: '74 cm' },
  XL: { chest: '64 cm', length: '76 cm' },
  XXL: { chest: '68 cm', length: '78 cm' },
};

const Skeleton = () => (
  <section className="py-12 md:py-20">
    <div className="container-premium grid gap-10 lg:grid-cols-2">
      <div className="aspect-square animate-pulse rounded-lg bg-brand-white" />
      <div className="space-y-4">
        <div className="h-8 w-2/3 animate-pulse rounded bg-brand-white" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-brand-white" />
        <div className="h-24 w-full animate-pulse rounded bg-brand-white" />
      </div>
    </div>
  </section>
);

export const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { categories } = useCategories();
  const categoryName = (slug) => categories.find((c) => c.slug === slug)?.name || slug;
  const { ids, toggle } = useWishlistStore();

  const { data: product, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => (await api.get(`/products/${encodeURIComponent(slug)}`)).data.product,
    retry: (count, err) => err?.response?.status !== 404 && count < 2,
  });

  const { data: related = [] } = useQuery({
    queryKey: ['products', 'related', product?.categoryIds?.[0] || 'all'],
    queryFn: async () => {
      const category = product?.categoryIds?.[0];
      const { data } = await api.get('/products', { params: { category, sort: 'popular', limit: 12 } });
      // Fall back to the newest products when the category has nothing else to show.
      if (category && data.products.filter((p) => p.id !== product.id).length < 4) {
        return (await api.get('/products', { params: { newArrivals: true, limit: 12 } })).data.products;
      }
      return data.products;
    },
    enabled: Boolean(product),
    staleTime: 60_000,
  });

  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const now = useNow(product ? nextCampaignEnd(product) !== null : false);

  const variants = useMemo(() => getVariants(product), [product]);
  const colors = useMemo(() => getProductColors(product), [product]);
  const sizes = useMemo(() => getProductSizes(product), [product]);

  // Choose the first in-stock variant once the product loads.
  useEffect(() => {
    if (!product) return;
    const first = getDefaultVariant(product);
    setColor(first?.color ?? colors[0] ?? null);
    setSize(first?.size ?? sizes[0] ?? null);
    setQty(1);
    setActiveImage(0);
    window.scrollTo({ top: 0 });
  }, [product]); // eslint-disable-line react-hooks/exhaustive-deps

  const variantFor = (c, s) => variants.find((v) => v.color === c && v.size === s) ?? null;
  const stockOf = (v) => (Number(v?.stock) > 0 ? Number(v.stock) : 0);
  const variant = variants.length ? variantFor(color, size) : null;
  const available = variants.length ? stockOf(variant) : product?.inStock === false ? 0 : 99;

  const pickColor = (c) => {
    setColor(c);
    // Keep the chosen size if it exists in this colour, otherwise jump to the first size that does.
    if (!stockOf(variantFor(c, size))) {
      const next = variants.find((v) => v.color === c && stockOf(v) > 0) ?? variants.find((v) => v.color === c);
      if (next) setSize(next.size);
    }
    setQty(1);
  };

  if (isLoading) return <Skeleton />;

  if (isError || !product) {
    const notFound = error?.response?.status === 404;
    return (
      <section className="py-20">
        <div className="container-premium grid">
          <GridMessage
            title={notFound ? 'Product not found.' : "We couldn't load this product."}
            text={notFound ? 'It may have been removed or renamed.' : 'Check your connection and try again.'}
            action={
              notFound ? (
                <Link to="/shop" className="mt-5 inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-black underline decoration-brand-accent decoration-2 underline-offset-4">Back to the shop</Link>
              ) : (
                <button type="button" onClick={() => refetch()} className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-black underline decoration-brand-accent decoration-2 underline-offset-4">Try again</button>
              )
            }
          />
        </div>
      </section>
    );
  }

  const images = product.images?.length ? product.images : [PLACEHOLDER];
  const hasSale = isSaleActive(product, now);
  const current = getCurrentPrice(product, now);
  const regular = Number(product.price) || 0;
  const discount = hasSale ? Math.round((1 - current / regular) * 100) : 0;
  const badges = getProductBadges(product, now);
  const stockInfo = getStockLabel(product);
  const saved = ids.includes(product.id);
  const canBuy = available > 0;
  const sizeRows = sizes.filter((s) => SIZE_CHART[s]);

  const cartItem = () => ({
    ...product,
    price: current,
    variantId: variant?.sku ?? null,
    color,
    size,
    quantity: qty,
  });

  const handleAdd = () => {
    if (!canBuy) return;
    addItem(cartItem());
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    if (!canBuy) return;
    addItem(cartItem());
    navigate('/checkout');
  };

  const others = dedupeProducts(related).filter((p) => p.id !== product.id).slice(0, 4);
  const details = [
    ['SKU', product.sku],
    ['Fit', product.fit],
    ['Fabric', product.fabric],
    ['Weight', product.gsm ? `${product.gsm} GSM` : null],
  ].filter(([, v]) => v);

  return (
    <section className="py-8 md:py-16">
      <div className="container-premium">
        <nav className="mb-6 text-sm text-brand-muted md:mb-8" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand-black">Home</Link> <span>/</span>{' '}
          {product.categoryIds?.[0] ? (
            <Link to={`/category/${product.categoryIds[0]}`} className="hover:text-brand-black">{categoryName(product.categoryIds[0])}</Link>
          ) : (
            <Link to="/shop" className="hover:text-brand-black">Shop</Link>
          )}{' '}
          <span>/</span> <span className="text-brand-black">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-brand-border bg-brand-offwhite sm:aspect-[4/5]">
              <img
                src={images[activeImage] || PLACEHOLDER}
                alt={product.name}
                onError={(e) => { e.currentTarget.src = PLACEHOLDER; e.currentTarget.onerror = null; }}
                className="h-full w-full object-cover"
              />
              <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
                {discount > 0 && <span className="bg-[#dc2626] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">-{discount}%</span>}
                {badges.filter((b) => b.key !== 'low-stock').slice(0, 2).map((b) => (
                  <span key={b.key} className={cn('px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]', b.tone === 'red' && 'bg-[#dc2626] text-white', b.tone === 'accent' && 'bg-brand-accent text-white', b.tone === 'ink' && 'bg-brand-black text-brand-white', b.tone === 'dark' && 'bg-neutral-800 text-white')}>
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.slice(0, 8).map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`Show image ${i + 1}`}
                    className={cn('aspect-square overflow-hidden rounded-md border-2 bg-brand-offwhite', activeImage === i ? 'border-brand-accent' : 'border-transparent')}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = PLACEHOLDER; e.currentTarget.onerror = null; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-7">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-brand-black md:text-4xl">{product.name}</h1>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-2xl font-bold text-brand-black md:text-3xl">{money(current)}</span>
                {hasSale && <span className="text-lg text-brand-muted line-through">{money(regular)}</span>}
              </div>
              <p className={cn('mt-2 text-sm font-medium', stockInfo.tone === 'in' && 'text-green-700', stockInfo.tone === 'low' && 'text-amber-700', stockInfo.tone === 'out' && 'text-brand-muted')}>
                {stockInfo.label}
              </p>
              {product.description && <p className="mt-4 leading-relaxed text-brand-charcoal">{product.description}</p>}
            </div>

            {colors.length > 0 && (
              <div className="space-y-3">
                <p className="label">Colour{color ? <span className="ml-2 font-normal text-brand-muted">{color}</span> : null}</p>
                <div className="flex flex-wrap gap-3">
                  {colors.map((c) => {
                    const inStockColor = variants.length === 0 || variants.some((v) => v.color === c && stockOf(v) > 0);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => pickColor(c)}
                        aria-label={`${c}${inStockColor ? '' : ' (sold out)'}`}
                        aria-pressed={color === c}
                        title={c}
                        style={{ backgroundColor: colorHex(c) }}
                        className={cn('h-11 w-11 rounded-full border border-brand-charcoal/25 transition-all', color === c && 'ring-2 ring-brand-accent ring-offset-2 ring-offset-brand-offwhite', !inStockColor && 'opacity-40')}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div className="space-y-3">
                <p className="label">Size</p>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((s) => {
                    const ok = variants.length === 0 || stockOf(variantFor(color, s)) > 0;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={!ok}
                        onClick={() => { setSize(s); setQty(1); }}
                        aria-pressed={size === s}
                        className={cn(
                          'flex h-11 min-w-[44px] items-center justify-center rounded-full border px-3 text-sm font-medium transition-all',
                          size === s ? 'border-brand-black bg-brand-black text-brand-white' : 'border-brand-border text-brand-charcoal hover:border-brand-black',
                          !ok && 'cursor-not-allowed text-brand-muted line-through opacity-50 hover:border-brand-border',
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="label">Quantity</p>
              <div className="inline-flex items-center border border-brand-border">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center text-brand-black hover:bg-brand-offwhite"><Minus className="h-4 w-4" /></button>
                <span className="w-12 text-center text-sm font-semibold text-brand-black" aria-live="polite">{qty}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(Math.max(available, 1), q + 1))} disabled={qty >= available} className="flex h-11 w-11 items-center justify-center text-brand-black hover:bg-brand-offwhite disabled:opacity-40"><Plus className="h-4 w-4" /></button>
              </div>
              {variant && canBuy && <p className="text-xs text-brand-muted">{available} available in {color} / {size}</p>}
              {!canBuy && <p className="text-xs text-brand-muted">This combination is sold out.</p>}
            </div>

            <div className="space-y-3 border-t border-brand-border pt-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="w-full sm:flex-1" disabled={!canBuy} onClick={handleAdd}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {!canBuy ? 'Out of stock' : added ? 'Added to cart ✓' : 'Add to cart'}
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:flex-1" disabled={!canBuy} onClick={handleBuyNow}>Buy now</Button>
              </div>
              <button
                type="button"
                onClick={() => toggle(product.id)}
                aria-pressed={saved}
                className="inline-flex min-h-[44px] items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-charcoal hover:text-brand-accent"
              >
                <Heart className={cn('h-4 w-4', saved && 'fill-brand-black')} />
                {saved ? 'Saved to wishlist' : 'Add to wishlist'}
              </button>
            </div>

            {details.length > 0 && (
              <dl className="grid grid-cols-2 gap-4 border-t border-brand-border pt-6 text-sm sm:grid-cols-4">
                {details.map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-semibold text-brand-black">{k}</dt>
                    <dd className="text-brand-muted">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {sizeRows.length > 0 && (
              <div className="border border-brand-border bg-brand-white p-5">
                <h2 className="mb-3 text-lg font-bold text-brand-black">Size guide <span className="text-xs font-normal text-brand-muted">(approximate, flat)</span></h2>
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-brand-border text-brand-muted">
                      <th className="pb-2 font-semibold text-brand-black">Size</th>
                      <th className="pb-2 font-semibold text-brand-black">Chest</th>
                      <th className="pb-2 font-semibold text-brand-black">Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeRows.map((s) => (
                      <tr key={s} className="border-b border-brand-border/50 text-brand-charcoal">
                        <td className="py-2.5 font-semibold">{s}</td>
                        <td className="py-2.5">{SIZE_CHART[s].chest}</td>
                        <td className="py-2.5">{SIZE_CHART[s].length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {others.length > 0 && (
          <div className="mt-16 border-t border-brand-border pt-10 md:mt-24">
            <h2 className="mb-8 text-2xl text-brand-black md:text-3xl">You may also like</h2>
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
              {others.map((p) => <ProductCard key={p.id || p.slug} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductDetail;
