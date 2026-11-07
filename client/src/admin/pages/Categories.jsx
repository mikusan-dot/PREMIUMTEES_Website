import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader, Panel, Notice, StatusBadge, EmptyRow, Field, slugify, errMsg } from '@/admin/components/common';

const EMPTY = { name: '', slug: '', description: '', sortOrder: 0, isActive: true };

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data.categories || []);
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to load categories') });
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
    setForm({ name: c.name || '', slug: c.slug || '', description: c.description || '', sortOrder: c.sortOrder ?? 0, isActive: c.isActive !== false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 };
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

  const remove = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"? Products keep their data but lose this category.`)) return;
    try {
      await api.delete(`/admin/categories/${c.id}`);
      setMessage({ type: 'success', text: 'Category deleted' });
      if (editingId === c.id) reset();
      load();
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to delete category') });
    }
  };

  return (
    <div className="p-8">
      <PageHeader title="Category Management" subtitle="Group products so customers can browse them" />
      <Notice message={message} />
      <div className="grid gap-6 lg:grid-cols-5">
        <Panel className="lg:col-span-2 h-fit">
          <h2 className="mb-4 font-bold text-black">{editingId ? 'Edit category' : 'New category'}</h2>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Name"><Input value={form.name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Oversized Tees" required /></Field>
            <Field label="Slug (used in the web address)"><Input value={form.slug} onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: slugify(e.target.value) }); }} placeholder="oversized-tees" required /></Field>
            <Field label="Description (optional)"><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <Field label="Sort order (lower shows first)"><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></Field>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4" /> Visible on the store
            </label>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving} loading={saving} className="flex-1">{saving ? 'Saving...' : editingId ? 'Update category' : 'Create category'}</Button>
              {editingId && <Button variant="outline" onClick={reset}>Cancel</Button>}
            </div>
          </form>
        </Panel>

        <Panel className="lg:col-span-3 p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
              </thead>
              <tbody>
                {loading && <EmptyRow cols={5} text="Loading..." />}
                {!loading && categories.length === 0 && <EmptyRow cols={5} text="No categories yet. Create your first one." />}
                {categories.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-black">{c.name}</td>
                    <td className="px-4 py-3 text-gray-500">{c.slug}</td>
                    <td className="px-4 py-3">{c.sortOrder ?? 0}</td>
                    <td className="px-4 py-3"><StatusBadge value={c.isActive === false ? 'inactive' : 'active'} /></td>
                    <td className="space-x-2 px-4 py-3 text-right">
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
