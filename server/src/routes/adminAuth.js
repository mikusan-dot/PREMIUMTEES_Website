import { Router } from 'express';
import { authController } from '../controllers/admin.js';
import { validate } from '../validators/index.js';
import { authLoginSchema } from '../validators/index.js';

const router = Router();

// Public — no authentication required (login only)
router.post('/login', validate(authLoginSchema), authController.login);

export default router;
