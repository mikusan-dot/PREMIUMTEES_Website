import { getVariants } from '@/lib/product';

const DAY = 24 * 60 * 60 * 1000;
const NEW_WINDOW_DAYS = 30;
const LOW_STOCK_THRESHOLD = 5;
// Countdowns are only shown for campaigns ending within this window.
const COUNTDOWN_WINDOW_DAYS = 14;

const toTime = (value) => {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

export const totalStock = (product) => {
  const variants = getVariants(product);
  if (variants.length === 0) return product?.inStock === false ? 0 : null;
  return variants.reduce((sum, v) => sum + (Number(v.stock) > 0 ? Number(v.stock) : 0), 0);
};

/** Time left until `endsAt` formatted for a badge, or null when expired / invalid / too far away. */
export const formatCountdown = (endsAt, now = Date.now()) => {
  const end = toTime(endsAt);
  if (end === null) return null;
  const ms = end - now;
  if (ms <= 0 || ms > COUNTDOWN_WINDOW_DAYS * DAY) return null;
  const days = Math.floor(ms / DAY);
  const hours = Math.floor((ms % DAY) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (days >= 1) return `${days}d ${hours}h left`;
  if (hours >= 1) return `${hours}h ${minutes}m left`;
  return `${Math.max(minutes, 1)}m left`;
};

/** A sale is live while it has no end date, or its end date is still in the future. */
export const isSaleActive = (product, now = Date.now()) => {
  const price = Number(product?.price) || 0;
  const sale = Number(product?.salePrice) || 0;
  if (!(sale > 0 && sale < price)) return false;
  const end = toTime(product?.saleEndsAt);
  return end === null || end > now;
};

export const isLimitedActive = (product, now = Date.now()) => {
  const flagged = product?.limitedEdition === true || String(product?.badge || '').trim().toUpperCase() === 'LIMITED EDITION';
  if (!flagged) return false;
  const end = toTime(product?.limitedEndsAt);
  return end === null || end > now;
};

/** The next moment a badge/price on this product changes, so UIs know when to re-render. */
export const nextCampaignEnd = (product, now = Date.now()) => {
  const ends = [
    isSaleActive(product, now) ? toTime(product?.saleEndsAt) : null,
    isLimitedActive(product, now) ? toTime(product?.limitedEndsAt) : null,
  ].filter((t) => t !== null && t > now);
  return ends.length ? Math.min(...ends) : null;
};

/**
 * Ordered badge list for a product. Only the supported labels can appear —
 * free-text legacy values stored in `product.badge` (e.g. "Only two days left") are ignored.
 * Each badge: { key, label, tone }.
 */
export const getProductBadges = (product, now = Date.now()) => {
  const badges = [];
  const stock = totalStock(product);

  if (stock === 0) {
    badges.push({ key: 'out-of-stock', label: 'Out of stock', tone: 'dark' });
    return badges;
  }

  if (isSaleActive(product, now)) {
    const countdown = formatCountdown(product.saleEndsAt, now);
    badges.push({ key: 'sale', label: countdown ? `Sale · ${countdown}` : 'Sale', tone: 'red' });
  }
  if (isLimitedActive(product, now)) {
    const countdown = formatCountdown(product.limitedEndsAt, now);
    badges.push({ key: 'limited', label: countdown ? `Limited · ${countdown}` : 'Limited edition', tone: 'accent' });
  }
  if (stock !== null && stock <= LOW_STOCK_THRESHOLD) {
    badges.push({ key: 'low-stock', label: `Only ${stock} left`, tone: 'amber' });
  }
  if (product?.bestSeller || Number(product?.soldCount) > 0) {
    badges.push({ key: 'best-seller', label: 'Best seller', tone: 'ink' });
  }
  const created = toTime(product?.createdAt);
  if (created !== null && now - created < NEW_WINDOW_DAYS * DAY && now >= created) {
    badges.push({ key: 'new', label: 'New', tone: 'ink' });
  }
  return badges;
};

/** Customer-facing availability line. */
export const getStockLabel = (product) => {
  const stock = totalStock(product);
  if (stock === 0) return { label: 'Out of stock', tone: 'out' };
  if (stock !== null && stock <= LOW_STOCK_THRESHOLD) return { label: `Only ${stock} left`, tone: 'low' };
  return { label: 'In stock', tone: 'in' };
};

export const dedupeProducts = (products = []) => {
  const seen = new Set();
  return products.filter((product) => {
    const key = product?.id || product?.slug || product?.sku || product?.name;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
