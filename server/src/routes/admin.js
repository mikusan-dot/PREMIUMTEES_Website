import { Router } from 'express';
import { authenticateAdmin, authorize } from '../middleware/auth.js';
import multer from 'multer';
import {
  productController, categoryController, collectionController, orderController, couponController,
  dashboardController, settingsController, paymentController,
} from '../services/firestoreService.js';
import {
  authController, adminController, reportsController, activityLogController,
} from '../controllers/admin.js';
import { uploadController } from '../controllers/uploadController.js';
import { validate } from '../validators/index.js';
import { productSchema, couponSchema, categorySchema, collectionSchema, settingsSchema, adminUserSchema, adminRoleSchema } from '../validators/index.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

// Auth
router.get('/auth/me', authenticateAdmin, authController.me);

// Image upload (Cloudinary)
router.post('/upload', authenticateAdmin, authorize('super_admin', 'product_manager', 'marketing_manager'), upload.single('image'), uploadController.uploadImage);

// Dashboard
router.get('/dashboard', authenticateAdmin, authorize('super_admin', 'product_manager', 'order_manager', 'marketing_manager', 'viewer'), dashboardController.stats);

// Products
router.get('/products', authenticateAdmin, authorize('super_admin', 'product_manager', 'viewer'), productController.adminList);
router.post('/products', authenticateAdmin, authorize('super_admin', 'product_manager'), validate(productSchema), productController.create);
router.put('/products/:id', authenticateAdmin, authorize('super_admin', 'product_manager'), validate(productSchema), productController.update);
router.delete('/products/:id', authenticateAdmin, authorize('super_admin', 'product_manager'), productController.delete);

// Collections
router.get('/collections', authenticateAdmin, authorize('super_admin', 'product_manager', 'marketing_manager', 'viewer'), collectionController.adminList);
router.post('/collections', authenticateAdmin, authorize('super_admin', 'product_manager', 'marketing_manager'), validate(collectionSchema), collectionController.create);
router.put('/collections/:id', authenticateAdmin, authorize('super_admin', 'product_manager', 'marketing_manager'), validate(collectionSchema), collectionController.update);
router.delete('/collections/:id', authenticateAdmin, authorize('super_admin', 'product_manager', 'marketing_manager'), collectionController.delete);

// Categories
router.get('/categories', authenticateAdmin, authorize('super_admin', 'product_manager', 'viewer'), categoryController.adminList);
router.post('/categories', authenticateAdmin, authorize('super_admin', 'product_manager'), validate(categorySchema), categoryController.create);
router.put('/categories/:id', authenticateAdmin, authorize('super_admin', 'product_manager'), validate(categorySchema), categoryController.update);
router.delete('/categories/:id', authenticateAdmin, authorize('super_admin', 'product_manager'), categoryController.delete);

// Orders
router.get('/orders', authenticateAdmin, authorize('super_admin', 'order_manager', 'viewer'), orderController.adminList);
router.put('/orders/:id/status', authenticateAdmin, authorize('super_admin', 'order_manager'), orderController.updateStatus);

// Coupons
router.get('/coupons', authenticateAdmin, authorize('super_admin', 'marketing_manager', 'viewer'), couponController.adminList);
router.post('/coupons', authenticateAdmin, authorize('super_admin', 'marketing_manager'), validate(couponSchema), couponController.create);
router.put('/coupons/:id', authenticateAdmin, authorize('super_admin', 'marketing_manager'), validate(couponSchema), couponController.update);
router.delete('/coupons/:id', authenticateAdmin, authorize('super_admin', 'marketing_manager'), couponController.delete);

// Settings
router.get('/settings', authenticateAdmin, authorize('super_admin', 'marketing_manager', 'viewer'), settingsController.adminGet);
router.put('/settings', authenticateAdmin, authorize('super_admin'), validate(settingsSchema), settingsController.adminUpdate);

// Payments
router.get('/payments', authenticateAdmin, authorize('super_admin', 'order_manager', 'viewer'), paymentController.adminList);

// Users (admins)
router.get('/users', authenticateAdmin, authorize('super_admin'), adminController.list);
router.post('/users', authenticateAdmin, authorize('super_admin'), validate(adminUserSchema), adminController.create);
router.put('/users/:id', authenticateAdmin, authorize('super_admin'), validate(adminRoleSchema), adminController.update);
router.delete('/users/:id', authenticateAdmin, authorize('super_admin'), adminController.delete);

// Reports
router.get('/reports', authenticateAdmin, authorize('super_admin', 'viewer'), reportsController.summary);

// Activity logs (read-only)
router.get('/activity-logs', authenticateAdmin, authorize('super_admin', 'viewer'), activityLogController.list);

export default router;
