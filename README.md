# Premium Tees — T-Shirt E-Commerce & Business Management Platform

A premium, production-ready T-shirt e-commerce platform for Bangladesh with a customer
storefront, guest checkout, Bangladesh payment support (COD, bKash, Nagad, cards), order
tracking, and a secure multi-admin dashboard with role-based permissions.

## Architecture

- `client/` — React + Vite + Tailwind + React Router + TanStack Query + Zustand
- `server/` — Node.js + Express + Firebase Admin SDK + Cloudinary
- Database — Cloud Firestore (`firestore.rules`, `firestore.indexes.json`)

## Tech Stack

Frontend: React 18, Vite, Tailwind CSS, Framer Motion, Lucide React, React Router,
React Hook Form, Zod, TanStack Query, Zustand, Recharts, Axios, Sonner.

Backend: Node.js, Express, Firebase Admin SDK (Auth + Firestore), Cloudinary,
Helmet, CORS, express-rate-limit, Zod, Multer + Cloudinary storage.

## Environment Setup

1. Copy `.env.example` to `.env` at the project root.
2. Fill in Firebase Admin SDK credentials (service account), Cloudinary keys,
   and payment gateway sandbox credentials.
3. Never commit `.env`.

## Installation

```bash
# Root (env + docs)
cp .env.example .env

# Client
cd client
npm install

# Server
cd ../server
npm install
```

## Running (Development)

Terminal 1 — Server:
```bash
cd server
npm run dev
# http://localhost:5000
```

Terminal 2 — Client:
```bash
cd client
npm run dev
# http://localhost:5173
```

The client proxies `/api` to `http://localhost:5000`.

## Development Mode (no Firebase credentials)

Set `DEV_MODE=true` in `.env` to run with an in-memory store so the platform can be
demonstrated and tested without Firebase. Production requires real Firebase credentials.

## Phases

See AGENTS.md for the full 6-phase development plan.

- Phase 1 — Foundation (design system, homepage, nav/footer, layout) ✅
- Phase 2 — Storefront (products, search, filters, wishlist, cart)
- Phase 3 — Checkout (guest checkout, COD, payments, order tracking)
- Phase 4 — Admin Dashboard (auth, roles, product/order/category/inventory mgmt)
- Phase 5 — Business Mgmt (customers, payments, coupons, CMS, analytics, logs)
- Phase 6 — Production (security audit, testing, deployment, docs)

## Security

- Firebase Authentication for admins only (no public admin registration).
- Role-based authorization enforced on the backend.
- Server-side price/stock validation; atomic stock decrement.
- Payment webhook signature verification (gateway).
- Rate limiting, Helmet headers, CORS restriction.
- Firestore security rules deny all direct frontend access.

## License

MIT
