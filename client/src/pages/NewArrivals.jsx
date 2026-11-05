import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=600&fit=crop&q=80';

const demoProducts = [
  {
    id: 'p1', name: 'Classic Oversized Tee', slug: 'classic-oversized-tee', sku: 'TEE-001',
    price: 850, salePrice: 750, fit: 'Oversized', fabric: 'Cotton', gsm: 240,
    category: 'Oversized T-shirts', images: [PLACEHOLDER], badge: 'NEW', inStock: true,
    sizes: ['M', 'L', 'XL', 'XXL'], colors: ['Black', 'White', 'Charcoal'],
  },
  {
    id: 'p6', name: "Women's Cropped Tee", slug: 'womens-cropped-tee', sku: 'TEE-006',
    price: 750, salePrice: 650, fit: 'Cropped', fabric: 'Cotton', gsm: 190,
    category: "Women's Collection", images: ['https://images.unsplash.com/photo-1594634306853-a8c82c5b991c?w=600&h=600&fit=crop&q=80'], badge: 'NEW', inStock: true,
    sizes: ['S', 'M', 'L'], colors: ['White', 'Black', 'Pink'],
  },
  {
    id: 'p5', name: 'Oversized Limited Edition Tee', slug: 'oversized-limited-edition-tee', sku: 'TEE-005',
    price: 1400, salePrice: null, fit: 'Oversized', fabric: 'Heavyweight Cotton', gsm: 280,
    category: 'Limited Edition', images: ['https://images.unsplash.com/photo-1602810388489-47791f8ba1b5?w=600&h=600&fit=crop&q=80'], badge: 'LIMITED EDITION', inStock: true,
    sizes: ['M', 'L', 'XL'], colors: ['Black'],
  },
];

export const NewArrivals = () => {
  const { addItem } = useCartStore();

  const { data: products = demoProducts } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: async () => {
      const { data } = await api.get('/products?new-arrivals=true');
      return data.products;
    },
  });

  return (
    <section className="section">
      <div className="container-premium">
        <nav className="mb-8 text-sm text-brand-muted">
          <a href="/" className="hover:text-brand-black">Home</a> <span>/</span>
          <span className="text-brand-black">New Arrivals</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6 mb-12 items-start lg:items-center">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-brand-black mb-2">New Arrivals</h1>
            <p className="text-brand-muted">Fresh drops just landed.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-brand-muted">No new arrivals yet.</p>
            </div>
          ) : (
            products.map((p) => (
              <Card key={p.id} className="group cursor-pointer" onClick={() => { window.location.href = `/product/${p.slug}`; }}>
                <div className="relative h-64 rounded-xl overflow-hidden mb-4 group-hover:border-brand-accent transition-colors border border-brand-border">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {p.badge && <Badge variant="sale" className="absolute top-3 left-3">{p.badge}</Badge>}
                  {!p.inStock && <Badge variant="out-of-stock" className="absolute top-3 left-3">Out of Stock</Badge>}
                </div>
                <h3 className="font-bold text-brand-black mb-1">{p.name}</h3>
                <p className="text-xs text-brand-muted mb-3">{p.category}</p>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{p.salePrice ? `৳${p.salePrice}` : `৳${p.price}`}</span>
                  {p.salePrice && <span className="text-xs text-brand-muted line-through">৳{p.price}</span>}
                </div>
                <Button size="sm" variant="outline" className="w-full mt-3" disabled={!p.inStock} onClick={() => p.inStock && addItem({ ...p, variantId: `${p.sku}-${p.colors[0]}-${p.sizes[0]}` })}>
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
