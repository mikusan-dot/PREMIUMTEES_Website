import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  sku: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  salePrice: z.number().nonnegative().optional().nullable(),
  fabric: z.string().optional(),
  gsm: z.number().nonnegative().optional(),
  fit: z.string().optional(),
  categoryIds: z.array(z.string()).default([]),
  collectionIds: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  variants: z.array(z.object({
    sku: z.string(),
    color: z.string(),
    size: z.string(),
    stock: z.number().nonnegative(),
  })).default([]),
  status: z.enum(['active', 'archived']).default('active'),
  featured: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
});

export const orderSchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    phone: z.string().min(5),
    email: z.string().email().optional().nullable(),
    district: z.string().min(1),
    area: z.string().min(1),
    address: z.string().min(5),
  }),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string(),
    name: z.string(),
    sku: z.string(),
    color: z.string(),
    size: z.string(),
    quantity: z.number().positive(),
    price: z.number().nonnegative(),
  })).nonempty(),
  subtotal: z.number().nonnegative(),
  discount: z.number().nonnegative().default(0),
  deliveryCharge: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  paymentMethod: z.enum(['cod', 'bkash', 'nagad', 'card']),
  notes: z.string().optional().nullable(),
});

export const couponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  type: z.enum(['percentage', 'fixed', 'free_delivery']),
  value: z.number().nonnegative(),
  minOrder: z.number().nonnegative().default(0),
  maxDiscount: z.number().nonnegative().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  expiryDate: z.string().datetime().optional().nullable(),
  usageLimit: z.number().nonnegative().optional().nullable(),
  perCustomerLimit: z.number().nonnegative().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  image: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export const settingsSchema = z.object({
  brandName: z.string().min(1),
  brandCurrency: z.string().default('BDT'),
  deliveryChargeInsideDhaka: z.number().nonnegative().default(80),
  deliveryChargeOutsideDhaka: z.number().nonnegative().default(150),
  taxPercent: z.number().nonnegative().default(0),
  instagramUrl: z.union([z.string().url(), z.literal('')]).default(''),
  instagramImages: z.array(z.string().url()).default([]),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email(),
});

export const ADMIN_ROLES = ['super_admin', 'product_manager', 'order_manager', 'marketing_manager', 'viewer'];

export const adminUserSchema = z.object({
  email: z.string().email(),
  // Only needed when the Firebase sign-in account does not exist yet.
  password: z.string().min(6).optional(),
  role: z.enum(ADMIN_ROLES),
});

export const adminRoleSchema = z.object({
  role: z.enum(ADMIN_ROLES),
});

export const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const validate = (schema) => (req, res, next) => {
  try {
    req.validated = schema.parse(req.body);
    next();
  } catch (err) {
    res.status(400).json({ error: 'Validation failed', details: err.errors });
  }
};
