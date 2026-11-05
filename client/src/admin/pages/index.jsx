export const AdminDashboard = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-black mb-8">Dashboard</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[['Total Revenue', '৳1,24,500', 'trending-up'], ['Total Orders', '128', 'shopping-cart'], ['Pending Orders', '14', 'clock'], ['Total Products', '56', 'package']].map(([title, value, icon]) => (
        <div key={title} className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="text-gray-500 text-sm uppercase tracking-wider font-semibold mb-2">{title}</div>
          <div className="text-2xl font-bold text-black">{value}</div>
        </div>
      ))}
    </div>
    <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-black mb-4">Recent Orders</h2>
      <p className="text-gray-500 text-sm">Order management coming in Phase 4.</p>
    </div>
  </div>
);

export const AdminProducts = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-black mb-8">Product Management</h1>
    <p className="text-gray-500 text-sm">Product CRUD coming in Phase 4.</p>
  </div>
);

export const AdminOrders = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-black mb-8">Order Management</h1>
    <p className="text-gray-500 text-sm">Order processing coming in Phase 4.</p>
  </div>
);

export const AdminCategories = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-black mb-8">Category Management</h1>
    <p className="text-gray-500 text-sm">Category CRUD coming in Phase 4.</p>
  </div>
);

export const AdminCoupons = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-black mb-8">Coupon Management</h1>
    <p className="text-gray-500 text-sm">Coupon system coming in Phase 5.</p>
  </div>
);

export const AdminPayments = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-black mb-8">Payment Management</h1>
    <p className="text-gray-500 text-sm">Payment records coming in Phase 5.</p>
  </div>
);

export const AdminUsers = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-black mb-8">Admin Users</h1>
    <p className="text-gray-500 text-sm">Role & permission management coming in Phase 4.</p>
  </div>
);

export const AdminReports = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-black mb-8">Reports & Analytics</h1>
    <p className="text-gray-500 text-sm">Recharts analytics coming in Phase 5.</p>
  </div>
);

export const AdminSettings = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-black mb-8">Website Settings</h1>
    <p className="text-gray-500 text-sm">Brand identity & content management coming in Phase 5.</p>
  </div>
);
