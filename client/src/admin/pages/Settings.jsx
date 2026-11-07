import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader, Panel, Notice, Field, errMsg } from '@/admin/components/common';

export const AdminSettings = () => {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get('/admin/settings')
      .then((res) => setForm(res.data.settings))
      .catch((err) => setMessage({ type: 'error', text: errMsg(err, 'Failed to load settings') }));
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api.put('/admin/settings', {
        brandName: form.brandName.trim(),
        brandCurrency: form.brandCurrency.trim() || 'BDT',
        deliveryChargeInsideDhaka: Number(form.deliveryChargeInsideDhaka) || 0,
        deliveryChargeOutsideDhaka: Number(form.deliveryChargeOutsideDhaka) || 0,
        taxPercent: Number(form.taxPercent) || 0,
      });
      setMessage({ type: 'success', text: 'Settings saved' });
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to save settings') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <PageHeader title="Website Settings" subtitle="Brand name and delivery charges" />
      <Notice message={message} />
      {!form ? (!message && <p className="text-sm text-gray-500">Loading...</p>) : (
        <Panel className="max-w-xl">
          <form onSubmit={submit} className="space-y-4">
            <Field label="Brand name"><Input value={form.brandName} onChange={(e) => set('brandName', e.target.value)} required /></Field>
            <Field label="Currency code"><Input value={form.brandCurrency} onChange={(e) => set('brandCurrency', e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Delivery inside Dhaka (BDT)"><Input type="number" min="0" value={form.deliveryChargeInsideDhaka} onChange={(e) => set('deliveryChargeInsideDhaka', e.target.value)} /></Field>
              <Field label="Delivery outside Dhaka (BDT)"><Input type="number" min="0" value={form.deliveryChargeOutsideDhaka} onChange={(e) => set('deliveryChargeOutsideDhaka', e.target.value)} /></Field>
            </div>
            <Field label="Tax percent"><Input type="number" min="0" step="0.1" value={form.taxPercent} onChange={(e) => set('taxPercent', e.target.value)} /></Field>
            <Button type="submit" disabled={saving} loading={saving}>{saving ? 'Saving...' : 'Save settings'}</Button>
          </form>
        </Panel>
      )}
    </div>
  );
};
