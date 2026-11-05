import { useParams } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=600&fit=crop&q=80';

const PRODUCT = {
  id: 'p1',
  name: 'Classic Oversized Tee',
  slug: 'classic-oversized-tee',
  sku: 'TEE-001',
  description: 'A premium heavyweight cotton oversized T-shirt with a relaxed, modern silhouette. Designed for comfort and cut with clean finishes, this tee is a wardrobe essential for everyday wear.',
  price: 850,
  salePrice: 750,
  fabric: '100% Combed Cotton',
  gsm: 240,
  fit: 'Oversized',
  category: 'Oversized T-shirts',
  collections: ['Summer Collection', 'New Arrivals'],
  images: [
    PLACEHOLDER,
    'https://images.unsplash.com/photo-1503341544254-5272518500aa?w=800&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583743814966-49e1fc1c883f?w=800&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1602810388489-47791f8ba1b5?w=800&h=800&fit=crop&q=80',
  ],
  badge: 'NEW',
  inStock: true,
  status: 'active',
  variants: [
    { sku: 'TEE-001-BLK-M', color: 'Black', size: 'M', stock: 15 },
    { sku: 'TEE-001-BLK-L', color: 'Black', size: 'L', stock: 10 },
    { sku: 'TEE-001-BLK-XL', color: 'Black', size: 'XL', stock: 8 },
    { sku: 'TEE-001-WHT-M', color: 'White', size: 'M', stock: 12 },
    { sku: 'TEE-001-WHT-L', color: 'White', size: 'L', stock: 9 },
    { sku: 'TEE-001-CHR-M', color: 'Charcoal', size: 'M', stock: 7 },
  ],
  sizes: ['M', 'L', 'XL'],
  colors: ['Black', 'White', 'Charcoal'],
};

const SIZE_CHART = {
  M: { chest: '56 cm', length: '72 cm', shoulder: '54 cm', sleeve: '22 cm' },
  L: { chest: '60 cm', length: '74 cm', shoulder: '56 cm', sleeve: '23 cm' },
  XL: { chest: '64 cm', length: '76 cm', shoulder: '58 cm', sleeve: '24 cm' },
};

export const ProductDetail = () => {
  const { slug } = useParams();
  const { addItem } = useCartStore();
  const [selectedColor, setSelectedColor] = useState('Black');
  const [selectedSize, setSelectedSize] = useState('M');
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { toggle } = { toggle: () => {} };

  const variant = PRODUCT.variants.find((v) => v.color === selectedColor && v.size === selectedSize);
  const inStock = variant ? variant.stock > 0 : false;

  return (
    <section className="section">
      <div className="container-premium">
        <nav className="mb-8 text-sm text-brand-muted">
          <a href="/shop" className="hover:text-brand-black">Home</a> <span>/</span>
          <a href="/shop" className="hover:text-brand-black">Shop</a> <span>/</span>
          <span className="text-brand-black">{PRODUCT.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-6">
            <div className="relative h-[500px] rounded-2xl overflow-hidden border border-brand-border bg-brand-offwhite">
              <img
                src={PRODUCT.images[activeImage]}
                alt={PRODUCT.name}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              {PRODUCT.badge && <Badge variant="sale" className="absolute top-4 left-4 z-10">{PRODUCT.badge}</Badge>}
              {!inStock && <Badge variant="out-of-stock" className="absolute top-4 left-4 z-10">Out of Stock</Badge>}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {PRODUCT.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 ${activeImage === i ? 'border-brand-accent' : 'border-transparent'} bg-brand-offwhite`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-8">
            <div>
              <Badge variant="sale" className="mb-3 inline-block">{PRODUCT.badge}</Badge>
              <h1 className="text-4xl font-bold text-brand-black mb-2">{PRODUCT.name}</h1>
              <p className="text-brand-muted text-sm uppercase tracking-widest font-semibold">{PRODUCT.sku}</p>
              <p className="text-brand-charcoal mb-6">{PRODUCT.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-brand-muted border-t border-brand-border pt-6">
                <div><div className="text-brand-black font-semibold">SKU</div>{PRODUCT.sku}</div>
                <div><div className="text-brand-black font-semibold">Fit</div>{PRODUCT.fit}</div>
                <div><div className="text-brand-black font-semibold">Fabric</div>{PRODUCT.fabric}</div>
                <div><div className="text-brand-black font-semibold">GSM</div>{PRODUCT.gsm}</div>
                <div><div className="text-brand-black font-semibold">Category</div>{PRODUCT.category}</div>
                <div><div className="text-brand-black font-semibold">Collections</div>{PRODUCT.collections.join(', ')}</div>
                <div><div className="text-brand-black font-semibold">Status</div><span className="text-green-600 font-semibold">Active</span></div>
                <div><div className="text-brand-black font-semibold">Stock</div>{inStock ? 'In Stock' : 'Out of Stock'}</div>
              </div>
            </div>

            {/* Variant selection */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="label">Select Color</label>
                <div className="flex gap-3">
                  {PRODUCT.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`h-10 w-10 rounded-full border-2 transition-all ${selectedColor === c ? 'ring-2 ring-brand-accent' : ''} ${colorToClass(c)}`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="label">Select Size</label>
                <div className="flex gap-3">
                  {PRODUCT.sizes.map((s) => {
                    const v = PRODUCT.variants.find((x) => x.color === selectedColor && x.size === s);
                    const available = v ? v.stock > 0 : false;
                    return (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        disabled={!available}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition-all ${selectedSize === s ? 'bg-brand-black text-white border-brand-black' : `border-brand-border ${!available ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-offwhite'}`}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="label">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</Button>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border border-brand-border rounded-md px-2"
                    readOnly
                  />
                  <Button variant="outline" size="sm" onClick={() => setQty((q) => q + 1)}>+</Button>
                </div>
              </div>
            </div>

            {/* Pricing & actions */}
            <div className="space-y-4 border-t border-brand-border pt-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-brand-black">৳{PRODUCT.salePrice ?? PRODUCT.price}</span>
                {PRODUCT.salePrice && <span className="text-lg text-brand-muted line-through">৳{PRODUCT.price}</span>}
              </div>
              <p className="text-sm text-brand-muted">
                {variant ? `Available: {variant.stock} piece(s) in {selectedColor} / {selectedSize}` : 'Variant out of stock'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  disabled={!inStock || qty > (variant?.stock ?? 0)}
                  onClick={() => {
                    addItem({ ...PRODUCT, variantId: variant?.sku, color: selectedColor, size: selectedSize, price: PRODUCT.salePrice ?? PRODUCT.price, quantity: qty });
                  }}
                >
                  {inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto" disabled={!inStock}>
                  Buy Now
                </Button>
              </div>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => toggle(PRODUCT.id)}>
                  Add to Wishlist
                </Button>
            </div>

            {/* Size guide */}
            <Card className="border-brand-border">
              <CardHeader>
                <CardTitle>Size Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border text-brand-muted">
                      <th className="pb-3 font-semibold text-brand-black">Size</th>
                      <th className="pb-3 font-semibold text-brand-black">Chest</th>
                      <th className="pb-3 font-semibold text-brand-black">Length</th>
                      <th className="pb-3 font-semibold text-brand-black">Shoulder</th>
                      <th className="pb-3 font-semibold text-brand-black">Sleeve</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(SIZE_CHART).map(([size, m]) => (
                      <tr key={size} className="border-b border-brand-border/50">
                        <td className="py-3 font-semibold">{size}</td>
                        <td className="py-3">{m.chest}</td>
                        <td className="py-3">{m.length}</td>
                        <td className="py-3">{m.shoulder}</td>
                        <td className="py-3">{m.sleeve}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

function colorToClass(c) {
  const map = { Black: 'bg-black', White: 'bg-white border', Charcoal: 'bg-gray-700', Navy: 'bg-blue-900', Pink: 'bg-pink-500' };
  return map[c] ?? 'bg-gray-400';
}
