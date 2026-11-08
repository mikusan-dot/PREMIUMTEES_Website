import { useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { PageHeader, Panel, Notice, StatusBadge, EmptyRow, money, formatDate, errMsg } from '@/admin/components/common';

const METHOD_LABEL = { cod: 'Cash on Delivery', bkash: 'bKash', nagad: 'Nagad', card: 'Card' };

export const AdminPayments = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to load payments') });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  // Cancelled orders are not money owed.
  const active = useMemo(() => orders.filter((o) => o.orderStatus !== 'cancelled'), [orders]);
  const sum = (list) => list.reduce((s, o) => s + (o.total || 0), 0);
  const received = sum(active.filter((o) => o.paymentStatus === 'paid'));
  const outstanding = sum(active.filter((o) => o.paymentStatus !== 'paid' && o.paymentStatus !== 'refunded'));
  const byMethod = active.reduce((acc, o) => ({ ...acc, [o.paymentMethod]: (acc[o.paymentMethod] || 0) + (o.total || 0) }), {});

  const visible = filter === 'all' ? orders : orders.filter((o) => o.paymentStatus === filter);

  const markPaid = async (o) => {
    try {
      await api.put(`/admin/orders/${o.id}/status`, { paymentStatus: 'paid' });
      setMessage({ type: 'success', text: `${o.orderId} marked as paid` });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to update payment') });
    }
  };

  return (
    <div className="p-8">
      <PageHeader title="Payment Management" subtitle="Track what has been paid and what is still owed (cancelled orders are excluded from the totals)" />
      <Notice message={message} />
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Panel><div className="text-sm font-semibold uppercase tracking-wider text-gray-500">Received</div><div className="mt-2 text-2xl font-bold text-green-700">{money(received)}</div></Panel>
        <Panel><div className="text-sm font-semibold uppercase tracking-wider text-gray-500">Outstanding</div><div className="mt-2 text-2xl font-bold text-amber-700">{money(outstanding)}</div></Panel>
        {Object.entries(byMethod).slice(0, 2).map(([m, v]) => (
          <Panel key={m}><div className="text-sm font-semibold uppercase tracking-wider text-gray-500">{METHOD_LABEL[m] || m}</div><div className="mt-2 text-2xl font-bold text-brand-black">{money(v)}</div></Panel>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {['all', 'unpaid', 'pending', 'paid', 'failed', 'refunded'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${filter === s ? 'border-brand-black bg-brand-black text-brand-white' : 'border-gray-300 bg-brand-white text-gray-700 hover:border-brand-black'}`}>{s}</button>
        ))}
      </div>

      <Panel className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
              <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Date</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody>
              {loading && <EmptyRow cols={7} text="Loading..." />}
              {!loading && visible.length === 0 && <EmptyRow cols={7} text="No payments found." />}
              {visible.map((o) => (
                <tr key={o.id || o.orderId} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-brand-black">{o.orderId}</td>
                  <td className="px-4 py-3">{o.customer?.name}</td>
                  <td className="px-4 py-3">{METHOD_LABEL[o.paymentMethod] || o.paymentMethod}</td>
                  <td className="px-4 py-3">{money(o.total)}</td>
                  <td className="px-4 py-3"><StatusBadge value={o.paymentStatus} />{o.orderStatus === 'cancelled' && <span className="ml-1 text-xs text-red-600">cancelled</span>}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3 text-right">{o.paymentStatus !== 'paid' && o.orderStatus !== 'cancelled' && <Button size="sm" variant="outline" onClick={() => markPaid(o)}>Mark paid</Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
