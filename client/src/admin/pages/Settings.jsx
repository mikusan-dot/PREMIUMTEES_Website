import { useEffect, useRef, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader, Panel, Notice, Field, errMsg } from '@/admin/components/common';

export const AdminSettings = () => {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const galleryInput = useRef(null);

  useEffect(() => {
    api.get('/admin/settings')
      .then((res) => setForm(res.data.settings))
      .catch((err) => setMessage({ type: 'error', text: errMsg(err, 'Failed to load settings') }));
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setMessage(null);
    try {
      const uploaded = [];
      for (const file of files) {
        const body = new FormData();
        body.append('image', file);
        const res = await api.post('/admin/upload', body, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploaded.push(res.data.url);
      }
      setForm((f) => ({ ...f, instagramImages: [...(f.instagramImages || []), ...uploaded] }));
      setMessage({ type: 'success', text: `${uploaded.length} image${uploaded.length === 1 ? '' : 's'} uploaded` });
    } catch (err) {
      setMessage({ type: 'error', text: `Image upload failed: ${errMsg(err, 'Try again')}` });
    } finally {
      setUploading(false);
      if (galleryInput.current) galleryInput.current.value = '';
    }
  };

  const removeGalleryImage = (url) => {
    setForm((f) => ({ ...f, instagramImages: (f.instagramImages || []).filter((item) => item !== url) }));
  };

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
        instagramUrl: (form.instagramUrl || '').trim(),
        instagramImages: form.instagramImages || [],
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
      <PageHeader title="Website Settings" subtitle="Brand, delivery charges, and homepage social gallery" />
      <Notice message={message} />
      {!form ? (!message && <p className="text-sm text-gray-500">Loading...</p>) : (
        <Panel className="max-w-2xl">
          <form onSubmit={submit} className="space-y-4">
            <Field label="Brand name"><Input value={form.brandName} onChange={(e) => set('brandName', e.target.value)} required /></Field>
            <Field label="Currency code"><Input value={form.brandCurrency} onChange={(e) => set('brandCurrency', e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Delivery inside Dhaka (BDT)"><Input type="number" min="0" value={form.deliveryChargeInsideDhaka} onChange={(e) => set('deliveryChargeInsideDhaka', e.target.value)} /></Field>
              <Field label="Delivery outside Dhaka (BDT)"><Input type="number" min="0" value={form.deliveryChargeOutsideDhaka} onChange={(e) => set('deliveryChargeOutsideDhaka', e.target.value)} /></Field>
            </div>
            <Field label="Tax percent"><Input type="number" min="0" step="0.1" value={form.taxPercent} onChange={(e) => set('taxPercent', e.target.value)} /></Field>

            <div className="space-y-4 border-t border-gray-100 pt-5">
              <div>
                <h3 className="text-base font-semibold text-black">Instagram gallery</h3>
                <p className="text-xs text-gray-500">Shown on the homepage. If no images are added, product photos are used instead.</p>
              </div>
              <Field label="Instagram profile URL">
                <Input
                  type="url"
                  placeholder="https://www.instagram.com/yourstore"
                  value={form.instagramUrl || ''}
                  onChange={(e) => set('instagramUrl', e.target.value)}
                />
              </Field>
              <div>
                <span className="mb-1.5 block text-sm font-medium text-gray-700">Gallery images</span>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-gray-50">
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload images'}
                  <input
                    ref={galleryInput}
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    disabled={uploading}
                    onChange={handleGalleryUpload}
                  />
                </label>
              </div>
              {(form.instagramImages || []).length > 0 && (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {(form.instagramImages || []).map((url) => (
                    <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      <img src={url} alt="Instagram gallery" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        aria-label="Remove image"
                        onClick={() => removeGalleryImage(url)}
                        className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 text-red-600 shadow-sm hover:bg-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" disabled={saving} loading={saving}>{saving ? 'Saving...' : 'Save settings'}</Button>
          </form>
        </Panel>
      )}
    </div>
  );
};
