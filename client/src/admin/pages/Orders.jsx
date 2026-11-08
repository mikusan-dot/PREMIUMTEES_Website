import { useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { PageHeader, Panel, Notice, StatusBadge, EmptyRow, Field, selectClass, money, formatDate, errMsg } from '@/admin/components/common';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['unpaid', 'pending', 'paid', 'failed', 'refunded'];

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState({ orderStatus: '', paymentStatus: '', note: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to load orders') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== 'all' && o.orderStatus !== filter) return false;
      if (!q) return true;
      return [o.orderId, o.customer?.name, o.customer?.phone].some((v) => String(v || '').toLowerCase().includes(q));
    });
  }, [orders, filter, search]);

  const open = (order) => {
    setSelected(order);
    setDraft({ orderStatus: order.orderStatus || 'pending', paymentStatus: order.paymentStatus || 'unpaid', note: order.note || '' });
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.put(`/admin/orders/${selected.id}/status`, draft);
      setMessage({ type: 'success', text: `Order ${selected.orderId} updated` });
      setSelected(null);
      load();
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err, 'Failed to update order') });
    } finally {
      setSaving(false);
    }
  };

  const counts = useMemo(() => orders.reduce((acc, o) => ({ ...acc, [o.orderStatus]: (acc[o.orderStatus] || 0) + 1 }), {}), [orders]);

  return (
    <div className="p-8">
      <PageHeader title="Order Management" subtitle="View orders and update their delivery and payment status" />
      <Notice message={message} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {['all', ...ORDER_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${filter === s ? 'border-brand-black bg-brand-black text-brand-white' : 'border-gray-300 bg-brand-white text-gray-700 hover:border-brand-black'}`}
          >
            {s}{s === 'all' ? ` (${orders.length})` : counts[s] ? ` (${counts[s]})` : ''}
          </button>
        ))}
        <div className="ml-auto w-full sm:w-72">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order id, name or phone" />
        </div>
      </div>

      <Panel className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Placed</th><th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && <EmptyRow cols={7} text="Loading..." />}
              {!loading && visible.length === 0 && <EmptyRow cols={7} text="No orders found." />}
              {visible.map((o) => (
                <tr key={o.id || o.orderId} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-brand-black">{o.orderId}</td>
                  <td className="px-4 py-3">{o.customer?.name}<div className="text-xs text-gray-500">{o.customer?.phone}</div></td>
                  <td className="px-4 py-3">{money(o.total)}</td>
                  <td className="px-4 py-3"><span className="uppercase text-xs text-gray-600">{o.paymentMethod}</span> <StatusBadge value={o.paymentStatus} /></td>
                  <td className="px-4 py-3"><StatusBadge value={o.orderStatus} /></td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3 text-right"><Button size="sm" variant="outline" onClick={() => open(o)}>View</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={!!selected} onOpenChange={() => setSelected(null)} className="max-h-[90vh] overflow-y-auto">
        {selected && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-brand-black">Order {selected.orderId}</h2>
              <p className="text-sm text-gray-500">Placed {formatDate(selected.createdAt)}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <div className="mb-1 font-semibold text-gray-700">Customer</div>
                <div>{selected.customer?.name}</div>
                <div>{selected.customer?.phone}</div>
                {selected.customer?.email && <div>{selected.customer.email}</div>}
              </div>
              <div>
                <div className="mb-1 font-semibold text-gray-700">Delivery address</div>
                <div>{selected.customer?.address}</div>
                <div>{selected.customer?.area}, {selected.customer?.district}</div>
              </div>
            </div>
            {selected.notes && <div className="rounded-xl bg-gray-50 p-3 text-sm"><span className="font-semibold">Customer note:</span> {selected.notes}</div>}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-3 py-2">Item</th><th className="px-3 py-2">Variant</th><th className="px-3 py-2">Qty</th><th className="px-3 py-2 text-right">Price</th></tr></thead>
                <tbody>
                  {(selected.items || []).map((i, idx) => (
                    <tr key={idx} className="border-t border-gray-100"><td className="px-3 py-2">{i.name}</td><td className="px-3 py-2">{i.color} / {i.size}</td><td className="px-3 py-2">{i.quantity}</td><td className="px-3 py-2 text-right">{money(i.price * i.quantity)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-1 text-right text-sm">
              <div>Subtotal: {money(selected.subtotal)}</div>
              {selected.discount > 0 && <div>Discount: -{money(selected.discount)}</div>}
              <div>Delivery: {money(selected.deliveryCharge)}</div>
              <div className="text-base font-bold text-brand-black">Total: {money(selected.total)}</div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Order status">
                <select className={selectClass} value={draft.orderStatus} onChange={(e) => setDraft({ ...draft, orderStatus: e.target.value })}>
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Payment status">
                <select className={selectClass} value={draft.paymentStatus} onChange={(e) => setDraft({ ...draft, paymentStatus: e.target.value })}>
                  {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Internal note (optional)" className="sm:col-span-2">
                <Input value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} placeholder="e.g. Courier booked, tracking #123" />
              </Field>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
              <Button onClick={save} disabled={saving} loading={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
