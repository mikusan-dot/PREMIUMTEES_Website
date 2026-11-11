import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, ModalDescription, ModalHeader, ModalTitle } from '@/components/ui/modal';
import { PageHeader, Panel, Notice, StatusBadge, EmptyRow, Field, selectClass, slugify, errMsg } from '@/admin/components/common';
import { ImageField } from '@/admin/components/ImageField';

const EMPTY = { name: '', slug: '', description: '', image: '', bannerImage: '', sortOrder: 0, isActive: true, seoTitle: '', seoDescription: '' };
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [missingDefaults, setMissingDefaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState(null);
  const [deleting, setDeleting] = useState(null); // category pending deletion
  const [moveTo, setMoveTo] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data.categories || []);
      setMissingDefaults(res.data.missingDefaults || []);
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to load categories') });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const reset = () => { setForm(EMPTY); setEditingId(null); setSlugTouched(false); };
  const setName = (name) => setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
  const slugError = form.slug && !SLUG_RE.test(form.slug) ? 'Use lowercase letters, numbers and single hyphens only.' : '';

  const edit = (c) => {
    setEditingId(c.id);
    setSlugTouched(true);
    setForm({
      name: c.name || '', slug: c.slug || '', description: c.description || '', image: c.image || '', bannerImage: c.bannerImage || '',
      sortOrder: c.sortOrder ?? 0, isActive: c.isActive !== false, seoTitle: c.seoTitle || '', seoDescription: c.seoDescription || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (slugError) return setMessage({ type: 'error', text: slugError });
    setSaving(true);
    setMessage(null);
    const payload = { ...form, image: form.image || null, bannerImage: form.bannerImage || null, sortOrder: Number(form.sortOrder) || 0 };
    try {
      if (editingId) await api.put(`/admin/categories/${editingId}`, payload);
      else await api.post('/admin/categories', payload);
      setMessage({ type: 'success', text: editingId ? 'Category updated' : 'Category created' });
      reset();
      load();
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to save category') });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c) => {
    setBusyId(c.id);
    try {
      await api.put(`/admin/categories/${c.id}`, { name: c.name, slug: c.slug, description: c.description, image: c.image || null, bannerImage: c.bannerImage || null, sortOrder: c.sortOrder ?? 0, isActive: c.isActive === false, seoTitle: c.seoTitle || '', seoDescription: c.seoDescription || '' });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to update category') });
    } finally {
      setBusyId(null);
    }
  };

  const move = async (index, delta) => {
    const next = [...categories];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next); // optimistic
    try {
      await api.put('/admin/categories/reorder', { order: next.map((c) => c.id) });
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to save the new order') });
      load();
    }
  };

  const askDelete = (c) => {
    const others = categories.filter((x) => x.id !== c.id);
    setDeleting(c);
    setMoveTo(c.productCount > 0 && others.length ? others[0].slug : '');
  };

  const confirmDelete = async () => {
    const c = deleting;
    setBusyId(c.id);
    try {
      const res = await api.delete(`/admin/categories/${c.id}`, { params: moveTo ? { reassignTo: moveTo } : {} });
      const n = res.data.productsAffected || 0;
      setMessage({ type: 'success', text: n ? `Category deleted. ${n} product${n === 1 ? '' : 's'} ${moveTo ? 'moved to the selected category' : 'left without this category (still visible in Shop)'}.` : 'Category deleted' });
      if (editingId === c.id) reset();
      setDeleting(null);
      load();
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to delete category') });
    } finally {
      setBusyId(null);
    }
  };

  const seedDefaults = async () => {
    try {
      const res = await api.post('/admin/categories/seed-defaults', {});
      setMessage({ type: 'success', text: res.data.message });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to add default categories') });
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <PageHeader
        title="Category Management"
        subtitle="These categories drive the storefront menu, the homepage “Shop by Category” section and every /category page."
        action={missingDefaults.length > 0 && <Button variant="outline" onClick={seedDefaults}>Add default categories ({missingDefaults.length})</Button>}
      />
      <Notice message={message} />
      <div className="grid gap-6 xl:grid-cols-5">
        <Panel className="h-fit xl:col-span-2">
          <h2 className="mb-4 font-bold text-brand-black">{editingId ? 'Edit category' : 'New category'}</h2>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Name"><Input value={form.name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hoodies" required maxLength={60} /></Field>
            <Field label="Slug (the web address: /category/…)">
              <Input value={form.slug} onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: slugify(e.target.value) }); }} placeholder="hoodies" required />
              {slugError && <span className="text-xs text-red-600">{slugError}</span>}
              {editingId && <span className="block text-xs text-gray-500">Changing the slug keeps the products attached, but old links to this category stop working.</span>}
            </Field>
            <Field label="Description"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} maxLength={400} className="w-full rounded-md border border-gray-300 bg-brand-white px-3 py-2.5 text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-accent" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageField label="Thumbnail" hint="Shown on cards and in the menu." value={form.image} onChange={(image) => setForm((f) => ({ ...f, image }))} onError={(text) => setMessage({ type: 'error', text })} />
              <ImageField label="Banner" hint="Wide hero on the category page." aspect="aspect-[16/9]" value={form.bannerImage} onChange={(bannerImage) => setForm((f) => ({ ...f, bannerImage }))} onError={(text) => setMessage({ type: 'error', text })} />
            </div>
            <Field label={`SEO title (${form.seoTitle.length}/70)`}><Input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} maxLength={70} placeholder={`${form.name || 'Category'} | Unhinged Co.`} /></Field>
            <Field label={`SEO description (${form.seoDescription.length}/170)`}><textarea value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} rows={2} maxLength={170} className="w-full rounded-md border border-gray-300 bg-brand-white px-3 py-2.5 text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-accent" /></Field>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4" /> Active (visible on the store)
            </label>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving} loading={saving} className="flex-1">{saving ? 'Saving…' : editingId ? 'Update category' : 'Create category'}</Button>
              {editingId && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}
            </div>
          </form>
        </Panel>

        <Panel className="p-0 xl:col-span-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Products</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
              </thead>
              <tbody>
                {loading && <EmptyRow cols={5} text="Loading…" />}
                {!loading && categories.length === 0 && <EmptyRow cols={5} text="No categories yet. Create one, or add the default five." />}
                {categories.map((c, i) => (
                  <tr key={c.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button type="button" aria-label={`Move ${c.name} up`} disabled={i === 0} onClick={() => move(i, -1)} className="rounded border border-gray-200 p-1 text-gray-600 hover:bg-gray-50 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                        <button type="button" aria-label={`Move ${c.name} down`} disabled={i === categories.length - 1} onClick={() => move(i, 1)} className="rounded border border-gray-200 p-1 text-gray-600 hover:bg-gray-50 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {c.image ? <img src={c.image} alt="" className="h-12 w-10 rounded object-cover" /> : <div className="h-12 w-10 rounded bg-gray-100" />}
                        <div><div className="font-medium text-brand-black">{c.name}</div><div className="text-xs text-gray-500">/category/{c.slug}</div></div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{c.productCount ?? 0}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => toggleActive(c)} disabled={busyId === c.id} title="Click to change" aria-label={`Toggle ${c.name} visibility`}>
                        <StatusBadge value={c.isActive === false ? 'inactive' : 'active'} />
                      </button>
                    </td>
                    <td className="space-x-2 whitespace-nowrap px-4 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => edit(c)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => askDelete(c)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Modal open={Boolean(deleting)} onOpenChange={() => setDeleting(null)} className="max-w-md sm:max-w-md">
        {deleting && (
          <div className="space-y-4">
            <ModalHeader>
              <ModalTitle className="text-xl">Delete “{deleting.name}”?</ModalTitle>
              <ModalDescription>
                {deleting.productCount > 0
                  ? `${deleting.productCount} product${deleting.productCount === 1 ? ' is' : 's are'} in this category. Choose where they should go so nothing becomes hard to find.`
                  : 'No products are in this category.'}
              </ModalDescription>
            </ModalHeader>
            {deleting.productCount > 0 && (
              <Field label="Move products to">
                <select value={moveTo} onChange={(e) => setMoveTo(e.target.value)} className={selectClass}>
                  {categories.filter((c) => c.id !== deleting.id).map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                  <option value="">Don’t move (products stay in Shop without this category)</option>
                </select>
              </Field>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={busyId === deleting.id} loading={busyId === deleting.id}>Delete category</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
