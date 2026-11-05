import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=600&fit=crop&q=80';

const demoProducts = [
  {
    id: 'p1', name: 'Classic Oversized Tee', slug: 'classic-oversized-tee', sku: 'TEE-001',
    price: 850, salePrice: 750, fit: 'Oversized', fabric: 'Cotton', gsm: 240,
    category: 'Oversized T-shirts', images: [PLACEHOLDER], badge: 'NEW', inStock: true,
    sizes: ['M', 'L', 'XL', 'XXL'], colors: ['Black', 'White', 'Charcoal'],
  },
  {
    id: 'p2', name: 'Drop Shoulder Graphic Tee', slug: 'drop-shoulder-graphic-tee', sku: 'TEE-002',
    price: 950, salePrice: null, fit: 'Drop Shoulder', fabric: 'Cotton Blend', gsm: 220,
    category: 'Graphic T-shirts', images: ['https://images.unsplash.com/photo-1583743814966-49e1fc1c883f?w=600&h=600&fit=crop&q=80'], badge: 'BEST SELLER', inStock: true,
    sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'White'],
  },
  {
    id: 'p3', name: 'Regular Fit Plain Tee', slug: 'regular-fit-plain-tee', sku: 'TEE-003',
    price: 650, salePrice: 550, fit: 'Regular Fit', fabric: 'Cotton', gsm: 200,
    category: 'Plain T-shirts', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&q=80'], badge: 'SALE', inStock: true,
    sizes: ['M', 'L', 'XL'], colors: ['White', 'Navy', 'Black'],
  },
  {
    id: 'p4', name: 'Premium Polo Tee', slug: 'premium-polo-tee', sku: 'TEE-004',
    price: 1100, salePrice: null, fit: 'Regular Fit', fabric: 'Pique Cotton', gsm: 240,
    category: 'Polo T-shirts', images: ['https://images.unsplash.com/photo-1559885791-3d77f3d45b2c?w=600&h=600&fit=crop&q=80'], badge: null, inStock: true,
    sizes: ['M', 'L', 'XL', 'XXL'], colors: ['Navy', 'White', 'Black'],
  },
  {
    id: 'p5', name: 'Oversized Limited Edition Tee', slug: 'oversized-limited-edition-tee', sku: 'TEE-005',
    price: 1400, salePrice: null, fit: 'Oversized', fabric: 'Heavyweight Cotton', gsm: 280,
    category: 'Limited Edition', images: ['https://images.unsplash.com/photo-1602810388489-47791f8ba1b5?w=600&h=600&fit=crop&q=80'], badge: 'LIMITED EDITION', inStock: true,
    sizes: ['M', 'L', 'XL'], colors: ['Black'],
  },
  {
    id: 'p6', name: "Women's Cropped Tee", slug: 'womens-cropped-tee', sku: 'TEE-006',
    price: 750, salePrice: 650, fit: 'Cropped', fabric: 'Cotton', gsm: 190,
    category: "Women's Collection", images: ['https://images.unsplash.com/photo-1594634306853-a8c82c5b991c?w=600&h=600&fit=crop&q=80'], badge: 'NEW', inStock: true,
    sizes: ['S', 'M', 'L'], colors: ['White', 'Black', 'Pink'],
  },
];

const CATEGORIES = [
  'Oversized T-shirts', 'Regular Fit T-shirts', 'Drop Shoulder T-shirts', 'Graphic T-shirts',
  'Plain T-shirts', 'Polo T-shirts', "Men's Collection", "Women's Collection", 'Unisex Collection',
  'Couple T-shirts', 'Limited Edition', 'Seasonal Collections', 'Sale Collection',
];

export const Shop = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');
  const [priceRange, setPriceRange] = useState('all');
  const { addItem } = useCartStore();
  const { add } = useWishlistStore();

  const { data: products = demoProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/products');
      return data.products;
    },
  });

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    return matchSearch && matchCat;
  }).sort((a, b) => {
    if (sort === 'priceAsc') return a.price - b.price;
    if (sort === 'priceDesc') return b.price - a.price;
    if (sort === 'newest') return 0;
    return 0;
  });

  return (
    <section className="section">
      <div className="container-premium">
        <div className="flex flex-col lg:flex-row gap-6 mb-12 items-start lg:items-center">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-brand-black mb-2">Shop</h1>
            <p className="text-brand-muted">Discover our collections.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Input
              type="search"
              placeholder="Search products or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 max-w-md sm:w-80"
            />
            <Button onClick={() => {}}>Search</Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Filters sidebar */}
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h3 className="font-bold text-brand-black mb-4">Category</h3>
              <div className="space-y-2">
                <Button variant={category === 'All' ? 'default' : 'ghost'} size="sm" className="w-full text-left justify-start" onClick={() => setCategory('All')}>
                  All Categories
                </Button>
                {CATEGORIES.map((c) => (
                  <Button key={c} variant={category === c ? 'default' : 'ghost'} size="sm" className="w-full text-left justify-start" onClick={() => setCategory(c)}>
                    {c}
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
              <p className="text-brand-muted text-sm">{filtered.length} results</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <p className="text-brand-muted">No products found.</p>
                </div>
              ) : (
                filtered.map((p) => (
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
        </div>
      </div>
    </section>
  );
};
