import { Router } from 'express';
import {
  productController, orderController, couponController, settingsController,
  categoryController, collectionController, paymentController, reviewController, newsletterController,
} from '../services/firestoreService.js';
import { validate } from '../validators/index.js';
import { newsletterSchema, orderSchema } from '../validators/index.js';

const router = Router();

// Public product routes
router.get('/products', productController.list);
router.get('/products/:slug', productController.getBySlug);

// Public collections
router.get('/collections', collectionController.list);
router.get('/collections/:slug', collectionController.getBySlug);

// Public categories
router.get('/categories', categoryController.list);
router.get('/categories/:slug', categoryController.getBySlug);

// Public settings
router.get('/settings/public', settingsController.getPublic);

// Genuine, admin-approved customer reviews only
router.get('/reviews', reviewController.list);

// Newsletter subscription
router.post('/newsletter', validate(newsletterSchema), newsletterController.subscribe);

// Public orders
router.post('/orders', validate(orderSchema), orderController.create);
router.post('/orders/track', orderController.track);

// Public coupon validation
router.post('/coupons/validate', couponController.validate);

// Public payment initiation
router.post('/payments/initiate', paymentController.initiate);
router.post('/payments/webhook', paymentController.webhook);

export default router;
