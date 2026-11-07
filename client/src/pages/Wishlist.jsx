import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { api } from '@/services/api';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { isProductInStock, toCartItem } from '@/lib/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=600&fit=crop&q=80';

export const Wishlist = () => {
  const navigate = useNavigate();
  const { ids, remove, clear } = useWishlistStore();
  const { addItem } = useCartStore();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'wishlist'],
    queryFn: async () => {
      const { data } = await api.get('/products?limit=100');
      return data.products || [];
    },
  });

  const items = products.filter((product) => ids.includes(product.id));

  const handleAdd = (product) => {
    if (!isProductInStock(product)) return;
    addItem(toCartItem(product));
  };

  return (
    <section className="section">
      <div className="container-premium">
        <nav className="mb-8 text-sm text-brand-muted">
          <Link to="/" className="hover:text-brand-black">Home</Link> <span>/</span>
          <span className="text-brand-black">Wishlist</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-brand-black mb-2">My Wishlist</h1>
            <p className="text-brand-muted">{items.length} saved {items.length === 1 ? 'item' : 'items'}</p>
          </div>
          {ids.length > 0 && (
            <Button variant="outline" size="sm" onClick={clear}>Clear Wishlist</Button>
          )}
        </div>

        {isLoading ? (
          <p className="text-center py-20 text-brand-muted">Loading wishlist...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-brand-black mb-4">Your wishlist is empty</h2>
            <p className="text-brand-muted mb-8">Tap the heart on a product to save it here for later.</p>
            <Button asChild>
              <Link to="/shop">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((product) => {
              const inStock = isProductInStock(product);
              return (
                <Card key={product.id} className="group cursor-pointer" onClick={() => navigate(`/product/${product.slug}`)}>
                  <div className="relative h-64 rounded-xl overflow-hidden mb-4 group-hover:border-brand-accent transition-colors border border-brand-border">
                    <img src={product.images?.[0] || PLACEHOLDER} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {product.badge && <Badge variant="sale" className="absolute top-3 left-3">{product.badge}</Badge>}
                    {!inStock && <Badge variant="out-of-stock" className="absolute top-3 left-3">Out of Stock</Badge>}
                    <button
                      type="button"
                      aria-label={`Remove ${product.name} from wishlist`}
                      title="Remove from wishlist"
                      onClick={(e) => { e.stopPropagation(); remove(product.id); }}
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <X className="h-4 w-4 text-brand-black" />
                    </button>
                  </div>
                  <h3 className="font-bold text-brand-black mb-1">{product.name}</h3>
                  <p className="text-xs text-brand-muted mb-3">{product.category || 'Premium Tees'}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{product.salePrice ? `৳${product.salePrice}` : `৳${product.price}`}</span>
                    {product.salePrice && <span className="text-xs text-brand-muted line-through">৳{product.price}</span>}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-3"
                    disabled={!inStock}
                    onClick={(e) => { e.stopPropagation(); handleAdd(product); }}
                  >
                    Add to Cart
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
