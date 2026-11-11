import { VariantMatrix } from '@/admin/components/VariantMatrix';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/input';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const queryClient = useQueryClient();
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
    variants: [],
    categoryIds: [],
    collectionIds: [],
    status: 'active',
    featured: false,
    bestSeller: false,
    limitedEdition: false,
    salePrice: '',
    saleEndsAt: '',
    limitedEndsAt: '',
  });
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formKey, setFormKey] = useState(0);

  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    fetchProducts();
    api.get('/admin/categories').then((res) => setCategories(res.data.categories || [])).catch(() => {});
    api.get('/admin/collections').then((res) => setCollections(res.data.collections || [])).catch(() => {});
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

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone. (Use Archive to just hide it from the store.)`)) return;
    try {
      await api.delete(`/admin/products/${p.id}`);
      setMessage({ type: 'success', text: 'Product deleted' });
      fetchProducts();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to delete product' });
    }
  };

  const toggleStatus = async (p) => {
    try {
      const { id, createdAt, updatedAt, ...rest } = p;
      await api.put(`/admin/products/${p.id}`, { ...rest, status: p.status === 'active' ? 'archived' : 'active' });
      setMessage({ type: 'success', text: p.status === 'active' ? 'Product archived (hidden from the store)' : 'Product is live again' });
      fetchProducts();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update product' });
    }
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const EMPTY_FORM = { name: '', slug: '', sku: '', description: '', price: '', images: [], variants: [], categoryIds: [], collectionIds: [], status: 'active', featured: false, bestSeller: false, limitedEdition: false, salePrice: '', saleEndsAt: '', limitedEndsAt: '' };

  const toLocalInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setFormKey((k) => k + 1);
    setMessage(null);
    setImageUrl('');
    setForm({
      name: p.name || '', slug: p.slug || '', sku: p.sku || '', description: p.description || '', price: String(p.price ?? ''),
      images: p.images || [],
      variants: (p.variants?.length ? p.variants : [{ color: '', size: '', stock: 0 }]).map((v) => ({ sku: v.sku, color: v.color || '', size: v.size || '', stock: String(v.stock ?? 0) })),
      categoryIds: p.categoryIds || [], collectionIds: p.collectionIds || [], status: p.status || 'active',
      featured: !!p.featured, bestSeller: !!p.bestSeller, limitedEdition: !!p.limitedEdition,
      salePrice: p.salePrice ? String(p.salePrice) : '', saleEndsAt: toLocalInput(p.saleEndsAt), limitedEndsAt: toLocalInput(p.limitedEndsAt),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setFormKey((k) => k + 1);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const price = Number(form.price);
    const salePrice = form.salePrice === '' ? 0 : Number(form.salePrice);
    if (!form.name.trim() || !form.slug.trim() || !form.sku.trim()) {
      setMessage({ type: 'error', text: 'Name, slug and SKU are required.' });
      return;
    }
    if (!form.categoryIds.length) {
      setMessage({ type: 'error', text: 'Choose at least one category so customers can find this product.' });
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setMessage({ type: 'error', text: 'Enter a valid price.' });
      return;
    }

    if (!Number.isFinite(salePrice) || salePrice < 0 || (salePrice > 0 && salePrice >= price)) {
      setMessage({ type: 'error', text: 'Sale price must be lower than the regular price.' });
      return;
    }

    const variants = form.variants
      .map((v) => ({ sku: v.sku, color: v.color.trim(), size: v.size.trim(), stock: Number(v.stock) }))
      .filter((v) => v.color || v.size || v.stock > 0);

    if (variants.length === 0) {
      setMessage({ type: 'error', text: 'Choose at least one size and one colour, then set the stock.' });
      return;
    }
    if (variants.some((v) => !v.color || !v.size || !Number.isFinite(v.stock) || v.stock < 0)) {
      setMessage({ type: 'error', text: 'Every variant needs a color, a size and a stock of 0 or more.' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        slug: form.slug.trim(),
        sku: form.sku.trim(),
        price,
        salePrice: salePrice > 0 ? salePrice : null,
        saleEndsAt: salePrice > 0 && form.saleEndsAt ? new Date(form.saleEndsAt).toISOString() : null,
        limitedEndsAt: form.limitedEdition && form.limitedEndsAt ? new Date(form.limitedEndsAt).toISOString() : null,
        variants: variants.map((v) => ({
          sku: v.sku || `${form.sku.trim()}-${v.color}-${v.size}`,
          color: v.color,
          size: v.size,
          stock: v.stock,
        })),
        categoryIds: form.categoryIds.filter(Boolean),
        collectionIds: (form.collectionIds || []).filter(Boolean),
      };
      if (editingId) await api.put(`/admin/products/${editingId}`, payload);
      else await api.post('/admin/products', payload);
      queryClient.invalidateQueries(); // storefront lists refetch immediately
      const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
      setMessage({
        type: 'success',
        text: totalStock > 0
          ? (editingId ? 'Product updated' : 'Product created')
          : `Product ${editingId ? 'updated' : 'created'}, but every variant has 0 stock, so it will show as Out of Stock until you add stock.`,
      });
      setForm(EMPTY_FORM);
      setFormKey((k) => k + 1);
      setEditingId(null);
      setImageUrl('');
      fetchProducts();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save product' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2 space-y-6">
          <h1 className="text-3xl font-bold text-brand-black">{editingId ? 'Edit Product' : 'Product Management'}</h1>

          {message && (
            <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-brand-white border border-gray-200 rounded-2xl p-6 space-y-6">
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
              </div>
              {form.images.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {form.images.map((url, i) => (
                    <div key={url + i} className="relative">
                      <img src={url} alt="" className="h-20 w-20 rounded border object-cover" />
                      <button type="button" aria-label="Remove image" onClick={() => handleChange('images', form.images.filter((_, idx) => idx !== i))} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-black text-xs text-brand-white">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Categories</Label>
              {categories.length === 0 ? (
                <p className="text-sm text-gray-500">No categories yet. Create some on the Categories page first.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => {
                    const on = form.categoryIds.includes(c.slug);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => handleChange('categoryIds', on ? form.categoryIds.filter((x) => x !== c.slug) : [...form.categoryIds, c.slug])}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${on ? 'border-brand-black bg-brand-black text-brand-white' : 'border-gray-300 bg-brand-white text-gray-700 hover:border-brand-black'}`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Collections</Label>
              {collections.length === 0 ? (
                <p className="text-sm text-gray-500">No collections yet. Create one on the Collections page first.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {collections.map((c) => {
                    const on = (form.collectionIds || []).includes(c.slug);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => handleChange('collectionIds', on ? form.collectionIds.filter((x) => x !== c.slug) : [...(form.collectionIds || []), c.slug])}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${on ? 'border-brand-black bg-brand-black text-brand-white' : 'border-gray-300 bg-brand-white text-gray-700 hover:border-brand-black'}`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold text-brand-black mb-4">Sizes, colours &amp; stock</h3>
              <VariantMatrix key={formKey} variants={form.variants} onChange={(variants) => handleChange('variants', variants)} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Sale price (BDT, optional)</Label>
                <Input type="number" value={form.salePrice} onChange={(e) => handleChange('salePrice', e.target.value)} placeholder="990" />
              </div>
              <div>
                <Label>Sale ends (optional — shows a countdown)</Label>
                <Input type="datetime-local" value={form.saleEndsAt} onChange={(e) => handleChange('saleEndsAt', e.target.value)} disabled={!form.salePrice} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" checked={form.limitedEdition} onChange={(e) => handleChange('limitedEdition', e.target.checked)} className="w-4 h-4" />
              <label className="text-sm text-gray-600">Limited edition</label>
            </div>
            {form.limitedEdition && (
              <div>
                <Label>Limited edition ends (optional — shows a countdown)</Label>
                <Input type="datetime-local" value={form.limitedEndsAt} onChange={(e) => handleChange('limitedEndsAt', e.target.value)} />
              </div>
            )}

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

            <Button type="submit" disabled={loading} className="w-full bg-brand-black text-brand-white" loading={loading}>
              {loading ? 'Saving...' : editingId ? 'Save Changes' : 'Create Product'}
            </Button>
            {editingId && <Button type="button" variant="outline" className="w-full" onClick={cancelEdit}>Cancel editing</Button>}
          </form>
        </div>

        <div className="lg:w-1/2">
          <div className="bg-brand-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-bold text-brand-black mb-4">Existing Products ({products.length})</h2>
            {products.length === 0 ? (
              <p className="text-gray-500 text-sm">No products yet.</p>
            ) : (
              <div className="space-y-3">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-12 h-12 object-cover rounded border" />}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-brand-black">{p.name}</div>
                      <div className="text-xs text-gray-500">SKU: {p.sku} · ৳{p.price}</div>
                    </div>
                    <span className={`text-xs font-medium ${p.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>{p.status}</span>
                    <Button type="button" size="sm" variant="outline" onClick={() => startEdit(p)}>Edit</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => toggleStatus(p)}>{p.status === 'active' ? 'Archive' : 'Restore'}</Button>
                    <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(p)}>Delete</Button>
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

export { AdminDashboard } from './Dashboard';
export { AdminOrders } from './Orders';
export { AdminCategories } from './Categories';
export { AdminCollections } from './Collections';
export { AdminCoupons } from './Coupons';
export { AdminPayments } from './Payments';
export { AdminUsers } from './Users';
export { AdminReports } from './Reports';
export { AdminSettings } from './Settings';
