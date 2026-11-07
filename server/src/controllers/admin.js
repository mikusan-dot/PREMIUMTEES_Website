import { getAuth } from '../config/firebase.js';
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
      // Production: verify email/password with Firebase Auth (REST API), then
      // confirm the account is an admin and return the Firebase ID token.
      const apiKey = process.env.FIREBASE_API_KEY;
      if (!apiKey || !process.env.FIREBASE_PROJECT_ID) {
        return res.status(501).json({ error: 'Firebase Auth login not configured. Set FIREBASE_API_KEY and the Firebase Admin credentials, or enable DEV_MODE for local testing.' });
      }
      const fbRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      });
      const fbJson = await fbRes.json();
      if (!fbRes.ok) {
        const code = String(fbJson?.error?.message || 'UNKNOWN');
        console.error('[admin login] Firebase sign-in failed:', code);
        const badCredentials = ['EMAIL_NOT_FOUND', 'INVALID_PASSWORD', 'INVALID_LOGIN_CREDENTIALS'];
        if (badCredentials.includes(code)) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Configuration problems (bad API key, provider disabled, disabled user...)
        return res.status(502).json({ error: `Firebase sign-in error: ${code}` });
      }
      const decoded = await getAuth().verifyIdToken(fbJson.idToken);
      let role = decoded.role;
      if (!role) {
        const snap = await db.collection(COLLECTIONS.ADMINS).where('email', '==', email).limit(1).get();
        if (!snap.empty) role = snap.docs[0].data().role;
      }
      if (!role) {
        return res.status(403).json({ error: 'This account is not an admin' });
      }
      return res.json({ token: fbJson.idToken, user: { uid: decoded.uid, email: decoded.email, role } });
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
      const { email, password, role } = req.validated;
      const normalizedEmail = email.trim().toLowerCase();

      if (process.env.DEV_MODE !== 'true') {
        // Make sure the person can actually sign in: create the Firebase Auth user
        // if it does not exist yet (needs a password), otherwise reuse it.
        const auth = getAuth();
        try {
          await auth.getUserByEmail(normalizedEmail);
        } catch (lookupErr) {
          if (lookupErr.code !== 'auth/user-not-found') throw lookupErr;
          if (!password) return res.status(400).json({ error: 'No Firebase account exists for this email yet. Enter a password (min 6 characters) to create one.' });
          await auth.createUser({ email: normalizedEmail, password });
        }
        const existing = await db.collection(COLLECTIONS.ADMINS).where('email', '==', normalizedEmail).limit(1).get();
        if (!existing.empty) return res.status(409).json({ error: 'This email is already an admin' });
      }

      const doc = await db.collection(COLLECTIONS.ADMINS).add({ email: normalizedEmail, role, createdAt: new Date().toISOString() });
      await logAction({ adminId: req.admin.uid, adminName: req.admin.email, action: 'admin_created', target: `admins/${doc.id}`, details: { email: normalizedEmail, role } });
      res.status(201).json({ id: doc.id, message: 'Admin created' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const { role } = req.validated;
      await db.collection(COLLECTIONS.ADMINS).doc(req.params.id).set({ role, updatedAt: new Date().toISOString() }, { merge: true });
      await logAction({ adminId: req.admin.uid, adminName: req.admin.email, action: 'admin_role_changed', target: `admins/${req.params.id}`, details: { role } });
      res.json({ message: 'Admin updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      const ref = db.collection(COLLECTIONS.ADMINS).doc(req.params.id);
      const snap = await ref.get();
      if (snap.exists && snap.data().email === req.admin.email) {
        return res.status(400).json({ error: 'You cannot remove your own admin access' });
      }
      await ref.delete();
      await logAction({ adminId: req.admin.uid, adminName: req.admin.email, action: 'admin_removed', target: `admins/${req.params.id}` });
      res.json({ message: 'Admin access removed' });
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
