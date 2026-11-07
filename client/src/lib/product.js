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

export const toCartItem = (product) => {
  const variant = getDefaultVariant(product);
  if (variant) {
    return {
      ...product,
      variantId: variant.sku,
      color: variant.color,
      size: variant.size,
    };
  }
  return {
    ...product,
    variantId: getVariantId(product),
    color: getProductColors(product)[0],
    size: getProductSizes(product)[0],
  };
};
