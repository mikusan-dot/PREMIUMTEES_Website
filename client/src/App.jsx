import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/layouts/Layout';
import { Home } from '@/pages/Home';
import { Shop } from '@/pages/Shop';
import { ProductDetail } from '@/pages/ProductDetail';
import { NewArrivals } from '@/pages/NewArrivals';
import { BestSellers } from '@/pages/BestSellers';
import { Cart } from '@/pages/Cart';
import { Wishlist } from '@/pages/Wishlist';
import { Checkout } from '@/pages/Checkout';
import { OrderTracking } from '@/pages/OrderTracking';
import { Categories } from '@/pages/Categories';
import { About } from '@/pages/About';
import { Contact } from '@/pages/Contact';
import { NotFound } from '@/pages/NotFound';
import { AdminLayout } from '@/admin/layout/AdminLayout';
import { AdminLogin } from '@/admin/pages/Login';
import {
  AdminDashboard,
  AdminProducts,
  AdminOrders,
  AdminCategories,
  AdminSettings,
  AdminCoupons,
  AdminUsers,
  AdminPayments,
} from '@/admin/pages';
import { RequireAdmin } from '@/admin/auth/requireAdmin';

// Reports pulls in the charting library, so only load it when that page is opened.
const AdminReports = lazy(() => import('@/admin/pages/Reports').then((m) => ({ default: m.AdminReports })));

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Public storefront */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="new-arrivals" element={<NewArrivals />} />
        <Route path="best-sellers" element={<BestSellers />} />
        <Route path="categories" element={<Categories />} />
        <Route path="product/:slug" element={<ProductDetail />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="track" element={<OrderTracking />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/*"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reports" element={<Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading...</div>}><AdminReports /></Suspense>} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
