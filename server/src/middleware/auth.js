import { getAuth } from '../config/firebase.js';
import { db } from '../services/db.js';
import { COLLECTIONS } from '../services/firestoreService.js';

// Verifies Firebase ID token sent in Authorization: Bearer <token> header.
// Attaches decoded admin claims (uid, email, role) to req.admin.
export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: missing token' });
    }

    const idToken = authHeader.split(' ')[1];
    const auth = getAuth();

    let decoded;
    if (process.env.DEV_MODE === 'true') {
      // Dev fallback: accept any token, derive role from header X-Admin-Role or default viewer
      decoded = {
        uid: 'dev-admin-uid',
        email: 'dev@premiumtees.local',
        role: req.headers['x-admin-role'] || 'super_admin',
      };
    } else {
      decoded = await auth.verifyIdToken(idToken);
    }

    // Firebase ID tokens only carry a role if a custom claim was set. Otherwise
    // fall back to the role stored in the Firestore `admins` collection.
    let role = decoded.role;
    if (!role && process.env.DEV_MODE !== 'true' && decoded.email) {
      const snap = await db.collection(COLLECTIONS.ADMINS).where('email', '==', decoded.email).limit(1).get();
      if (!snap.empty) role = snap.docs[0].data().role;
    }

    req.admin = {
      uid: decoded.uid,
      email: decoded.email,
      role: role || 'viewer',
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: invalid token' });
  }
};

// Role-based authorization. roles: array of allowed roles.
export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!allowedRoles.includes(req.admin.role)) {
    return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
  }
  next();
};

export const requirePermission = (action) => (req, res, next) => {
  if (!req.admin) return res.status(401).json({ error: 'Unauthorized' });
  const permissions = {
    super_admin: ['*'],
    product_manager: ['products:read', 'products:write', 'categories:read', 'categories:write', 'collections:read', 'collections:write', 'inventory:read', 'inventory:write'],
    order_manager: ['orders:read', 'orders:write'],
    marketing_manager: ['banners:read', 'banners:write', 'coupons:read', 'coupons:write', 'content:read', 'content:write'],
    viewer: ['dashboard:read', 'products:read', 'orders:read', 'reports:read'],
  };
  const allowed = permissions[req.admin.role] || [];
  if (!allowed.includes('*') && !allowed.includes(action)) {
    return res.status(403).json({ error: `Forbidden: missing permission ${action}` });
  }
  next();
};
