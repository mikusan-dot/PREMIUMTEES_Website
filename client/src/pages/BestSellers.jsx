import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useCartStore } from '@/store/cartStore';
import { isProductInStock, toCartItem } from '@/lib/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=600&fit=crop&q=80';

const demoProducts = [
  {
    id: 'p2', name: 'Drop Shoulder Graphic Tee', slug: 'drop-shoulder-graphic-tee', sku: 'TEE-002',
    price: 950, salePrice: null, fit: 'Drop Shoulder', fabric: 'Cotton Blend', gsm: 220,
    category: 'Graphic T-shirts', images: ['https://images.unsplash.com/photo-1583743814966-49e1fc1c883f?w=600&h=600&fit=crop&q=80'], badge: 'BEST SELLER', inStock: true,
    sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'White'],
  },
  {
    id: 'p4', name: 'Premium Polo Tee', slug: 'premium-polo-tee', sku: 'TEE-004',
    price: 1100, salePrice: null, fit: 'Regular Fit', fabric: 'Pique Cotton', gsm: 240,
    category: 'Polo T-shirts', images: ['https://images.unsplash.com/photo-1559885791-3d77f3d45b2c?w=600&h=600&fit=crop&q=80'], badge: null, inStock: true,
    sizes: ['M', 'L', 'XL', 'XXL'], colors: ['Navy', 'White', 'Black'],
  },
  {
    id: 'p3', name: 'Regular Fit Plain Tee', slug: 'regular-fit-plain-tee', sku: 'TEE-003',
    price: 650, salePrice: 550, fit: 'Regular Fit', fabric: 'Cotton', gsm: 200,
    category: 'Plain T-shirts', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&q=80'], badge: 'SALE', inStock: true,
    sizes: ['M', 'L', 'XL'], colors: ['White', 'Navy', 'Black'],
  },
];

export const BestSellers = () => {
  const { addItem } = useCartStore();

  const handleAdd = (product) => {
    if (!isProductInStock(product)) return;
    addItem(toCartItem(product));
  };

  const { data: products = demoProducts } = useQuery({
    queryKey: ['best-sellers'],
    queryFn: async () => {
      const { data } = await api.get('/products?best-sellers=true');
      return data.products;
    },
  });

  return (
    <section className="section">
      <div className="container-premium">
        <nav className="mb-8 text-sm text-brand-muted">
          <a href="/" className="hover:text-brand-black">Home</a> <span>/</span>
          <span className="text-brand-black">Best Sellers</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6 mb-12 items-start lg:items-center">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-brand-black mb-2">Best Sellers</h1>
            <p className="text-brand-muted">Customer favorites.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-brand-muted">No best sellers yet.</p>
            </div>
          ) : (
            products.map((p) => (
              <Card key={p.id} className="group cursor-pointer" onClick={() => { window.location.href = `/product/${p.slug}`; }}>
                <div className="relative h-64 rounded-xl overflow-hidden mb-4 group-hover:border-brand-accent transition-colors border border-brand-border">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {p.badge && <Badge variant="sale" className="absolute top-3 left-3">{p.badge}</Badge>}
                  {!isProductInStock(p) && <Badge variant="out-of-stock" className="absolute top-3 left-3">Out of Stock</Badge>}
                </div>
                <h3 className="font-bold text-brand-black mb-1">{p.name}</h3>
                <p className="text-xs text-brand-muted mb-3">{p.category}</p>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{p.salePrice ? `৳${p.salePrice}` : `৳${p.price}`}</span>
                  {p.salePrice && <span className="text-xs text-brand-muted line-through">৳{p.price}</span>}
                </div>
                <Button size="sm" variant="outline" className="w-full mt-3" disabled={!isProductInStock(p)} onClick={(e) => { e.stopPropagation(); handleAdd(p); }}>
                  Add to Cart
                </Button>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
