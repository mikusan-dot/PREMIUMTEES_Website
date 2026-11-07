import { db } from './db.js';
import { nanoid } from 'nanoid';

const COLLECTIONS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  COUPONS: 'coupons',
  SETTINGS: 'settings',
  PAYMENTS: 'payments',
  ADMINS: 'admins',
  ADMIN_LOGS: 'admin_activity_logs',
  INVENTORY_LOGS: 'inventory_logs',
  CUSTOMERS: 'customers',
};

export const generateOrderId = () => `PT-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`;

const logAction = async ({ adminId, adminName, action, target, details }) => {
  try {
    await db.collection(COLLECTIONS.ADMIN_LOGS).add({
      adminId,
      adminName,
      action,
      target,
      details,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Failed to write activity log', e);
  }
};

// ---------- Products ----------
export const productController = {
  list: async (req, res) => {
    try {
      const { featured, category, limit = 20, status = 'active' } = req.query;
      let products = [];
      if (process.env.DEV_MODE === 'true') {
        const snap = await db.collection(COLLECTIONS.PRODUCTS).query(
          (d) => d.status === status,
          { orderBy: 'desc', field: 'createdAt', limit: Number(limit) }
        );
        products = snap.map((d) => d.data());
      } else {
        let q = db.collection(COLLECTIONS.PRODUCTS).where('status', '==', status);
        if (featured === 'true') q = q.where('featured', '==', true);
        const snap = await q.limit(Number(limit)).get();
        products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
      if (category) products = products.filter((p) => p.categoryIds && p.categoryIds.includes(category));
      res.json({ products });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getBySlug: async (req, res) => {
    try {
      let product = null;
      if (process.env.DEV_MODE === 'true') {
        const snap = await db.collection(COLLECTIONS.PRODUCTS).query((d) => d.slug === req.params.slug);
        product = snap.length ? snap[0].data() : null;
      } else {
        const snap = await db.collection(COLLECTIONS.PRODUCTS).where('slug', '==', req.params.slug).limit(1).get();
        product = snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
      }
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json({ product });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const data = req.validated;
      const now = new Date().toISOString();
      const doc = await db.collection(COLLECTIONS.PRODUCTS).add({
        ...data,
        status: data.status || 'active',
        featured: !!data.featured,
        bestSeller: !!data.bestSeller,
        // Firestore does not add timestamps itself; without createdAt the admin
        // list (orderBy createdAt) would never show the new product.
        createdAt: now,
        updatedAt: now,
      });
      await logAction({ adminId: req.admin?.uid, adminName: req.admin?.email, action: 'product_created', target: `products/${doc.id}`, details: data });
      res.status(201).json({ id: doc.id, message: 'Product created' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const data = req.validated;
      await db.collection(COLLECTIONS.PRODUCTS).doc(req.params.id).set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
      await logAction({ adminId: req.admin?.uid, adminName: req.admin?.email, action: 'product_updated', target: `products/${req.params.id}`, details: data });
      res.json({ message: 'Product updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      await db.collection(COLLECTIONS.PRODUCTS).doc(req.params.id).delete();
      await logAction({ adminId: req.admin?.uid, adminName: req.admin?.email, action: 'product_deleted', target: `products/${req.params.id}` });
      res.json({ message: 'Product deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  adminList: async (req, res) => {
    try {
      let products = [];
      if (process.env.DEV_MODE === 'true') {
        const snap = await db.collection(COLLECTIONS.PRODUCTS).query(() => true, { orderBy: 'desc', field: 'createdAt' });
        products = snap.map((d) => d.data());
      } else {
        const snap = await db.collection(COLLECTIONS.PRODUCTS).orderBy('createdAt', 'desc').get();
        products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
      res.json({ products });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

// ---------- Categories ----------
export const categoryController = {
  list: async (req, res) => {
    try {
      let categories = [];
      if (process.env.DEV_MODE === 'true') {
        const snap = await db.collection(COLLECTIONS.CATEGORIES).query(
          (d) => d.isActive !== false,
          { orderBy: 'asc', field: 'sortOrder' }
        );
        categories = snap.map((d) => d.data());
      } else {
        const snap = await db.collection(COLLECTIONS.CATEGORIES).where('isActive', '==', true).orderBy('sortOrder', 'asc').get();
        categories = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
      res.json({ categories });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const data = req.validated;
      const now = new Date().toISOString();
      const doc = await db.collection(COLLECTIONS.CATEGORIES).add({ ...data, createdAt: now, updatedAt: now });
      await logAction({ adminId: req.admin?.uid, adminName: req.admin?.email, action: 'category_created', target: `categories/${doc.id}`, details: data });
      res.status(201).json({ id: doc.id, message: 'Category created' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const data = req.validated;
      await db.collection(COLLECTIONS.CATEGORIES).doc(req.params.id).set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
      await logAction({ adminId: req.admin?.uid, adminName: req.admin?.email, action: 'category_updated', target: `categories/${req.params.id}`, details: data });
      res.json({ message: 'Category updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      await db.collection(COLLECTIONS.CATEGORIES).doc(req.params.id).delete();
      await logAction({ adminId: req.admin?.uid, adminName: req.admin?.email, action: 'category_deleted', target: `categories/${req.params.id}` });
      res.json({ message: 'Category deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  adminList: async (req, res) => {
    try {
      let categories = [];
      if (process.env.DEV_MODE === 'true') {
        const snap = await db.collection(COLLECTIONS.CATEGORIES).query(() => true, { orderBy: 'asc', field: 'sortOrder' });
        categories = snap.map((d) => d.data());
      } else {
        const snap = await db.collection(COLLECTIONS.CATEGORIES).orderBy('sortOrder', 'asc').get();
        categories = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
      res.json({ categories });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

// ---------- Orders ----------
export const orderController = {
  create: async (req, res) => {
    try {
      const data = req.validated;
      // Generate the public order id ONCE, so the id stored in the database is the
      // same one returned to the customer (it used to be generated three times).
      const orderId = generateOrderId();
      const now = new Date().toISOString();
      const orderRef = await db.collection(COLLECTIONS.ORDERS).add({
        orderId,
        customer: data.customer,
        items: data.items,
        subtotal: data.subtotal,
        discount: data.discount,
        deliveryCharge: data.deliveryCharge,
        total: data.total,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentMethod === 'cod' ? 'unpaid' : 'pending',
        orderStatus: 'pending',
        notes: data.notes || null,
        createdAt: now,
        updatedAt: now,
      });

      // Reduce stock for each ordered variant.
      try {
        if (process.env.DEV_MODE === 'true') {
          for (const item of data.items) {
            const snap = await db.collection(COLLECTIONS.PRODUCTS).query((d) => (d.variants || []).some((v) => v.sku === item.variantId));
            for (const docSnap of snap) {
              const p = docSnap.data();
              const variants = (p.variants || []).map((v) => (v.sku === item.variantId ? { ...v, stock: Math.max(0, v.stock - item.quantity) } : v));
              await db.collection(COLLECTIONS.PRODUCTS).doc(p.id).set({ ...p, variants, updatedAt: now });
            }
          }
        } else {
          await db.runTransaction(async (tx) => {
            const refs = [...new Set(data.items.map((i) => i.productId))].map((id) => db.collection(COLLECTIONS.PRODUCTS).doc(id));
            const snaps = await Promise.all(refs.map((r) => tx.get(r)));
            snaps.forEach((snap, idx) => {
              if (!snap.exists) return;
              const p = snap.data();
              const variants = (p.variants || []).map((v) => {
                const ordered = data.items.filter((i) => i.productId === refs[idx].id && i.variantId === v.sku);
                const qty = ordered.reduce((sum, i) => sum + i.quantity, 0);
                return qty ? { ...v, stock: Math.max(0, v.stock - qty) } : v;
              });
              tx.update(refs[idx], { variants, updatedAt: now });
            });
          });
        }
      } catch (stockErr) {
        // The order is already saved; do not fail the customer's checkout over stock bookkeeping.
        console.error('[orders] stock update failed:', stockErr.message);
      }

      await logAction({ adminId: null, adminName: 'guest', action: 'order_created', target: `orders/${orderRef.id}`, details: { orderId } });
      res.status(201).json({ orderId, message: 'Order placed' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  track: async (req, res) => {
    try {
      const { orderId, phone } = req.body;
      if (!orderId || !phone) return res.status(400).json({ error: 'orderId and phone required' });
      let order = null;
      if (process.env.DEV_MODE === 'true') {
        const snap = await db.collection(COLLECTIONS.ORDERS).query(
          (d) => d.orderId === orderId && d.customer.phone === phone
        );
        order = snap.length ? snap[0].data() : null;
      } else {
        const snap = await db.collection(COLLECTIONS.ORDERS)
          .where('orderId', '==', orderId)
          .where('customer.phone', '==', phone)
          .limit(1)
          .get();
        order = snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
      }
      if (!order) return res.status(404).json({ error: 'Order not found' });
      res.json({ order });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  adminList: async (req, res) => {
    try {
      let orders = [];
      if (process.env.DEV_MODE === 'true') {
        const snap = await db.collection(COLLECTIONS.ORDERS).query(() => true, { orderBy: 'desc', field: 'createdAt' });
        orders = snap.map((d) => d.data());
      } else {
        const snap = await db.collection(COLLECTIONS.ORDERS).orderBy('createdAt', 'desc').get();
        orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
      res.json({ orders });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { orderStatus, paymentStatus, note } = req.body;
      const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      const PAYMENT_STATUSES = ['unpaid', 'pending', 'paid', 'failed', 'refunded'];
      if (orderStatus && !ORDER_STATUSES.includes(orderStatus)) return res.status(400).json({ error: 'Invalid order status' });
      if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) return res.status(400).json({ error: 'Invalid payment status' });
      const ref = db.collection(COLLECTIONS.ORDERS).doc(req.params.id);
      await ref.set({ ...(orderStatus ? { orderStatus } : {}), ...(paymentStatus ? { paymentStatus } : {}), ...(note ? { note } : {}), updatedAt: new Date().toISOString() }, { merge: true });
      await logAction({ adminId: req.admin?.uid, adminName: req.admin?.email, action: 'order_status_changed', target: `orders/${req.params.id}`, details: { orderStatus, paymentStatus, note } });
      res.json({ message: 'Order updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

// ---------- Coupons ----------
export const couponController = {
  validate: async (req, res) => {
    try {
      const { code, orderTotal } = req.body;
      let coupon = null;
      if (process.env.DEV_MODE === 'true') {
        const snap = await db.collection(COLLECTIONS.COUPONS).query((d) => d.code === code && d.isActive !== false);
        coupon = snap.length ? snap[0].data() : null;
      } else {
        const snap = await db.collection(COLLECTIONS.COUPONS).where('code', '==', code).where('isActive', '==', true).limit(1).get();
        coupon = snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
      }
      if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' });
      const now = new Date();
      if (coupon.expiryDate && new Date(coupon.expiryDate) < now) return res.status(400).json({ error: 'Coupon expired' });
      if (orderTotal < (coupon.minOrder || 0)) return res.status(400).json({ error: `Minimum order ৳${coupon.minOrder} required` });
      let discount = 0;
      if (coupon.type === 'percentage') discount = (orderTotal * coupon.value) / 100;
      else if (coupon.type === 'fixed') discount = coupon.value;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      res.json({ valid: true, code: coupon.code, type: coupon.type, discount, maxDiscount: coupon.maxDiscount });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const data = req.validated;
      const now = new Date().toISOString();
      const doc = await db.collection(COLLECTIONS.COUPONS).add({ ...data, usedCount: 0, createdAt: now, updatedAt: now });
      await logAction({ adminId: req.admin?.uid, adminName: req.admin?.email, action: 'coupon_created', target: `coupons/${doc.id}`, details: data });
      res.status(201).json({ id: doc.id, message: 'Coupon created' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const data = req.validated;
      await db.collection(COLLECTIONS.COUPONS).doc(req.params.id).set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
      await logAction({ adminId: req.admin?.uid, adminName: req.admin?.email, action: 'coupon_updated', target: `coupons/${req.params.id}`, details: data });
      res.json({ message: 'Coupon updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      await db.collection(COLLECTIONS.COUPONS).doc(req.params.id).delete();
      await logAction({ adminId: req.admin?.uid, adminName: req.admin?.email, action: 'coupon_deleted', target: `coupons/${req.params.id}` });
      res.json({ message: 'Coupon deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  adminList: async (req, res) => {
    try {
      let coupons = [];
      if (process.env.DEV_MODE === 'true') {
        const snap = await db.collection(COLLECTIONS.COUPONS).query(() => true, { orderBy: 'desc', field: 'createdAt' });
        coupons = snap.map((d) => d.data());
      } else {
        const snap = await db.collection(COLLECTIONS.COUPONS).orderBy('createdAt', 'desc').get();
        coupons = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
      res.json({ coupons });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

// ---------- Dashboard ----------
export const dashboardController = {
  stats: async (req, res) => {
    try {
      let orders = [], products = [];
      if (process.env.DEV_MODE === 'true') {
        orders = (await db.collection(COLLECTIONS.ORDERS).query(() => true)).map((d) => d.data());
        products = (await db.collection(COLLECTIONS.PRODUCTS).query(() => true)).map((d) => d.data());
      } else {
        const oSnap = await db.collection(COLLECTIONS.ORDERS).get();
        orders = oSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const pSnap = await db.collection(COLLECTIONS.PRODUCTS).get();
        products = pSnap.docs.map((d) => d.data());
      }
      // Cancelled orders are not revenue.
      const totalRevenue = orders.filter((o) => o.orderStatus !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
      const recentOrders = [...orders].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))).slice(0, 5);
      const pending = orders.filter((o) => o.orderStatus === 'pending').length;
      const completed = orders.filter((o) => o.orderStatus === 'delivered').length;
      const cancelled = orders.filter((o) => o.orderStatus === 'cancelled').length;
      const outOfStock = products.filter((p) => (p.variants || []).every((v) => v.stock === 0)).length;
      const lowStock = products.filter((p) => (p.variants || []).some((v) => v.stock > 0 && v.stock <= 5)).length;
      res.json({
        totalRevenue,
        totalOrders: orders.length,
        pendingOrders: pending,
        completedOrders: completed,
        cancelledOrders: cancelled,
        totalProducts: products.length,
        activeProducts: products.filter((p) => p.status === 'active').length,
        outOfStockProducts: outOfStock,
        lowStockProducts: lowStock,
        totalCustomers: orders.reduce((set, o) => { if (o.customer?.phone) set.add(o.customer.phone); return set; }, new Set()).size,
        recentOrders,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

// ---------- Settings ----------
const SETTINGS_DOC = 'main';
const readSettings = async () => {
  const snap = await db.collection(COLLECTIONS.SETTINGS).doc(SETTINGS_DOC).get();
  return snap.exists ? snap.data() : {};
};

const withDefaults = (settings) => ({
  brandName: settings.brandName || 'Premium Tees',
  brandCurrency: settings.brandCurrency || 'BDT',
  deliveryChargeInsideDhaka: settings.deliveryChargeInsideDhaka ?? 80,
  deliveryChargeOutsideDhaka: settings.deliveryChargeOutsideDhaka ?? 150,
  taxPercent: settings.taxPercent ?? 0,
});

export const settingsController = {
  getPublic: async (_req, res) => {
    try {
      res.json(withDefaults(await readSettings()));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  adminGet: async (_req, res) => {
    try {
      res.json({ settings: withDefaults(await readSettings()) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  adminUpdate: async (req, res) => {
    try {
      const data = req.validated;
      await db.collection(COLLECTIONS.SETTINGS).doc(SETTINGS_DOC).set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
      await logAction({ adminId: req.admin?.uid, adminName: req.admin?.email, action: 'settings_updated', target: `settings/${SETTINGS_DOC}`, details: data });
      res.json({ message: 'Settings saved', settings: withDefaults(data) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

// ---------- Payments ----------
export const paymentController = {
  initiate: async (req, res) => {
    try {
      const { orderId, amount, method } = req.body;
      const payment = await db.collection(COLLECTIONS.PAYMENTS).add({
        orderId,
        amount,
        method,
        status: 'pending',
        gatewayReference: null,
        createdAt: new Date().toISOString(),
      });
      res.json({ paymentId: payment.id, status: 'pending', message: 'Payment initiated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  webhook: async (req, res) => {
    try {
      // Verify gateway signature here in production before marking paid.
      res.status(200).json({ received: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  adminList: async (req, res) => {
    try {
      let payments = [];
      if (process.env.DEV_MODE === 'true') {
        const snap = await db.collection(COLLECTIONS.PAYMENTS).query(() => true, { orderBy: 'desc', field: 'createdAt' });
        payments = snap.map((d) => d.data());
      } else {
        const snap = await db.collection(COLLECTIONS.PAYMENTS).orderBy('createdAt', 'desc').get();
        payments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
      res.json({ payments });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

export { COLLECTIONS, logAction };
