---
name: frontend-conventions
description: Use when changing the React 18 + Vite storefront or admin app under client/src — adding pages, routing, components, UI primitives, Tailwind styling, TanStack Query fetching, Zustand stores, or react-hook-form/Zod forms in this premium tees e-commerce project.
---

# Client / Frontend Conventions

Scope: the `client/` app (React 18, Vite, Tailwind, JavaScript/JSX only — no TypeScript). Follow these conventions when adding or editing storefront, checkout, admin, or shared UI code.

## File layout

- `client/src/pages/*.jsx` — storefront pages, PascalCase file names.
- `client/src/components/layout/` — Header, Footer, page chrome.
- `client/src/components/ui/` — lowercase primitives (`button.jsx`, `input.jsx`, `card.jsx`, `badge.jsx`, `modal.jsx`, `avatar.jsx`).
- `client/src/layouts/Layout.jsx` — storefront shell rendering `<Outlet />`.
- `client/src/admin/pages/index.jsx` — all admin screens (exports `AdminDashboard`, `AdminProducts`, ...).
- `client/src/admin/layout/AdminLayout.jsx`, `client/src/admin/auth/requireAdmin.jsx` — admin chrome and guard.
- `client/src/store/*.jsx` — Zustand stores.
- `client/src/services/api.js` — axios instance and URL helpers.
- `client/src/lib/utils.jsx` — `cn` class merge helper.
- `client/src/context/ThemeContext.jsx` — light/dark theme provider.
- Routes are registered centrally in `client/src/App.jsx`.

## Imports and exports

- Always use the `@/` alias (maps to `client/src` in `vite.config.js`); avoid deep relative paths.
- Use named exports everywhere. Only `App` is a default export.
- Define components as arrow functions: `export const Shop = () => (...)`.
- Reuse primitives from `@/components/ui` instead of raw markup with ad-hoc classes.
- Use `lucide-react` for icons in new code (some old files inline SVGs; don't add more).

## Components

- UI primitives use `forwardRef`, accept `className`, and merge classes with `cn(...)` last so callers can override.
- Set `Component.displayName` on every `forwardRef` component.
- Keep variants as local lookup objects (see `button.jsx`, `badge.jsx`), not long ternary chains.
- Business components stay colocated with their page unless reused; promote to `components/` only when shared.

## Styling

- Tailwind only. Brand tokens live in `client/tailwind.config.js`:
  - `brand-black #0a0a0a`, `brand-white #ffffff`, `brand-offwhite #f7f5f1`, `brand-charcoal #1f1f1f`
  - `brand-accent #b45309`, `brand-accentHover #92400e`, `brand-muted #6b7280`, `brand-border #e5e5e5`
- Reuse global component classes from `client/src/styles/globals.css`: `.section`, `.container-premium`, `.section-header`, `.section-title`, `.section-subtitle`, `.btn`/`.btn-*`, `.input`, `.label`.
- Headings use Playfair Display (serif) and body text uses Inter; do not override heading font per page.
- Merge conditional classes with `cn` from `@/lib/utils` (a simple filter+join, not `tailwind-merge`).
- Dark mode is class-based (`darkMode: 'class'`); persist through `ThemeContext` (`pt_theme`), and add `dark:` variants only where the design needs them.
- Currency is BDT: integer values in data (`price: 850`) and `৳` prefix in UI (`৳1,500`). No decimals.
- Use `object-cover` for product imagery and always provide meaningful `alt` text. Unsplash placeholders are acceptable when API data has no image.

## Routing

- Add every route in `client/src/App.jsx`.
- Storefront routes nest under `<Route path="/" element={<Layout />}>`; admin routes nest under `/admin/*` behind `requireAdmin` and `AdminLayout`.
- In new code, navigate with `Link` or `useNavigate` from `react-router-dom`. Older pages use `window.location.href` — do not copy that pattern.

## Data fetching

- Use the `api` axios instance from `@/services/api` for JSON requests. Use `apiUrl(path)` only with `fetch`, `FormData`, or streaming.
- Never hardcode the backend origin. It comes from `VITE_API_URL` (fallback `VITE_API_BASE_URL`), and Vite proxies `/api` to `http://localhost:5000` in development.
- Fetch with TanStack Query `useQuery` and stable array keys, e.g. `['products']`, `['featured-products']`.
- Global defaults: `staleTime` 5 minutes, `retry: 1`, `refetchOnWindowFocus: false`. Override per query only when justified (e.g. Home uses 10 minutes).
- Phase-1 fallback pattern: `const { data: products = demoProducts } = useQuery(...)` ships demo data until the endpoint is reliable. Preserve it when editing those pages.
- Mutations should use `useMutation` and invalidate the matching query key. Admin screens currently use `useEffect` + `api.get` + local state; match that only inside existing admin screens.
- Server errors are shaped `{ error }`; read `err.response?.data?.error`.

## Products and stock

- API products carry stock per variant (`product.variants[].stock`) and may have no top-level `inStock`, `colors`, or `sizes`. Derive them with the helpers in `@/lib/product` (`isProductInStock`, `getProductColors`, `getProductSizes`, `getDefaultVariant`, `getVariantId`, `toCartItem`).
- Never reintroduce top-level `p.inStock` checks or compose variant IDs from `p.colors[0]`/`p.sizes[0]` for API products; that breaks uploaded products.
- Cart items need `productId`; `cartStore.addItem` fills it from `item.id` when absent. The order API rejects items without a string `productId`.

## State

- Zustand stores live in `src/store/<name>Store.jsx`, export `use<Name>Store`, and persist with `createJSONStorage(() => localStorage)`.
- localStorage keys are prefixed `pt_`: `pt_cart`, `pt_wishlist`, `pt_admin_token`, `pt_theme`.
- Keep derived calculations in the store (e.g. `getSubtotal`, `getItemCount`) instead of duplicating them across components.
- Do not add Redux or a second state library.

## Forms

- Use `react-hook-form` + Zod via `@hookform/resolvers/zod` for validated forms (see `pages/Checkout.jsx`).
- Declare the schema at module top, then `useForm({ resolver: zodResolver(schema), defaultValues })`.
- Register fields with `{...register('field')}` and render `errors.field.message` below the input as `text-xs text-red-600`.
- Use `useWatch` for UI driven by form values (e.g. selected payment method).
- `Label` is exported from `@/components/ui/input`, alongside `Input`.
- Simple admin edit forms may keep the `useState` + `handleChange(key, value)` object pattern used in `admin/pages/index.jsx`.

## Admin

- The session token is `localStorage['pt_admin_token']`; the axios request interceptor adds `Authorization: Bearer`.
- A `401` response clears the token and redirects to `/admin/login`.
- `requireAdmin` is the only route guard; do not introduce a parallel auth mechanism.
- Admin UI uses a neutral gray palette with `text-amber-600` accents instead of storefront brand classes.

## Verification

Run from `client/`:

- `npm run build` — primary correctness check.
- `npm run dev` — starts Vite on port 5173; API calls need the server on port 5000.
- `npm run lint` currently fails because the repo has the ESLint 9 script but no `eslint.config.js`. Do not treat that as a code error, and do not add an ESLint config unless asked.

There is no client test framework; do not add tests unless requested.

## Do not

- Do not introduce TypeScript, CSS modules, styled-components, or another data/state library.
- Do not change the Tailwind brand tokens, fonts, or global component classes without asking.
- Do not put secrets in client code; only `VITE_*` variables are exposed at build time.
- Do not hardcode API origins or localStorage key strings outside the patterns above.
