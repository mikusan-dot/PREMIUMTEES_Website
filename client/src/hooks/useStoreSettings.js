import { useEffect, useState } from 'react';
import { apiUrl } from '@/services/api';

const DEFAULTS = { deliveryChargeInsideDhaka: 80, deliveryChargeOutsideDhaka: 150, taxPercent: 0 };

// Delivery charges and tax come from Admin -> Settings. Falls back to the defaults
// while loading or if the server is unreachable, so checkout never breaks.
export const useStoreSettings = () => {
  const [settings, setSettings] = useState(DEFAULTS);
  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl('/settings/public'))
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => { if (json && !cancelled) setSettings({ ...DEFAULTS, ...json }); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return settings;
};

export const isInsideDhaka = (district) => String(district || '').trim().toLowerCase().startsWith('dhaka');
