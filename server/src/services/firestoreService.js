import { db } from './db.js';
import { nanoid } from 'nanoid';

const COLLECTIONS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  STORE_COLLECTIONS: 'collections',
  ORDERS: 'orders',
  COUPONS: 'coupons',
  SETTINGS: 'settings',
  PAYMENTS: 'payments',
  ADMINS: 'admins',
  ADMIN_LOGS: 'admin_activity_logs',
  INVENTORY_LOGS: 'inventory_logs',
  CUSTOMERS: 'customers',
  REVIEWS: 'reviews',
  NEWSLETTER: 'newsletter_subscribers',
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
      const { featured, category, status = 'active' } = req.query;
      const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 200);
      const newArrivals = req.query.newArrivals === 'true' || req.query['new-arrivals'] === 'true';
      const bestSellers = req.query.bestSellers === 'true' || req.query['best-sellers'] === 'true';
      // Sorted/filtered views are computed in memory so no Firestore composite index is required.
      const fetchLimit = newArrivals || bestSellers ? 200 : limit;

      let products = [];
      if (process.env.DEV_MODE === 'true') {
        const snap = await db.collection(COLLECTIONS.PRODUCTS).query(
          (d) => d.status === status,
          { orderBy: 'desc', field: 'createdAt', limit: fetchLimit }
        );
        products = snap.map((d) => d.data());
      } else {
        let q = db.collection(COLLECTIONS.PRODUCTS).where('status', '==', status);
        if (featured === 'true') q = q.where('featured', '==', true);
        const snap = await q.limit(fetchLimit).get();
        products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
      if (category) products = products.filter((p) => p.categoryIds && p.categoryIds.includes(category));

      // Never return the same product twice (duplicate documents / repeated seeds).
      const seen = new Set();
      products = products.filter((p) => {
        const key = p.slug || p.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const created = (p) => new Date(p.createdAt || 0).getTime() || 0;
      if (newArrivals) {
        products.sort((a, b) => created(b) - created(a));
      } else if (bestSellers) {
        // Real sales first (soldCount is incremented on every order); the manual
        // "best seller" flag only fills the gaps until sales data exists.
        products = products
          .filter((p) => Number(p.soldCount) > 0 || p.bestSeller)
          .sort((a, b) => (Number(b.soldCount) || 0) - (Number(a.soldCount) || 0) || created(b) - created(a));
      }
      res.json({ products: products.slice(0, limit) });
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

// ---------- Collections (curated drops, e.g. "Summer 2026") ----------
const readAllCollections = async () => {
  if (process.env.DEV_MODE === 'true') {
    const snap = await db.collection(COLLECTIONS.STORE_COLLECTIONS).query(() => true);
    return snap.map((d) => d.data());
  }
  const snap = await db.collection(COLLECTIONS.STORE_COLLECTIONS).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const readActiveProducts = async () => {
  if (process.env.DEV_MODE === 'true') {
    const snap = await db.collection(COLLECTIONS.PRODUCTS).query((d) => d.status === 'active');
    return snap.map((d) => d.data());
  }
  const snap = await db.collection(COLLECTIONS.PRODUCTS).where('status', '==', 'active').limit(500).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const bySortOrder = (a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) || String(a.name).localeCompare(String(b.name));

export const collectionController = {
  // Public: active collections with how many live products each holds.
  list: async (req, res) => {
    try {
      const [all, products] = await Promise.all([readAllCollections(), readActiveProducts()]);
      const collections = all
        .filter((c) => c.isActive !== false)
        .sort(bySortOrder)
        .map((c) => ({ ...c, productCount: products.filter((p) => (p.collectionIds || []).includes(c.slug)).length }));
      res.json({ collections });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Public: one collection plus its products.
  getBySlug: async (req, res) => {
    try {
      const all = await readAllCollections();
      const collection = all.find((c) => c.slug === req.params.slug && c.isActive !== false);
      if (!collection) return res.status(404).json({ error: 'Collection not found' });
      const products = (await readActiveProducts())
        .filter((p) => (p.collectionIds || []).includes(collection.slug))
        .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
      res.json({ collection, products });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  adminList: async (req, res) => {
    try {
      const [all, products] = await Promise.all([readAllCollections(), readActiveProducts()]);
      const collections = all.sort(bySortOrder).map((c) => ({ ...c, productCount: products.filter((p) => (p.collectionIds || []).includes(c.slug)).length }));
      res.json({ collections });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const data = req.validated;
      const all = await readAllCollections();
      if (all.some((c) => c.slug === data.slug)) return res.status(409).json({ error: 'A collection with this slug already exists' });
      const now = new Date().toISOString();
      const doc = await db.collection(COLLECTIONS.STORE_COLLECTIONS).add({ ...data, createdAt: now, updatedAt: now });
      await logAction({ adminId: req.admin?.uid, adminName: req.admin?.email, action: 'collection_created', target: `collections/${doc.id}`, details: data });
      res.status(201).json({ id: doc.id, message: 'Collection created' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const data = req.validated;
      const all = await readAllCollections();
      if (all.some((c) => c.slug === data.slug && c.id !== req.params.id)) return res.status(409).json({ error: 'A collection with this slug already exists' });
      const previous = all.find((c) => c.id === req.params.id);
      await db.collection(COLLECTIONS.STORE_COLLECTIONS).doc(req.params.id).set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
      // Products reference collections by slug, so keep them attached if the slug changes.
      if (previous && previous.slug !== data.slug) {
        const now = new Date().toISOString();
        const products = (await readActiveProducts()).filter((p) => (p.collectionIds || []).includes(previous.slug));
        for (const p of products) {
          const collectionIds = p.collectionIds.map((slug) => (slug === previous.slug ? data.slug : slug));
          await db.collection(COLLECTIONS.PRODUCTS).doc(p.id).set({ collectionIds, updatedAt: now }, { merge: true });
        }
      }
      await logAction({ adminId: req.admin?.uid, adminName: req.admin?.email, action: 'collection_updated', target: `collections/${req.params.id}`, details: data });
      res.json({ message: 'Collection updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      const all = await readAllCollections();
      const existing = all.find((c) => c.id === req.params.id);
      await db.collection(COLLECTIONS.STORE_COLLECTIONS).doc(req.params.id).delete();
      if (existing) {
        const now = new Date().toISOString();
        const products = (await readActiveProducts()).filter((p) => (p.collectionIds || []).includes(existing.slug));
        for (const p of products) {
          await db.collection(COLLECTIONS.PRODUCTS).doc(p.id).set({ collectionIds: p.collectionIds.filter((slug) => slug !== existing.slug), updatedAt: now }, { merge: true });
        }
      }
      await logAction({ adminId: req.admin?.uid, adminName: req.admin?.email, action: 'collection_deleted', target: `collections/${req.params.id}` });
      res.json({ message: 'Collection deleted' });
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

      // Never trust prices from the browser: re-price every line from the product
      // catalogue (sale-aware) and make sure the variant is still in stock.
      let items = data.items;
      let subtotal = data.subtotal;
      let total = data.total;
      if (process.env.DEV_MODE !== 'true') {
        const ids = [...new Set(items.map((i) => i.productId))];
        const snaps = await Promise.all(ids.map((id) => db.collection(COLLECTIONS.PRODUCTS).doc(id).get()));
        const catalogue = new Map(snaps.filter((snap) => snap.exists).map((snap) => [snap.id, snap.data()]));
        const nowMs = Date.now();
        items = items.map((item) => {
          const product = catalogue.get(item.productId);
          if (!product || product.status === 'archived') {
            const err = new Error(`"${item.name}" is no longer available.`);
            err.status = 400;
            throw err;
          }
          const variant = (product.variants || []).find((v) => v.sku === item.variantId);
          if (variant && Number(variant.stock) < item.quantity) {
            const err = new Error(Number(variant.stock) > 0 ? `Only ${variant.stock} of "${item.name}" (${item.color} / ${item.size}) left in stock.` : `"${item.name}" (${item.color} / ${item.size}) is out of stock.`);
            err.status = 400;
            throw err;
          }
          const regular = Number(product.price) || 0;
          const sale = Number(product.salePrice) || 0;
          const end = product.saleEndsAt ? new Date(product.saleEndsAt).getTime() : null;
          const saleLive = sale > 0 && sale < regular && (end === null || Number.isNaN(end) || end > nowMs);
          return { ...item, price: saleLive ? sale : regular };
        });
        subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const discount = Math.min(data.discount || 0, subtotal);
        data.discount = discount;
        total = Math.max(0, subtotal - discount + (data.deliveryCharge || 0));
      }

      const orderRef = await db.collection(COLLECTIONS.ORDERS).add({
        orderId,
        customer: data.customer,
        items,
        subtotal,
        discount: data.discount,
        deliveryCharge: data.deliveryCharge,
        total,
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
              await db.collection(COLLECTIONS.PRODUCTS).doc(p.id).set({ ...p, variants, soldCount: (Number(p.soldCount) || 0) + item.quantity, updatedAt: now });
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
              const soldNow = data.items.filter((i) => i.productId === refs[idx].id).reduce((sum, i) => sum + i.quantity, 0);
              tx.update(refs[idx], { variants, soldCount: (Number(p.soldCount) || 0) + soldNow, updatedAt: now });
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
      res.status(err.status || 500).json({ error: err.message });
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
  instagramUrl: settings.instagramUrl || '',
  instagramImages: Array.isArray(settings.instagramImages) ? settings.instagramImages : [],
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

// ---------- Reviews ----------
export const reviewController = {
  list: async (req, res) => {
    try {
      const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 24);
      let reviews = [];
      if (process.env.DEV_MODE === 'true') {
        const snap = await db.collection(COLLECTIONS.REVIEWS).query((d) => d.isApproved === true);
        reviews = snap.map((d) => d.data());
      } else {
        const snap = await db.collection(COLLECTIONS.REVIEWS)
          .where('isApproved', '==', true)
          .limit(50)
          .get();
        reviews = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
      reviews.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
      res.json({ reviews: reviews.slice(0, limit) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

// ---------- Newsletter ----------
export const newsletterController = {
  subscribe: async (req, res) => {
    try {
      const email = req.validated.email.toLowerCase();
      let existing = false;
      if (process.env.DEV_MODE === 'true') {
        const snap = await db.collection(COLLECTIONS.NEWSLETTER).query((d) => d.email === email);
        existing = snap.length > 0;
      } else {
        const snap = await db.collection(COLLECTIONS.NEWSLETTER).where('email', '==', email).limit(1).get();
        existing = !snap.empty;
      }
      if (!existing) {
        await db.collection(COLLECTIONS.NEWSLETTER).add({
          email,
          source: 'homepage',
          createdAt: new Date().toISOString(),
        });
      }
      res.status(201).json({ message: 'You are on the list.' });
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
