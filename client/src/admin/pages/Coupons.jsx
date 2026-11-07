import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader, Panel, Notice, StatusBadge, EmptyRow, Field, selectClass, money, errMsg } from '@/admin/components/common';

const EMPTY = { code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', expiryDate: '', usageLimit: '', isActive: true };

const describe = (c) => (c.type === 'percentage' ? `${c.value}% off` : c.type === 'fixed' ? `${money(c.value)} off` : 'Free delivery');

export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/coupons');
      setCoupons(res.data.coupons || []);
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to load coupons') });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const reset = () => { setForm(EMPTY); setEditingId(null); };

  const edit = (c) => {
    setEditingId(c.id);
    setForm({
      code: c.code || '', type: c.type || 'percentage', value: c.value ?? '', minOrder: c.minOrder || '', maxDiscount: c.maxDiscount || '',
      expiryDate: c.expiryDate ? c.expiryDate.slice(0, 10) : '', usageLimit: c.usageLimit || '', isActive: c.isActive !== false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const num = (v) => (v === '' || v === null ? null : Number(v));
    const payload = {
      code: form.code.trim(),
      type: form.type,
      value: form.type === 'free_delivery' ? 0 : Number(form.value) || 0,
      minOrder: Number(form.minOrder) || 0,
      maxDiscount: form.type === 'percentage' ? num(form.maxDiscount) : null,
      expiryDate: form.expiryDate ? new Date(`${form.expiryDate}T23:59:59`).toISOString() : null,
      usageLimit: num(form.usageLimit),
      isActive: form.isActive,
    };
    try {
      if (editingId) await api.put(`/admin/coupons/${editingId}`, payload);
      else await api.post('/admin/coupons', payload);
      setMessage({ type: 'success', text: editingId ? 'Coupon updated' : 'Coupon created' });
      reset();
      load();
    } catch (err) {
      const details = err.response?.data?.details?.[0];
      setMessage({ type: 'error', text: details ? `${details.path?.join('.')}: ${details.message}` : errMsg(err, 'Failed to save coupon') });
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c) => {
    try {
      await api.put(`/admin/coupons/${c.id}`, { code: c.code, type: c.type, value: c.value, minOrder: c.minOrder || 0, maxDiscount: c.maxDiscount ?? null, expiryDate: c.expiryDate ?? null, usageLimit: c.usageLimit ?? null, isActive: c.isActive === false });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to update coupon') });
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return;
    try {
      await api.delete(`/admin/coupons/${c.id}`);
      setMessage({ type: 'success', text: 'Coupon deleted' });
      if (editingId === c.id) reset();
      load();
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to delete coupon') });
    }
  };

  const expired = (c) => c.expiryDate && new Date(c.expiryDate) < new Date();

  return (
    <div className="p-8">
      <PageHeader title="Coupon Management" subtitle="Discount codes customers can use at checkout" />
      <Notice message={message} />
      <div className="grid gap-6 lg:grid-cols-5">
        <Panel className="lg:col-span-2 h-fit">
          <h2 className="mb-4 font-bold text-black">{editingId ? 'Edit coupon' : 'New coupon'}</h2>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Code (min 3 characters)"><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="WELCOME10" required /></Field>
            <Field label="Type">
              <select className={selectClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="percentage">Percentage off</option>
                <option value="fixed">Fixed amount off</option>
                <option value="free_delivery">Free delivery</option>
              </select>
            </Field>
            {form.type !== 'free_delivery' && (
              <Field label={form.type === 'percentage' ? 'Percent off' : 'Amount off (BDT)'}><Input type="number" min="0" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required /></Field>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Minimum order (BDT)"><Input type="number" min="0" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} placeholder="0" /></Field>
              {form.type === 'percentage' && <Field label="Max discount (BDT)"><Input type="number" min="0" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="No limit" /></Field>}
            </div>
            <Field label="Expiry date (optional)"><Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></Field>
            <Field label="Total usage limit (optional)"><Input type="number" min="0" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="Unlimited" /></Field>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4" /> Active
            </label>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving} loading={saving} className="flex-1">{saving ? 'Saving...' : editingId ? 'Update coupon' : 'Create coupon'}</Button>
              {editingId && <Button variant="outline" onClick={reset}>Cancel</Button>}
            </div>
          </form>
        </Panel>

        <Panel className="lg:col-span-3 p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Offer</th><th className="px-4 py-3">Min order</th><th className="px-4 py-3">Expires</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
              </thead>
              <tbody>
                {loading && <EmptyRow cols={6} text="Loading..." />}
                {!loading && coupons.length === 0 && <EmptyRow cols={6} text="No coupons yet." />}
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 font-mono font-semibold text-black">{c.code}</td>
                    <td className="px-4 py-3">{describe(c)}{c.maxDiscount ? <div className="text-xs text-gray-500">up to {money(c.maxDiscount)}</div> : null}</td>
                    <td className="px-4 py-3">{c.minOrder ? money(c.minOrder) : '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('en-GB') : 'Never'}</td>
                    <td className="px-4 py-3"><StatusBadge value={expired(c) ? 'cancelled' : c.isActive === false ? 'inactive' : 'active'} />{expired(c) && <span className="ml-1 text-xs text-red-600">expired</span>}</td>
                    <td className="space-x-2 px-4 py-3 text-right whitespace-nowrap">
                      <Button size="sm" variant="outline" onClick={() => toggle(c)}>{c.isActive === false ? 'Enable' : 'Disable'}</Button>
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
