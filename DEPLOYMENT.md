# Unhinged Co. — Rebrand deployment guide

Nothing in this guide deletes data. The Firebase project, Firestore data, Cloudinary images and the
existing backend keep working untouched. **Keep the current deployment live until the new one is tested.**

## What changed vs. what deliberately did not

| Changed (customer-facing) | Left alone (internal identifiers) |
|---|---|
| Header/footer logo, hero, About, Contact, Privacy, Terms, page titles, SEO/Open Graph, favicon & app icons, admin login/sidebar | Firebase project ID, Firestore collections/doc IDs, Cloudinary folder `premium-tees/products` and all image URLs |
| Brand defaults served by the API (`/api/settings/public`), default category SEO titles, server root message | Env var names, API paths (`/api/...`), localStorage keys (`pt_cart`, `pt_theme`, `pt_wishlist`, `pt_admin_token`) |
| `render.yaml` (static site name `unhinged-co`) | Backend Render service and its URL `premiumtees-website.onrender.com` (used by `VITE_API_URL`) |
| Accent colour: amber → monochrome (Sale stays red) | GitHub repository name `PREMIUMTEES_Website` (optional manual rename, see step 8) |

The brand name, tagline, description, logo, favicon, support email/phone/address and Facebook/Instagram/TikTok
links are editable in **Admin → Settings → Brand** and apply instantly (no redeploy). Existing stores that
still have "Premium Tees" saved in settings automatically show the new name.

## Deployment steps (frontend)

Render's hostname comes from the *service name*, and names are global — **`unhinged-co.onrender.com` may already be
taken**. Render will tell you; use whatever hostname it gives you and use it everywhere below as `NEW_URL`.

1. **Merge/pull** this commit to `main` (already done if you are reading this on `main`).
2. **Create the new static site** (keeps the old one running):
   Render Dashboard → *New → Static Site* → connect the same repo → Name `unhinged-co`, Root Directory `client`,
   Build `npm install && npm run build`, Publish Directory `dist`.
   Environment variables:
   - `VITE_API_URL` = `https://premiumtees-website.onrender.com` (the existing backend, unchanged)
   - `VITE_SITE_URL` = `NEW_URL` (e.g. `https://unhinged-co.onrender.com`) — used for canonical tags, sitemap, robots, og:image
   - `NODE_VERSION` = `20.18.0`
   Under *Redirects/Rewrites* add: `/*` → `/index.html` as **Rewrite**.
3. **Allow the new origin on the backend** (otherwise the new site shows "couldn't load"):
   Backend service → Environment → `FRONTEND_URL` = old frontend origin **and** new origin, comma-separated, no trailing slash, e.g.
   `https://premium-tees-client.onrender.com,https://unhinged-co.onrender.com`. Save → backend redeploys.
   Later add `https://unhingedco.com,https://www.unhingedco.com`.
4. **Test the new URL** before touching anything else: homepage, logo on mobile, category pages, product pages, cart,
   guest checkout, admin login, an image upload, an order, dark/light toggle, existing product images.
5. **Redirect old → new** (only after step 4 passes). Two layers, use both:
   - Render redirect on the OLD static site: *Redirects/Rewrites* → Source `/*`, Destination `NEW_URL/*`, Type **Redirect (301)**.
     (If it is easier, instead set `VITE_LEGACY_HOSTS=<old-hostname>` and `VITE_SITE_URL=NEW_URL` on the old site and
     redeploy — the app then forwards visitors to the same path on the new site.)
   - `render.yaml` already lists `VITE_LEGACY_HOSTS=premium-tees-client.onrender.com` — change it to your real old hostname.
6. **Admin settings**: sign in at `NEW_URL/admin/login` → Settings → Brand: set the tagline, support email/phone, social
   links, and optionally upload a logo and favicon. Delivery, tax and Instagram settings are unchanged.
7. **Custom domain `unhingedco.com`** (only once you own it — availability is not assumed):
   Static site → Settings → Custom Domains → add `unhingedco.com` and `www.unhingedco.com`. At your registrar, add the DNS
   records Render shows (usually an `A`/`ALIAS` for the apex and a `CNAME www` → `unhinged-co.onrender.com`). Wait for the
   certificate, then set `VITE_SITE_URL=https://unhingedco.com`, redeploy (this regenerates sitemap/robots/canonicals), and
   extend `FRONTEND_URL` on the backend (step 3). Make the old Render URL redirect to the custom domain.
8. **Optional**: rename the GitHub repo (Settings → General). GitHub redirects the old name; then re-point Render's repo
   connection if it asks. Update your local remote with `git remote set-url origin <new url>`.

## Services checklist (what is affected, what is not)

- **Render frontend** — new service/hostname (steps 2, 5, 7). Old one stays until verified.
- **Render backend** — only `FRONTEND_URL` changes (step 3). Do not rename it: that changes its URL and would need
  `VITE_API_URL` updated on every frontend build.
- **Firebase Auth authorised domains** — *only needed if you add the Firebase client SDK*. The app signs in through the
  backend REST call, so no change is required today. If you add client-side Firebase sign-in later, add the new hostnames in
  Firebase Console → Authentication → Settings → Authorised domains.
- **Payment gateways (bKash/Nagad/SSLCommerz)** — payment callbacks are not wired into the code yet (`.env.example` has a
  placeholder `SSLCOMMERZ_SUCCESS_URL`). When you enable them, register success/fail/cancel URLs that point at the **backend**
  (`https://premiumtees-website.onrender.com/api/payments/...`), which does not change.
- **Cloudinary** — no change: uploads go through the backend and existing URLs stay valid.
- **Email/invoice templates, order-notification links** — the project currently sends no emails or invoices, so there is
  nothing to rebrand yet; when added, take the name from the settings API.
- **Secrets** — none changed. If any key was ever pasted into chat or committed, rotate it.

## Rollback
The old static site is untouched until step 5. To roll back, remove the redirect on the old site (or delete the new
site) and restore `FRONTEND_URL` if you changed it.
