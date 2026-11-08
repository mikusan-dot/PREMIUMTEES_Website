import { useEffect, useState } from 'react';

/**
 * Returns Date.now(), re-rendering the caller every `intervalMs` — but only while `active`.
 * Used so countdown badges tick and campaigns disappear the moment they expire.
 */
export const useNow = (active, intervalMs = 30000) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
  return now;
};
