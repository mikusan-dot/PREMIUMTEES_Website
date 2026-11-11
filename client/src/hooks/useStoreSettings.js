import { useQuery } from '@tanstack/react-query';
import { apiUrl } from '@/services/api';
import { BRAND } from '@/config/brand';

const DEFAULTS = {
  deliveryChargeInsideDhaka: 80,
  deliveryChargeOutsideDhaka: 150,
  taxPercent: 0,
  instagramImages: [],
  brandName: BRAND.name,
  brandTagline: BRAND.tagline,
  brandDescription: BRAND.description,
  logoUrl: BRAND.logoUrl,
  faviconUrl: BRAND.faviconUrl,
  supportEmail: BRAND.supportEmail,
  supportPhone: BRAND.phone,
  address: BRAND.address,
  instagramUrl: BRAND.instagramUrl,
  facebookUrl: BRAND.facebookUrl,
  tiktokUrl: BRAND.tiktokUrl,
};

const fetchSettings = async () => {
  const res = await fetch(apiUrl('/settings/public'));
  if (!res.ok) throw new Error('settings');
  return res.json();
};

// One shared request for the whole app (React Query de-dupes it). Falls back to the
// defaults while loading or if the server is unreachable, so checkout never breaks.
export const useStoreSettings = () => {
  const { data } = useQuery({ queryKey: ['store-settings'], queryFn: fetchSettings, staleTime: 5 * 60 * 1000 });
  const merged = { ...DEFAULTS };
  Object.entries(data || {}).forEach(([k, v]) => { if (v !== '' && v != null) merged[k] = v; });
  return merged;
};

// Brand-focused view of the settings.
export const useBrand = () => {
  const s = useStoreSettings();
  return {
    name: s.brandName,
    tagline: s.brandTagline,
    description: s.brandDescription,
    logoUrl: s.logoUrl,
    faviconUrl: s.faviconUrl,
    email: s.supportEmail,
    phone: s.supportPhone,
    address: s.address,
    instagramUrl: s.instagramUrl,
    facebookUrl: s.facebookUrl,
    tiktokUrl: s.tiktokUrl,
  };
};

export const isInsideDhaka = (district) => String(district || '').trim().toLowerCase().startsWith('dhaka');
