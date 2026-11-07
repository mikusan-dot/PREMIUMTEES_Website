import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { isProductInStock, toCartItem } from '@/lib/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=600&fit=crop&q=80';

const demoProducts = [
  {
    id: 'p1',
    name: 'Classic Oversized Tee',
    slug: 'classic-oversized-tee',
    sku: 'TEE-001',
    price: 850,
    salePrice: 750,
    fit: 'Oversized',
    fabric: 'Cotton',
    gsm: 240,
    category: 'Oversized T-shirts',
    images: [PLACEHOLDER, 'https://images.unsplash.com/photo-1503341544254-5272518500aa?w=600&h=600&fit=crop&q=80'],
    badge: 'NEW',
    inStock: true,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'White', 'Charcoal'],
  },
  {
    id: 'p2',
    name: 'Drop Shoulder Graphic Tee',
    slug: 'drop-shoulder-graphic-tee',
    sku: 'TEE-002',
    price: 950,
    salePrice: null,
    fit: 'Drop Shoulder',
    fabric: 'Cotton Blend',
    gsm: 220,
    category: 'Graphic T-shirts',
    images: ['https://images.unsplash.com/photo-1583743814966-49e1fc1c883f?w=600&h=600&fit=crop&q=80'],
    badge: 'BEST SELLER',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White'],
  },
  {
    id: 'p3',
    name: 'Regular Fit Plain Tee',
    slug: 'regular-fit-plain-tee',
    sku: 'TEE-003',
    price: 650,
    salePrice: 550,
    fit: 'Regular Fit',
    fabric: 'Cotton',
    gsm: 200,
    category: 'Plain T-shirts',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&q=80'],
    badge: 'SALE',
    inStock: true,
    sizes: ['M', 'L', 'XL'],
    colors: ['White', 'Navy', 'Black'],
  },
  {
    id: 'p4',
    name: 'Premium Polo Tee',
    slug: 'premium-polo-tee',
    sku: 'TEE-004',
    price: 1100,
    salePrice: null,
    fit: 'Regular Fit',
    fabric: 'Pique Cotton',
    gsm: 240,
    category: 'Polo T-shirts',
    images: ['https://images.unsplash.com/photo-1559885791-3d77f3d45b2c?w=600&h=600&fit=crop&q=80'],
    badge: null,
    inStock: true,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Navy', 'White', 'Black'],
  },
  {
    id: 'p5',
    name: 'Oversized Limited Edition Tee',
    slug: 'oversized-limited-edition-tee',
    sku: 'TEE-005',
    price: 1400,
    salePrice: null,
    fit: 'Oversized',
    fabric: 'Heavyweight Cotton',
    gsm: 280,
    category: 'Limited Edition',
    images: ['https://images.unsplash.com/photo-1602810388489-47791f8ba1b5?w=600&h=600&fit=crop&q=80'],
    badge: 'LIMITED EDITION',
    inStock: true,
    sizes: ['M', 'L', 'XL'],
    colors: ['Black'],
  },
  {
    id: 'p6',
    name: 'Women\'s Cropped Tee',
    slug: 'womens-cropped-tee',
    sku: 'TEE-006',
    price: 750,
    salePrice: 650,
    fit: 'Cropped',
    fabric: 'Cotton',
    gsm: 190,
    category: 'Women\'s Collection',
    images: ['https://images.unsplash.com/photo-1594634306853-a8c82c5b991c?w=600&h=600&fit=crop&q=80'],
    badge: 'NEW',
    inStock: true,
    sizes: ['S', 'M', 'L'],
    colors: ['White', 'Black', 'Pink'],
  },
];

export const Home = () => {
  const { addItem } = useCartStore();
  const { add } = useWishlistStore();

  const handleAdd = (product) => {
    if (!isProductInStock(product)) return;
    addItem(toCartItem(product));
  };

  const { data: products = demoProducts, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data } = await api.get('/products?featured=true&limit=6');
      return data.products;
    },
    staleTime: 10 * 60 * 1000,
  });

  return (
    <section className="relative overflow-hidden">
      {/* Announcement bar */}
      <div className="bg-brand-accent text-white text-center text-xs font-medium px-4 py-2 tracking-wider uppercase">
        Free delivery inside Dhaka on orders over ৳2,000 &bull; Cash on Delivery available
      </div>

      {/* Hero */}
      <div className="relative pt-20 pb-32 md:pt-32 md:pb-40">
        <div className="container-premium px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
          <span className="inline-block mb-6 px-4 py-1.5 rounded-full border border-brand-border bg-brand-black text-brand-white text-xs font-semibold uppercase tracking-wider">
            New Collection · Summer 2026
          </span>
          <h1 className="mb-6">Minimalist.<br />Premium.<br />T-shirts.</h1>
          <p className="max-w-xl mx-auto mb-10 text-lg text-brand-charcoal">
            Crafted for comfort and cut for a modern silhouette. Heavyweight cotton, clean finishes,
            and timeless fits made for everyday wear in Bangladesh.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto" onClick={() => { window.location.href = '/shop'; }}>
              Shop Now
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">View Collection</Button>
          </div>
        </div>

        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&h=700&fit=crop&q=80"
            alt=""
            className="w-full h-full object-cover opacity-60"
          />
        </div>
      </div>

      {/* Shop by category */}
      <section className="section">
        <div className="container-premium">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              'Oversized T-shirts',
              'Regular Fit T-shirts',
              'Drop Shoulder T-shirts',
              'Graphic T-shirts',
              'Plain T-shirts',
              'Polo T-shirts',
            ].map((cat) => (
              <Card key={cat} className="cursor-pointer hover:border-brand-accent transition-colors group" onClick={() => { window.location.href = '/categories'; }}>
                <div className="h-32 rounded-xl overflow-hidden mb-4 bg-brand-offwhite group-hover:scale-105 transition-transform duration-300">
                  <img src={PLACEHOLDER} alt={cat} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-brand-black">{cat}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="section bg-brand-black text-white">
        <div className="container-premium">
          <div className="section-header text-white">
            <h2 className="section-title text-white">New Arrivals</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.slice(0, 3).map((p) => (
              <Card key={p.id} className="bg-transparent border-white/10 hover:border-brand-accent transition-colors">
                <div className="relative h-64 rounded-xl overflow-hidden mb-4 group">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {p.badge && <Badge variant="sale" className="absolute top-3 left-3">{p.badge}</Badge>}
                </div>
                <h3 className="text-xl font-bold mb-2">{p.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{p.fit} · {p.fabric} · {p.gsm} GSM</p>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold">{p.salePrice ? `৳${p.salePrice}` : `৳${p.price}`}</span>
                  {p.salePrice && <span className="text-sm text-gray-400 line-through">৳{p.price}</span>}
                </div>
                <Button size="sm" className="w-full mt-4" onClick={() => handleAdd(p)}>
                  Add to Cart
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Best sellers */}
      <section className="section">
        <div className="container-premium">
          <div className="section-header">
            <h2 className="section-title">Best Sellers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(3).map((p) => (
              <ProductCard key={p.id} product={p} onAdd={handleAdd} add={add} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo banner */}
      <section className="section">
        <div className="container-premium">
          <div className="relative h-64 rounded-2xl overflow-hidden border border-brand-border bg-brand-black text-white flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop&q=80"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
            <div className="relative z-10 px-8 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Limited Edition Drop</h2>
              <p className="text-white/90 mb-6">Only 100 pieces. Once they're gone, they're gone.</p>
              <Button size="lg">Shop the Drop</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="section">
        <div className="container-premium">
          <div className="section-header">
            <h2 className="section-title">Customer Reviews</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'A. Rahman', stars: 5, text: "Best oversized fit I've found in BD. Fabric feels premium." },
              { name: 'S. Islam', stars: 5, text: 'Fast delivery and great packaging. Will order again.' },
              { name: 'R. Chowdhury', stars: 4, text: 'Great quality cotton and accurate sizing chart.' },
            ].map((r) => (
              <Card key={r.name}>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500 text-xs">★</span>
                  ))}
                </div>
                <p className="text-sm text-brand-charcoal mb-4 italic">"{r.text}"</p>
                <p className="text-xs font-semibold text-brand-black">{r.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section bg-brand-black text-white">
        <div className="container-premium">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Join the mailing list</h2>
            <p className="text-gray-400 mb-6">Get early access to new drops and exclusive offers.</p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <Input type="email" placeholder="Enter your email" className="flex-1" />
              <Button variant="outline">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>
    </section>
  );
};

function ProductCard({ product, onAdd, add }) {
  return (
    <Card className="group cursor-pointer">
      <div className="relative h-64 rounded-xl overflow-hidden mb-4 group-hover:border-brand-accent transition-colors">
        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.badge && <Badge variant="sale" className="absolute top-3 left-3">{product.badge}</Badge>}
        <button onClick={(e) => { e.stopPropagation(); add(product.id); }} className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
          <Heart className="h-5 w-5 text-brand-black" />
        </button>
      </div>
      <h3 className="font-bold text-brand-black mb-1">{product.name}</h3>
      <p className="text-xs text-brand-muted mb-3">{product.category}</p>
      <div className="flex items-center justify-between">
        <span className="font-bold">{product.salePrice ? `৳${product.salePrice}` : `৳${product.price}`}</span>
        <Button size="sm" variant="outline" onClick={() => onAdd(product)}>
          Add
        </Button>
      </div>
    </Card>
  );
}

function Heart() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5 0-5.5-4.5-9-9-9s-9 3.5-9 9c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
  );
}
