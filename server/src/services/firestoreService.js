import { db } from './db.js';
import { nanoid } from 'nanoid';

import { DEFAULT_CATEGORIES } from '../data/defaultCategories.js';

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
const saleLive = (p, nowMs = Date.now()) => {
  const price = Number(p.price) || 0;
  const sale = Number(p.salePrice) || 0;
  if (!(sale > 0 && sale < price)) return false;
  const end = p.saleEndsAt ? new Date(p.saleEndsAt).getTime() : null;
  return end === null || Number.isNaN(end) || end > nowMs;
};

// Turn a product name into a URL-safe slug.
const slugify = (name) => String(name || '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'product';

// True when another product document already uses this slug (slugs are the public product URL).
const slugTaken = async (slug, exceptId = null) => {
  if (process.env.DEV_MODE === 'true') {
    const snap = await db.collection(COLLECTIONS.PRODUCTS).query((d) => d.slug === slug);
    return snap.some((d) => (d.data().id || d.id) !== exceptId);
  }
  const snap = await db.collection(COLLECTIONS.PRODUCTS).where('slug', '==', slug).limit(5).get();
  return snap.docs.some((d) => d.id !== exceptId);
};

// Return a slug that is guaranteed unique across the products collection.
// Legacy duplicates are broken by appending a short unique suffix so no two
// products ever share a public URL.
const makeUniqueSlug = async (baseSlug, exceptId = null) => {
  let slug = baseSlug;
  while (await slugTaken(slug, exceptId)) slug = `${baseSlug}-${nanoid(4)}`;
  return slug;
};

export const productController = {
  list: async (req, res) => {
    try {
      const q = req.query;
      const status = q.status || 'active';
      const pageSize = Math.min(Math.max(parseInt(q.limit, 10) || 20, 1), 100);
      const page = Math.max(parseInt(q.page, 10) || 1, 1);
      const newArrivals = q.newArrivals === 'true' || q['new-arrivals'] === 'true';
      const bestSellers = q.bestSellers === 'true' || q['best-sellers'] === 'true';
      const csv = (value) => String(value || '').split(',').map((v) => v.trim().toLowerCase()).filter(Boolean);

      let products = [];
      if (process.env.DEV_MODE === 'true') {
        const snap = await db.collection(COLLECTIONS.PRODUCTS).query((d) => d.status === status, { orderBy: 'desc', field: 'createdAt', limit: 500 });
        products = snap.map((d) => d.data());
      } else {
        const snap = await db.collection(COLLECTIONS.PRODUCTS).where('status', '==', status).limit(500).get();
        products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }

      // Never return the same product twice (duplicate documents / repeated seeds).
      // When two documents share a slug keep the most recently created one, so a freshly
      // uploaded product is never hidden behind an older duplicate.
      const newestBySlug = new Map();
      products.forEach((p) => {
        const key = p.slug || p.id;
        const prev = newestBySlug.get(key);
        if (!prev || String(p.createdAt || '') > String(prev.createdAt || '')) newestBySlug.set(key, p);
      });
      products = products.filter((p) => newestBySlug.get(p.slug || p.id) === p);

      const nowMs = Date.now();
      const priceOf = (p) => (saleLive(p, nowMs) ? Number(p.salePrice) : Number(p.price) || 0);
      const created = (p) => new Date(p.createdAt || 0).getTime() || 0;

      // Base set: scope filters (category / featured / sale / search). Facets are computed from
      // this set so the filter UI always offers options that exist in the category.
      let base = products;
      if (q.category) base = base.filter((p) => (p.categoryIds || []).includes(q.category));
      if (q.collection) base = base.filter((p) => (p.collectionIds || []).includes(q.collection));
      if (q.featured === 'true') base = base.filter((p) => p.featured);
      if (q.onSale === 'true') base = base.filter((p) => saleLive(p, nowMs));
      const term = String(q.q || '').trim().toLowerCase();
      if (term) {
        base = base.filter((p) =>
          [p.name, p.sku, p.fit, p.fabric, ...(p.categoryIds || [])].filter(Boolean).some((v) => String(v).toLowerCase().includes(term)));
      }

      const variantsOf = (p) => (Array.isArray(p.variants) ? p.variants : []);
      const colorsOf = (p) => [...new Set(variantsOf(p).map((v) => v.color).filter(Boolean))];
      const sizesOf = (p) => [...new Set(variantsOf(p).map((v) => v.size).filter(Boolean))];
      const facetColors = [...new Set(base.flatMap(colorsOf))].sort();
      const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
      const facetSizes = [...new Set(base.flatMap(sizesOf))].sort((a, b) => {
        const ia = SIZE_ORDER.indexOf(String(a).toUpperCase());
        const ib = SIZE_ORDER.indexOf(String(b).toUpperCase());
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || String(a).localeCompare(String(b));
      });
      const prices = base.map(priceOf).filter((n) => n > 0);
      const facets = { colors: facetColors, sizes: facetSizes, minPrice: prices.length ? Math.min(...prices) : 0, maxPrice: prices.length ? Math.max(...prices) : 0 };

      let list = base;
      const minPrice = Number(q.minPrice);
      const maxPrice = Number(q.maxPrice);
      if (Number.isFinite(minPrice) && q.minPrice !== undefined && q.minPrice !== '') list = list.filter((p) => priceOf(p) >= minPrice);
      if (Number.isFinite(maxPrice) && q.maxPrice !== undefined && q.maxPrice !== '') list = list.filter((p) => priceOf(p) <= maxPrice);
      const wantSizes = csv(q.size || q.sizes);
      if (wantSizes.length) list = list.filter((p) => variantsOf(p).some((v) => wantSizes.includes(String(v.size).toLowerCase()) && Number(v.stock) > 0));
      const wantColors = csv(q.color || q.colors);
      if (wantColors.length) list = list.filter((p) => variantsOf(p).some((v) => wantColors.includes(String(v.color).toLowerCase()) && Number(v.stock) > 0));

      const sort = q.sort || (newArrivals ? 'newest' : bestSellers ? 'popular' : 'featured');
      if (bestSellers) {
        // Real sales first (soldCount is incremented on every order); the manual
        // "best seller" flag only fills the gaps until sales data exists.
        list = list.filter((p) => Number(p.soldCount) > 0 || p.bestSeller);
      }
      const sorters = {
        newest: (a, b) => created(b) - created(a),
        'price-asc': (a, b) => priceOf(a) - priceOf(b),
        'price-desc': (a, b) => priceOf(b) - priceOf(a),
        name: (a, b) => String(a.name).localeCompare(String(b.name)),
        popular: (a, b) => (Number(b.soldCount) || 0) - (Number(a.soldCount) || 0) || created(b) - created(a),
        featured: (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || created(b) - created(a),
      };
      list = [...list].sort(sorters[sort] || sorters.featured);

      const total = list.length;
      const pages = Math.max(Math.ceil(total / pageSize), 1);
      const start = (page - 1) * pageSize;
      res.json({ products: list.slice(start, start + pageSize), total, page, pages, facets });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Look up a single product by its unique, stable Firestore document ID.
  // Never falls back to the first slug match, so duplicate slugs can never
  // surface the wrong product.
  getById: async (req, res) => {
    try {
      const snap = await db.collection(COLLECTIONS.PRODUCTS).doc(req.params.id).get();
      if (!snap.exists) return res.status(404).json({ error: 'Product not found' });
      res.json({ product: { id: snap.id, ...snap.data() } });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const data = req.validated;
      // Generate a unique, stable slug from the name when none is given, and
      // guarantee uniqueness by appending a short suffix on any collision so
      // creating a product never overwrites another product's URL.
      const slug = await makeUniqueSlug(data.slug || slugify(data.name));
      const now = new Date().toISOString();
      const doc = await db.collection(COLLECTIONS.PRODUCTS).add({
        ...data,
        slug,
        status: data.status || 'active',
        featured: !!data.featured,
        bestSeller: !!data.bestSeller,
        // Firestore does not add timestamps itself; without createdAt the admin
        // list (orderBy createdAt) would never show the new product.
        createdAt: now,
        updatedAt: now,
      });
      await logAction({ adminId: req.admin?.uid, adminName: req.admin?.email, action: 'product_created', target: `products/${doc.id}`, details: { ...data, slug } });
      res.status(201).json({ id: doc.id, slug, message: 'Product created' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const data = req.validated;
      if (data.status !== 'archived' && await slugTaken(data.slug, req.params.id)) {
        return res.status(409).json({ error: `Another product already uses the slug "${data.slug}". Use a different slug.` });
      }
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
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const readAllCategories = async () => {
  if (process.env.DEV_MODE === 'true') {
    const snap = await db.collection(COLLECTIONS.CATEGORIES).query(() => true);
    return snap.map((d) => d.data());
  }
  const snap = await db.collection(COLLECTIONS.CATEGORIES).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Every product, archived ones included — used when categories are renamed or deleted so that
// nothing is left pointing at a category that no longer exists.
const readEveryProduct = async () => {
  if (process.env.DEV_MODE === 'true') {
    const snap = await db.collection(COLLECTIONS.PRODUCTS).query(() => true);
    return snap.map((d) => d.data());
  }
  const snap = await db.collection(COLLECTIONS.PRODUCTS).limit(1000).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const byOrder = (a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) || String(a.name).localeCompare(String(b.name));

let defaultsChecked = false;
// A brand-new store has no categories; create the five defaults once so navigation is never empty.
const ensureDefaultCategories = async () => {
  if (defaultsChecked) return;
  const existing = await readAllCategories();
  if (existing.length === 0) {
    const now = new Date().toISOString();
    for (const category of DEFAULT_CATEGORIES) {
      await db.collection(COLLECTIONS.CATEGORIES).add({ ...category, createdAt: now, updatedAt: now });
    }
  }
  defaultsChecked = true;
};

const withCounts = (categories, products) =>
  categories.map((c) => ({ ...c, productCount: products.filter((p) => (p.categoryIds || []).includes(c.slug)).length }));

export const categoryController = {
  // Public: active categories in display order, with live product counts.
  list: async (req, res) => {
    try {
      await ensureDefaultCategories();
      const [all, products] = await Promise.all([readAllCategories(), readActiveProducts()]);
      const categories = withCounts(all.filter((c) => c.isActive !== false).sort(byOrder), products);
      res.json({ categories });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getBySlug: async (req, res) => {
    try {
      await ensureDefaultCategories();
      const [all, products] = await Promise.all([readAllCategories(), readActiveProducts()]);
      const category = all.find((c) => c.slug === req.params.slug && c.isActive !== false);
      if (!category) return res.status(404).json({ error: 'Category not found' });
      const [withCount] = withCounts([category], products);
      res.json({ category: withCount });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  adminList: async (req, res) => {
    try {
      await ensureDefaultCategories();
      const [all, products] = await Promise.all([readAllCategories(), readEveryProduct()]);
      const missingDefaults = DEFAULT_CATEGORIES.filter((d) => !all.some((c) => c.slug === d.slug)).map((d) => d.name);
      res.json({ categories: withCounts(all.sort(byOrder), products.filter((p) => p.status !== 'archived')), missingDefaults });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const data = req.validated;
      if (!SLUG_RE.test(data.slug)) return res.status(400).json({ error: 'Slug may only contain lowercase letters, numbers and single hyphens' });
      const all = await readAllCategories();
      if (all.some((c) => c.slug === data.slug)) return res.status(409).json({ error: 'A category with this slug already exists' });
      if (all.some((c) => String(c.name).trim().toLowerCase() === data.name.trim().toLowerCase())) return res.status(409).json({ error: 'A category with this name already exists' });
      const now = new Date().toISOString();
      const sortOrder = data.sortOrder || (all.length ? Math.max(...all.map((c) => Number(c.sortOrder) || 0)) + 10 : 10);
      const doc = await db.collection(COLLECTIONS.CATEGORIES).add({ ...data, sortOrder, createdAt: now, updatedAt: now });
      await logAction({ adminId: req.admin?.uid, adminName: req.admin?.email, action: 'category_created', target: `categories/${doc.id}`, details: data });
      res.status(201).json({ id: doc.id, message: 'Category created' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const data = req.validated;
      if (!SLUG_RE.test(data.slug)) return res.status(400).json({ error: 'Slug may only contain lowercase letters, numbers and single hyphens' });
      const all = await readAllCategories();
      const previous = all.find((c) => c.id === req.params.id);
      if (!previous) return res.status(404).json({ error: 'Category not found' });
      if (all.some((c) => c.id !== previous.id && c.slug === data.slug)) return res.status(409).json({ error: 'A category with this slug already exists' });
      if (all.some((c) => c.id !== previous.id && String(c.name).trim().toLowerCase() === data.name.trim().toLowerCase())) return res.status(409).json({ error: 'A category with this name already exists' });
      const now = new Date().toISOString();
      await db.collection(COLLECTIONS.CATEGORIES).doc(previous.id).set({ ...data, updatedAt: now }, { merge: true });
      // Products reference categories by slug, so keep them attached when the slug changes.
      if (previous.slug !== data.slug) {
        const products = (await readEveryProduct()).filter((p) => (p.categoryIds || []).includes(previous.slug));
        for (const p of products) {
          const categoryIds = [...new Set(p.categoryIds.map((slug) => (slug === previous.slug ? data.slug : slug)))];
          await db.collection(COLLECTIONS.PRODUCTS).doc(p.id).set({ categoryIds, updatedAt: now }, { merge: true });
        }
      }
      await logAction({ adminId: req.admin?.uid, adminName: req.admin?.email, action: 'category_updated', target: `categories/${req.params.id}`, details: data });
      res.json({ message: 'Category updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Body: { order: [id, id, ...] } — new display order, first = shown first.
  reorder: async (req, res) => {
    try {
      const order = Array.isArray(req.body?.order) ? req.body.order.filter((id) => typeof id === 'string') : [];
      if (order.length === 0) return res.status(400).json({ error: 'Provide the category ids in the new order' });
      const now = new Date().toISOString();
      for (let i = 0; i < order.length; i += 1) {
        await db.collection(COLLECTIONS.CATEGORIES).doc(order[i]).set({ sortOrder: (i + 1) * 10, updatedAt: now }, { merge: true });
      }
      await logAction({ adminId: req.admin?.uid, adminName: req.admin?.email, action: 'categories_reordered', target: 'categories', details: { order } });
      res.json({ message: 'Order saved' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Query: ?reassignTo=<slug> moves the category's products into another category first.
  // Without it the slug is simply removed; products stay live and reachable through Shop and search.
  delete: async (req, res) => {
    try {
      const all = await readAllCategories();
      const existing = all.find((c) => c.id === req.params.id);
      if (!existing) return res.status(404).json({ error: 'Category not found' });
      const reassignTo = String(req.query.reassignTo || '').trim();
      if (reassignTo) {
        if (reassignTo === existing.slug) return res.status(400).json({ error: 'Choose a different category to move the products into' });
        if (!all.some((c) => c.slug === reassignTo)) return res.status(400).json({ error: 'The category to move products into does not exist' });
      }
      const now = new Date().toISOString();
      const products = (await readEveryProduct()).filter((p) => (p.categoryIds || []).includes(existing.slug));
      for (const p of products) {
        const rest = p.categoryIds.filter((slug) => slug !== existing.slug);
        const categoryIds = reassignTo ? [...new Set([...rest, reassignTo])] : rest;
        await db.collection(COLLECTIONS.PRODUCTS).doc(p.id).set({ categoryIds, updatedAt: now }, { merge: true });
      }
      await db.collection(COLLECTIONS.CATEGORIES).doc(existing.id).delete();
      await logAction({ adminId: req.admin?.uid, adminName: req.admin?.email, action: 'category_deleted', target: `categories/${existing.id}`, details: { slug: existing.slug, reassignTo: reassignTo || null, products: products.length } });
      res.json({ message: 'Category deleted', productsAffected: products.length, reassignedTo: reassignTo || null });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Adds any of the five default categories that are missing (never touches existing ones).
  seedDefaults: async (req, res) => {
    try {
      const all = await readAllCategories();
      const now = new Date().toISOString();
      const added = [];
      for (const category of DEFAULT_CATEGORIES) {
        if (all.some((c) => c.slug === category.slug)) continue;
        await db.collection(COLLECTIONS.CATEGORIES).add({ ...category, createdAt: now, updatedAt: now });
        added.push(category.name);
      }
      defaultsChecked = true;
      res.json({ message: added.length ? `Added ${added.join(', ')}` : 'All default categories already exist', added });
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

// Settings saved before the rebrand may still hold the old name/tagline. Treat those as
// "unset" so the new brand shows without anyone having to re-save Admin -> Settings.
const LEGACY_BRAND = /^premium\s*-?\s*tees$/i;
const brandOrDefault = (value, fallback) => (value && !LEGACY_BRAND.test(String(value).trim()) ? value : fallback);

const withDefaults = (settings) => ({
  brandName: brandOrDefault(settings.brandName, 'Unhinged Co.'),
  brandTagline: settings.brandTagline || 'Wear Without Limits.',
  brandDescription: settings.brandDescription || 'Unhinged Co. is a premium streetwear brand from Bangladesh. Wear Without Limits.',
  logoUrl: settings.logoUrl || '',
  faviconUrl: settings.faviconUrl || '',
  supportEmail: settings.supportEmail || 'support@unhingedco.com',
  supportPhone: settings.supportPhone || '+880 1700 000000',
  address: settings.address || 'Dhaka, Bangladesh',
  facebookUrl: settings.facebookUrl || '',
  tiktokUrl: settings.tiktokUrl || '',
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

// ---------- Data repair ----------
const titleCase = (s) => s.toLowerCase().replace(/(^|[\s-])(\w)/g, (_m, a, b) => a + b.toUpperCase());
const splitList = (value) => String(value || '').split(/[,/&|]+/).map((v) => v.trim()).filter(Boolean);

/**
 * Early versions of the admin form let a single variant hold "BLACK,WHITE" as the colour and
 * "M,L,XL" as the size, producing SKUs like "004-BLACK,WHITE-M,L,XL" and a product customers
 * cannot order properly. This expands such variants into one real variant per colour/size
 * (SKU "004-Black-M"), keeping the stock figure on each. Idempotent: clean products are untouched.
 */
export const repairLegacyVariants = async () => {
  try {
    let docs;
    if (process.env.DEV_MODE === 'true') {
      const snap = await db.collection(COLLECTIONS.PRODUCTS).query(() => true);
      docs = snap.map((d) => ({ id: d.data().id || d.id, data: d.data() }));
    } else {
      const snap = await db.collection(COLLECTIONS.PRODUCTS).get();
      docs = snap.docs.map((d) => ({ id: d.id, data: d.data() }));
    }
    let fixed = 0;
    for (const { id, data } of docs) {
      const variants = Array.isArray(data.variants) ? data.variants : [];
      if (!variants.some((v) => /[,/&|]/.test(`${v.color}${v.size}`))) continue;
      const out = [];
      const seen = new Set();
      for (const v of variants) {
        const colors = splitList(v.color);
        const sizes = splitList(v.size);
        const isLegacy = colors.length > 1 || sizes.length > 1;
        const list = isLegacy ? colors.flatMap((c) => sizes.map((s) => [c, s])) : [[v.color, v.size]];
        for (const [c, s] of list) {
          const color = isLegacy ? titleCase(c) : c;
          const size = isLegacy ? s.toUpperCase() : s;
          const sku = isLegacy ? `${data.sku}-${color}-${size}` : v.sku;
          if (seen.has(sku)) continue;
          seen.add(sku);
          out.push({ ...v, sku, color, size });
        }
      }
      await db.collection(COLLECTIONS.PRODUCTS).doc(id).set({ ...data, variants: out, updatedAt: new Date().toISOString() }, { merge: true });
      fixed += 1;
    }
    if (fixed) console.log(`[repair] Expanded legacy comma-separated variants on ${fixed} product(s).`);
  } catch (err) {
    console.error('[repair] variant repair skipped:', err.message);
  }
};
