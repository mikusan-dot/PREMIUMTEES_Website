import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { PageHeader, Panel, Notice, StatusBadge, EmptyRow, money, formatDate, errMsg } from '@/admin/components/common';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((res) => setStats(res.data))
      .catch((err) => setMessage({ type: 'error', text: errMsg(err, 'Failed to load dashboard') }));
  }, []);

  const cards = stats ? [
    ['Total Revenue', money(stats.totalRevenue), 'Excludes cancelled orders'],
    ['Total Orders', stats.totalOrders, `${stats.completedOrders} delivered`],
    ['Pending Orders', stats.pendingOrders, `${stats.cancelledOrders} cancelled`],
    ['Customers', stats.totalCustomers, 'Unique phone numbers'],
    ['Products', stats.totalProducts, `${stats.activeProducts} active`],
    ['Low Stock', stats.lowStockProducts, '5 or fewer left'],
    ['Out of Stock', stats.outOfStockProducts, 'All variants at 0'],
  ] : [];

  return (
    <div className="p-8">
      <PageHeader title="Dashboard" subtitle="A quick look at your store" />
      <Notice message={message} />
      {!stats && !message && <p className="text-sm text-gray-500">Loading...</p>}
      {stats && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(([title, value, hint]) => (
              <Panel key={title}>
                <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">{title}</div>
                <div className="text-2xl font-bold text-black">{value}</div>
                <div className="mt-1 text-xs text-gray-500">{hint}</div>
              </Panel>
            ))}
          </div>
          <Panel className="mt-10">
            <h2 className="mb-4 text-lg font-bold text-black">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
                  <tr><th className="px-4 py-2">Order</th><th className="px-4 py-2">Customer</th><th className="px-4 py-2">Total</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Placed</th></tr>
                </thead>
                <tbody>
                  {(stats.recentOrders || []).length === 0 && <EmptyRow cols={5} text="No orders yet." />}
                  {(stats.recentOrders || []).map((o) => (
                    <tr key={o.id || o.orderId} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-black">{o.orderId}</td>
                      <td className="px-4 py-3">{o.customer?.name}</td>
                      <td className="px-4 py-3">{money(o.total)}</td>
                      <td className="px-4 py-3"><StatusBadge value={o.orderStatus} /></td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
};
