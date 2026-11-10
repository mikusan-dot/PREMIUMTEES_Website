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
// FRONTEND_URL may hold one or several comma-separated origins. Trailing
// slashes are ignored, since browsers send the Origin header without one.
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length
    ? (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin))
    : true,
  credentials: true,
}));

// Rate limiting
// A storefront page makes several API calls and filters/pagination add more, so a low
// limit (it used to be 100) locks out ordinary shoppers. The admin API has its own limiter.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX) || 1500, // requests per window per IP
  skip: (req) => req.originalUrl.startsWith('/api/admin'),
  message: { error: 'Too many requests, please try again later' },
});
app.use(globalLimiter);

// Strict limit for login attempts only
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts, please try again later' },
});

// Generous limit for the authenticated admin API (dashboard makes many calls)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later' },
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
app.use('/api/admin/auth', loginLimiter, adminAuthRoutes);

// Admin API (rate-limited + authenticated)
app.use('/api/admin', adminLimiter, authenticateAdmin, adminRoutes);

export default app;
