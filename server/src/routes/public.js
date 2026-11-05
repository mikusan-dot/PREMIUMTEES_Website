import { Router } from 'express';
import {
  productController, orderController, couponController, settingsController,
  categoryController, paymentController,
} from '../services/firestoreService.js';
import { validate } from '../validators/index.js';
import { productSchema, orderSchema } from '../validators/index.js';

const router = Router();

// Public product routes
router.get('/products', productController.list);
router.get('/products/:slug', productController.getBySlug);

// Public categories
router.get('/categories', categoryController.list);

// Public settings
router.get('/settings/public', settingsController.getPublic);

// Public orders
router.post('/orders', validate(orderSchema), orderController.create);
router.post('/orders/track', orderController.track);

// Public coupon validation
router.post('/coupons/validate', couponController.validate);

// Public payment initiation
router.post('/payments/initiate', paymentController.initiate);
router.post('/payments/webhook', paymentController.webhook);

export default router;
