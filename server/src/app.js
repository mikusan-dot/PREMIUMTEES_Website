import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { initFirebase } from './config/firebase.js';
import { authenticateAdmin } from './middleware/auth.js';

// Initialize Firebase (Admin SDK)
initFirebase();

const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Secure HTTP headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));

// CORS — restrict to frontend origin in production
const corsOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window per IP
  message: { error: 'Too many requests, please try again later' },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts, please try again later' },
});

app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

// Root route
app.get('/', (_req, res) => {
  res.send('Premium Tees E-commerce Platform is running. Visit /api/health for status.');
});

// Route imports
import publicRoutes from './routes/public.js';
import adminAuthRoutes from './routes/adminAuth.js';
import adminRoutes from './routes/admin.js';

// Public API
app.use('/api', publicRoutes);

// Admin auth (login — public, no token required)
app.use('/api/admin/auth', adminAuthRoutes);

// Admin API (rate-limited + authenticated)
app.use('/api/admin', authLimiter, authenticateAdmin, adminRoutes);

export default app;
