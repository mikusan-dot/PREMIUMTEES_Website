const asArray = (value) => (Array.isArray(value) ? value : []);

const variantStock = (variant) => {
  const stock = Number(variant?.stock);
  return Number.isFinite(stock) && stock > 0 ? stock : 0;
};

export const getVariants = (product) => asArray(product?.variants);

export const isProductInStock = (product) => {
  const variants = getVariants(product);
  if (variants.length === 0) return product?.inStock !== false;
  return variants.some((variant) => variantStock(variant) > 0);
};

export const getProductColors = (product) => {
  const colors = getVariants(product).map((variant) => variant.color).filter(Boolean);
  return colors.length > 0 ? [...new Set(colors)] : asArray(product?.colors);
};

export const getProductSizes = (product) => {
  const sizes = getVariants(product).map((variant) => variant.size).filter(Boolean);
  return sizes.length > 0 ? [...new Set(sizes)] : asArray(product?.sizes);
};

export const getDefaultVariant = (product) => {
  const variants = getVariants(product);
  return variants.find((variant) => variantStock(variant) > 0) ?? variants[0] ?? null;
};

export const getVariantId = (product, color, size) => {
  const variants = getVariants(product);
  if (variants.length > 0) {
    const match = variants.find((variant) => variant.color === color && variant.size === size);
    return (match ?? getDefaultVariant(product))?.sku ?? null;
  }
  const firstColor = getProductColors(product)[0];
  const firstSize = getProductSizes(product)[0];
  return product?.sku && firstColor && firstSize ? `${product.sku}-${firstColor}-${firstSize}` : null;
};

/** Price the customer pays right now: the sale price while a sale is live, otherwise the regular price. */
export const getCurrentPrice = (product, now = Date.now()) => {
  const price = Number(product?.price) || 0;
  const sale = Number(product?.salePrice) || 0;
  const end = product?.saleEndsAt ? new Date(product.saleEndsAt).getTime() : null;
  const live = sale > 0 && sale < price && (end === null || Number.isNaN(end) || end > now);
  return live ? sale : price;
};

export const COLOR_HEX = {
  black: '#0a0a0a', white: '#ffffff', offwhite: '#f7f5f1', charcoal: '#374151', gray: '#9ca3af', grey: '#9ca3af',
  navy: '#1e3a8a', blue: '#2563eb', sky: '#7dd3fc', pink: '#f9a8d4', red: '#dc2626', green: '#16a34a',
  olive: '#4d5d3a', beige: '#d6c7b0', brown: '#6b4f3a', sand: '#e5d3b3', maroon: '#7f1d1d', purple: '#7c3aed',
  yellow: '#facc15', orange: '#f97316', cream: '#f5f0e1', teal: '#0d9488',
};
export const colorHex = (color) => COLOR_HEX[String(color || '').trim().toLowerCase()] || '#d1d5db';

export const toCartItem = (product) => {
  const variant = getDefaultVariant(product);
  const image = product?.images?.find(Boolean) ?? product?.image ?? null;
  if (variant) {
    return {
      ...product,
      image,
      images: product?.images,
      price: getCurrentPrice(product),
      variantId: variant.sku,
      color: variant.color,
      size: variant.size,
    };
  }
  return {
    ...product,
    image,
    images: product?.images,
    price: getCurrentPrice(product),
    variantId: getVariantId(product),
    color: getProductColors(product)[0],
    size: getProductSizes(product)[0],
  };
};
