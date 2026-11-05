import { db } from '../services/db.js';
import { COLLECTIONS, logAction } from '../services/firestoreService.js';

export const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.validated;
      // Dev fallback: accept any credentials, issue a local token
      if (process.env.DEV_MODE === 'true') {
        const user = { uid: 'dev-admin-uid', email, role: 'super_admin' };
        const token = 'dev-token-' + Buffer.from(email).toString('base64');
        return res.json({ token, user });
      }
      // Production: verify against Firebase Auth users with admin claims
      res.status(501).json({ error: 'Firebase Auth login not configured. Enable DEV_MODE or set Firebase credentials.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  me: async (req, res) => {
    res.json({ user: req.admin });
  },
};

export const adminController = {
  list: async (req, res) => {
    try {
      let admins = [];
      if (process.env.DEV_MODE === 'true') {
        const snap = await db.collection(COLLECTIONS.ADMINS).query(() => true);
        admins = snap.map((d) => d.data());
      } else {
        const snap = await db.collection(COLLECTIONS.ADMINS).get();
        admins = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
      res.json({ admins });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const { email, role } = req.body;
      const doc = await db.collection(COLLECTIONS.ADMINS).add({ email, role, createdAt: new Date().toISOString() });
      await logAction({ adminId: req.admin.uid, adminName: req.admin.email, action: 'admin_created', target: `admins/${doc.id}`, details: { email, role } });
      res.status(201).json({ id: doc.id, message: 'Admin created' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      await db.collection(COLLECTIONS.ADMINS).doc(req.params.id).set(req.body, { merge: true });
      res.json({ message: 'Admin updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      await db.collection(COLLECTIONS.ADMINS).doc(req.params.id).delete();
      res.json({ message: 'Admin deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

// ---------- Reports ----------
export const reportsController = {
  summary: async (req, res) => {
    try {
      let orders = [];
      if (process.env.DEV_MODE === 'true') {
        orders = (await db.collection(COLLECTIONS.ORDERS).query(() => true)).map((d) => d.data());
      } else {
        const snap = await db.collection(COLLECTIONS.ORDERS).get();
        orders = snap.docs.map((d) => d.data());
      }
      const gross = orders.reduce((s, o) => s + (o.total || 0), 0);
      const byMethod = orders.reduce((acc, o) => { acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + (o.total || 0); return acc; }, {});
      const byStatus = orders.reduce((acc, o) => { acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1; return acc; }, {});
      res.json({ grossSales: gross, orders: orders.length, byMethod, byStatus, netRevenue: gross });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

// ---------- Activity Logs ----------
export const activityLogController = {
  list: async (req, res) => {
    try {
      let logs = [];
      if (process.env.DEV_MODE === 'true') {
        logs = (await db.collection(COLLECTIONS.ADMIN_LOGS).query(() => true, { orderBy: 'desc', field: 'createdAt', limit: 50 })).map((d) => d.data());
      } else {
        const snap = await db.collection(COLLECTIONS.ADMIN_LOGS).orderBy('createdAt', 'desc').limit(50).get();
        logs = snap.docs.map((d) => d.data());
      }
      res.json({ logs });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
