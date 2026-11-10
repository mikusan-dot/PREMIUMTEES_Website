import { useRef, useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { errMsg } from '@/admin/components/common';

/** Uploads one image to Cloudinary through the admin upload endpoint and reports the resulting URL. */
export const ImageField = ({ label, hint, value, onChange, onError, aspect = 'aspect-[4/5]' }) => {
  const input = useRef(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append('image', file);
      const res = await api.post('/admin/upload', body, { headers: { 'Content-Type': 'multipart/form-data' } });
      onChange(res.data.url);
    } catch (err) {
      onError?.(`Image upload failed: ${errMsg(err, 'Try again')}`);
    } finally {
      setUploading(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium text-gray-700">{label}</span>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      <div className="flex items-center gap-3">
        <div className={`${aspect} w-24 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100`}>
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[10px] text-gray-500">No image</div>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-brand-white px-4 py-2 text-sm font-semibold text-brand-black hover:bg-gray-50">
            <input ref={input} type="file" accept="image/*" onChange={upload} className="sr-only" disabled={uploading} />
            {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload'}
          </label>
          {value && <Button type="button" variant="outline" size="sm" onClick={() => onChange('')}>Remove</Button>}
        </div>
      </div>
    </div>
  );
};
