import { useEffect, useRef, useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader, Panel, Notice, StatusBadge, EmptyRow, Field, slugify, errMsg } from '@/admin/components/common';

const EMPTY = { name: '', slug: '', description: '', image: '', sortOrder: 0, isActive: true };

export const AdminCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInput = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/collections');
      setCollections(res.data.collections || []);
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to load collections') });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const reset = () => { setForm(EMPTY); setEditingId(null); setSlugTouched(false); };
  const setName = (name) => setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));

  const edit = (c) => {
    setEditingId(c.id);
    setSlugTouched(true);
    setForm({ name: c.name || '', slug: c.slug || '', description: c.description || '', image: c.image || '', sortOrder: c.sortOrder ?? 0, isActive: c.isActive !== false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const body = new FormData();
      body.append('image', file);
      const res = await api.post('/admin/upload', body, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm((f) => ({ ...f, image: res.data.url }));
    } catch (err) {
      setMessage({ type: 'error', text: `Image upload failed: ${errMsg(err, 'Try again')}` });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const payload = { ...form, image: form.image || null, sortOrder: Number(form.sortOrder) || 0 };
    try {
      if (editingId) await api.put(`/admin/collections/${editingId}`, payload);
      else await api.post('/admin/collections', payload);
      setMessage({ type: 'success', text: editingId ? 'Collection updated' : 'Collection created' });
      reset();
      load();
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to save collection') });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete collection "${c.name}"? Products stay on the store but are removed from this collection.`)) return;
    try {
      await api.delete(`/admin/collections/${c.id}`);
      setMessage({ type: 'success', text: 'Collection deleted' });
      if (editingId === c.id) reset();
      load();
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to delete collection') });
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <PageHeader title="Collections" subtitle="Curated drops such as “Summer 2026”. Add products to a collection from the Products page." />
      <Notice message={message} />
      <div className="grid gap-6 lg:grid-cols-5">
        <Panel className="h-fit lg:col-span-2">
          <h2 className="mb-4 font-bold text-brand-black">{editingId ? 'Edit collection' : 'New collection'}</h2>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Name"><Input value={form.name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Summer 2026" required /></Field>
            <Field label="Slug (used in the web address)"><Input value={form.slug} onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: slugify(e.target.value) }); }} placeholder="summer-2026" required /></Field>
            <Field label="Description (optional)"><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <Field label="Cover image (optional)">
              <div className="flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-brand-white px-4 py-2.5 text-sm font-semibold text-brand-black hover:bg-gray-50">
                  <input ref={fileInput} type="file" accept="image/*" onChange={upload} className="sr-only" />
                  {uploading ? 'Uploading...' : form.image ? 'Replace image' : 'Upload image'}
                </label>
                {form.image && (
                  <>
                    <img src={form.image} alt="" className="h-14 w-14 rounded border object-cover" />
                    <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, image: '' })}>Remove</Button>
                  </>
                )}
              </div>
            </Field>
            <Field label="Sort order (lower shows first)"><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></Field>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4" /> Visible on the store
            </label>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving || uploading} loading={saving} className="flex-1">{saving ? 'Saving...' : editingId ? 'Update collection' : 'Create collection'}</Button>
              {editingId && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}
            </div>
          </form>
        </Panel>

        <Panel className="p-0 lg:col-span-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Products</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
              </thead>
              <tbody>
                {loading && <EmptyRow cols={5} text="Loading..." />}
                {!loading && collections.length === 0 && <EmptyRow cols={5} text="No collections yet. Create your first drop." />}
                {collections.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-brand-black">{c.name}<div className="text-xs font-normal text-gray-500">/{c.slug}</div></td>
                    <td className="px-4 py-3">{c.productCount ?? 0}</td>
                    <td className="px-4 py-3">{c.sortOrder ?? 0}</td>
                    <td className="px-4 py-3"><StatusBadge value={c.isActive === false ? 'inactive' : 'active'} /></td>
                    <td className="space-x-2 whitespace-nowrap px-4 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => edit(c)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => remove(c)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
};
