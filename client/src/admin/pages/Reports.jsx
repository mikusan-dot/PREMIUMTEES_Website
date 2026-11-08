import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '@/services/api';
import { PageHeader, Panel, Notice, EmptyRow, money, errMsg } from '@/admin/components/common';

const dayKey = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : null);

export const AdminReports = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get('/admin/orders')
      .then((res) => setOrders(res.data.orders || []))
      .catch((err) => setMessage({ type: 'error', text: errMsg(err, 'Failed to load report data') }))
      .finally(() => setLoading(false));
  }, []);

  const report = useMemo(() => {
    const since = Date.now() - days * 24 * 60 * 60 * 1000;
    const inRange = orders.filter((o) => o.createdAt && new Date(o.createdAt).getTime() >= since);
    const sold = inRange.filter((o) => o.orderStatus !== 'cancelled');
    const revenue = sold.reduce((s, o) => s + (o.total || 0), 0);

    // One bar per day, including days with no sales
    const perDay = {};
    for (let i = days - 1; i >= 0; i -= 1) perDay[dayKey(new Date(Date.now() - i * 86400000).toISOString())] = 0;
    sold.forEach((o) => { const k = dayKey(o.createdAt); if (k in perDay) perDay[k] += o.total || 0; });
    const daily = Object.entries(perDay).map(([date, total]) => ({ date: date.slice(5), total }));

    const topMap = {};
    sold.forEach((o) => (o.items || []).forEach((i) => {
      const t = topMap[i.productId || i.name] || { name: i.name, qty: 0, revenue: 0 };
      t.qty += i.quantity; t.revenue += i.price * i.quantity; topMap[i.productId || i.name] = t;
    }));
    const top = Object.values(topMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

    const byMethod = sold.reduce((acc, o) => ({ ...acc, [o.paymentMethod]: (acc[o.paymentMethod] || 0) + (o.total || 0) }), {});
    const byStatus = inRange.reduce((acc, o) => ({ ...acc, [o.orderStatus]: (acc[o.orderStatus] || 0) + 1 }), {});

    return {
      revenue, orders: inRange.length, sold: sold.length, cancelled: inRange.length - sold.length,
      average: sold.length ? revenue / sold.length : 0, daily, top, byMethod, byStatus,
    };
  }, [orders, days]);

  return (
    <div className="p-8">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Sales figures exclude cancelled orders"
        action={(
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded-md border border-gray-300 bg-brand-white px-3 py-2 text-sm">
            <option value={7}>Last 7 days</option><option value={14}>Last 14 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
          </select>
        )}
      />
      <Notice message={message} />
      {loading ? <p className="text-sm text-gray-500">Loading...</p> : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[['Sales', money(report.revenue)], ['Orders', report.orders], ['Average order', money(report.average)], ['Cancelled', report.cancelled]].map(([t, v]) => (
              <Panel key={t}><div className="text-sm font-semibold uppercase tracking-wider text-gray-500">{t}</div><div className="mt-2 text-2xl font-bold text-brand-black">{v}</div></Panel>
            ))}
          </div>

          <Panel className="mt-8">
            <h2 className="mb-4 font-bold text-brand-black">Sales per day (BDT)</h2>
            <div className="h-72" role="img" aria-label="Bar chart of sales per day">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.daily} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={Math.ceil(days / 10) - 1} />
                  <YAxis tick={{ fontSize: 11 }} width={56} />
                  <Tooltip formatter={(v) => [money(v), 'Sales']} />
                  <Bar dataKey="total" fill="#b45309" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Panel className="p-0 lg:col-span-1">
              <h2 className="px-6 pt-6 font-bold text-brand-black">Top products</h2>
              <table className="mt-3 w-full text-left text-sm"><tbody>
                {report.top.length === 0 && <EmptyRow cols={2} text="No sales in this period." />}
                {report.top.map((t) => (<tr key={t.name} className="border-t border-gray-100"><td className="px-6 py-3">{t.name}</td><td className="px-6 py-3 text-right text-gray-600">{t.qty} sold · {money(t.revenue)}</td></tr>))}
              </tbody></table>
            </Panel>
            <Panel className="p-0">
              <h2 className="px-6 pt-6 font-bold text-brand-black">Sales by payment method</h2>
              <table className="mt-3 w-full text-left text-sm"><tbody>
                {Object.keys(report.byMethod).length === 0 && <EmptyRow cols={2} text="No sales in this period." />}
                {Object.entries(report.byMethod).map(([m, v]) => (<tr key={m} className="border-t border-gray-100"><td className="px-6 py-3 uppercase">{m}</td><td className="px-6 py-3 text-right">{money(v)}</td></tr>))}
              </tbody></table>
            </Panel>
            <Panel className="p-0">
              <h2 className="px-6 pt-6 font-bold text-brand-black">Orders by status</h2>
              <table className="mt-3 w-full text-left text-sm"><tbody>
                {Object.keys(report.byStatus).length === 0 && <EmptyRow cols={2} text="No orders in this period." />}
                {Object.entries(report.byStatus).map(([s, n]) => (<tr key={s} className="border-t border-gray-100"><td className="px-6 py-3 capitalize">{s}</td><td className="px-6 py-3 text-right">{n}</td></tr>))}
              </tbody></table>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
};
