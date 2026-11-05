import { Router } from 'express';
import { authenticateAdmin, authorize } from '../middleware/auth.js';
import {
  productController, categoryController, orderController, couponController,
  dashboardController, settingsController, paymentController,
} from '../services/firestoreService.js';
import {
  authController, adminController, reportsController, activityLogController,
} from '../controllers/admin.js';
import { validate } from '../validators/index.js';
import { productSchema, orderSchema, couponSchema, categorySchema, settingsSchema, authLoginSchema } from '../validators/index.js';

const router = Router();

// Auth
router.get('/auth/me', authenticateAdmin, authController.me);

// Dashboard
router.get('/dashboard', authenticateAdmin, authorize('super_admin', 'product_manager', 'order_manager', 'marketing_manager', 'viewer'), dashboardController.stats);

// Products
router.get('/products', authenticateAdmin, authorize('super_admin', 'product_manager', 'viewer'), productController.adminList);
router.post('/products', authenticateAdmin, authorize('super_admin', 'product_manager'), validate(productSchema), productController.create);
router.put('/products/:id', authenticateAdmin, authorize('super_admin', 'product_manager'), validate(productSchema), productController.update);
router.delete('/products/:id', authenticateAdmin, authorize('super_admin', 'product_manager'), productController.delete);

// Categories
router.get('/categories', authenticateAdmin, authorize('super_admin', 'product_manager', 'viewer'), categoryController.adminList);
router.post('/categories', authenticateAdmin, authorize('super_admin', 'product_manager'), validate(categorySchema), categoryController.create);

// Orders
router.get('/orders', authenticateAdmin, authorize('super_admin', 'order_manager', 'viewer'), orderController.adminList);
router.put('/orders/:id/status', authenticateAdmin, authorize('super_admin', 'order_manager'), orderController.updateStatus);

// Coupons
router.get('/coupons', authenticateAdmin, authorize('super_admin', 'marketing_manager', 'viewer'), couponController.adminList);

// Payments
router.get('/payments', authenticateAdmin, authorize('super_admin', 'viewer'), paymentController.adminList);

// Users (admins)
router.get('/users', authenticateAdmin, authorize('super_admin'), adminController.list);
router.post('/users', authenticateAdmin, authorize('super_admin'), adminController.create);
router.put('/users/:id', authenticateAdmin, authorize('super_admin'), adminController.update);
router.delete('/users/:id', authenticateAdmin, authorize('super_admin'), adminController.delete);

// Reports
router.get('/reports', authenticateAdmin, authorize('super_admin', 'viewer'), reportsController.summary);

// Activity logs (read-only)
router.get('/activity-logs', authenticateAdmin, authorize('super_admin', 'viewer'), activityLogController.list);

export default router;
