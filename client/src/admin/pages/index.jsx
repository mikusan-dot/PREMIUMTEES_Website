import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/input';

export const AdminDashboard = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-black mb-8">Dashboard</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[['Total Revenue', '৳1,24,500', 'trending-up'], ['Total Orders', '128', 'shopping-cart'], ['Pending Orders', '14', 'clock'], ['Total Products', '56', 'package']].map(([title, value, icon]) => (
        <div key={title} className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="text-gray-500 text-sm uppercase tracking-wider font-semibold mb-2">{title}</div>
          <div className="text-2xl font-bold text-black">{value}</div>
        </div>
      ))}
    </div>
    <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-black mb-4">Recent Orders</h2>
      <p className="text-gray-500 text-sm">Order management coming in Phase 4.</p>
    </div>
  </div>
);

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [form, setForm] = useState({
    name: '',
    slug: '',
    sku: '',
    description: '',
    price: '',
    images: [],
    variants: [{ color: '', size: '', stock: '' }],
    categoryIds: [],
    status: 'active',
    featured: false,
    bestSeller: false,
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/admin/products');
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(res.data.url);
      setForm((prev) => ({ ...prev, images: [...prev.images, res.data.url] }));
      setMessage({ type: 'success', text: 'Image uploaded' });
    } catch (err) {
      setMessage({ type: 'error', text: `Image upload failed: ${err.response?.data?.error || err.message}` });
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleVariantChange = (index, field, value) => {
    setForm((prev) => {
      const variants = [...prev.variants];
      variants[index][field] = value;
      return { ...prev, variants };
    });
  };

  const addVariant = () => {
    setForm((prev) => ({ ...prev, variants: [...prev.variants, { color: '', size: '', stock: '' }] }));
  };

  const removeVariant = (index) => {
    setForm((prev) => {
      const variants = [...prev.variants];
      variants.splice(index, 1);
      return { ...prev, variants };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        variants: form.variants.map((v) => ({
          sku: v.sku || `${form.sku}-${v.color}-${v.size}`,
          color: v.color,
          size: v.size,
          stock: Number(v.stock) || 0,
        })),
        categoryIds: form.categoryIds.filter(Boolean),
      };
      await api.post('/admin/products', payload);
      setMessage({ type: 'success', text: 'Product created' });
      setForm({ name: '', slug: '', sku: '', description: '', price: '', images: [], variants: [{ color: '', size: '', stock: '' }], categoryIds: [], status: 'active', featured: false, bestSeller: false });
      setImageUrl('');
      fetchProducts();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create product' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2 space-y-6">
          <h1 className="text-3xl font-bold text-black">Product Management</h1>

          {message && (
            <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g. Premium Cotton Tee" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} placeholder="e.g. premium-cotton-tee" />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={form.sku} onChange={(e) => handleChange('sku', e.target.value)} placeholder="e.g. TEE-001" />
              </div>
              <div className="space-y-2">
                <Label>Price (BDT)</Label>
                <Input type="number" value={form.price} onChange={(e) => handleChange('price', e.target.value)} placeholder="1200" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <textarea className="block w-full rounded-md border border-gray-300 p-3 text-sm" value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
                  {uploading ? 'Uploading...' : 'Upload T-Shirt Design Image'}
                </Label>
                {imageUrl && (
                  <div className="flex items-center gap-3">
                    <img src={imageUrl} alt="preview" className="w-20 h-20 object-cover rounded border" />
                    <Button type="button" variant="outline" size="sm" onClick={() => setImageUrl('')}>Remove</Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categories (comma separated)</Label>
              <Input value={form.categoryIds.join(', ')} onChange={(e) => handleChange('categoryIds', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="t-shirts, cotton, new-arrival" />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold text-black mb-4">Variants</h3>
              {form.variants.map((v, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 border-b pb-2 last:border-0 last:pb-0">
                  <Input placeholder="Color" value={v.color} onChange={(e) => handleVariantChange(i, 'color', e.target.value)} />
                  <Input placeholder="Size" value={v.size} onChange={(e) => handleVariantChange(i, 'size', e.target.value)} />
                  <Input type="number" placeholder="Stock" value={v.stock} onChange={(e) => handleVariantChange(i, 'stock', e.target.value)} />
                  <Button type="button" variant="outline" size="sm" onClick={() => removeVariant(i)} disabled={form.variants.length === 1}>Remove</Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addVariant}>+ Add Variant</Button>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" checked={form.featured} onChange={(e) => handleChange('featured', e.target.checked)} className="w-4 h-4" />
              <label className="text-sm text-gray-600">Featured</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={form.bestSeller} onChange={(e) => handleChange('bestSeller', e.target.checked)} className="w-4 h-4" />
              <label className="text-sm text-gray-600">Best Seller</label>
            </div>

            <div className="flex items-center gap-3">
              <Label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.status === 'active'} onChange={(e) => handleChange('status', e.target.checked ? 'active' : 'archived')} className="w-4 h-4" />
                Active
              </Label>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-black text-white" loading={loading}>
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </form>
        </div>

        <div className="lg:w-1/2">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-bold text-black mb-4">Existing Products ({products.length})</h2>
            {products.length === 0 ? (
              <p className="text-gray-500 text-sm">No products yet.</p>
            ) : (
              <div className="space-y-3">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-12 h-12 object-cover rounded border" />}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-black">{p.name}</div>
                      <div className="text-xs text-gray-500">SKU: {p.sku} · ৳{p.price}</div>
                    </div>
                    <span className={`text-xs font-medium ${p.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>{p.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminOrders = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-black mb-8">Order Management</h1>
    <p className="text-gray-500 text-sm">Order processing coming in Phase 4.</p>
  </div>
);

export const AdminCategories = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-black mb-8">Category Management</h1>
    <p className="text-gray-500 text-sm">Category CRUD coming in Phase 4.</p>
  </div>
);

export const AdminCoupons = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-black mb-8">Coupon Management</h1>
    <p className="text-gray-500 text-sm">Coupon system coming in Phase 5.</p>
  </div>
);

export const AdminPayments = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-black mb-8">Payment Management</h1>
    <p className="text-gray-500 text-sm">Payment records coming in Phase 5.</p>
  </div>
);

export const AdminUsers = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-black mb-8">Admin Users</h1>
    <p className="text-gray-500 text-sm">Role & permission management coming in Phase 4.</p>
  </div>
);

export const AdminReports = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-black mb-8">Reports & Analytics</h1>
    <p className="text-gray-500 text-sm">Recharts analytics coming in Phase 5.</p>
  </div>
);

export const AdminSettings = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-black mb-8">Website Settings</h1>
    <p className="text-gray-500 text-sm">Brand identity & content management coming in Phase 5.</p>
  </div>
);
