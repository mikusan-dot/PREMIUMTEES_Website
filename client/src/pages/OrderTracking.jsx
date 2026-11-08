import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { apiUrl } from '@/services/api';

export const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statuses = [
    { key: 'pending', label: 'Pending', completed: true },
    { key: 'confirmed', label: 'Confirmed', completed: true },
    { key: 'processing', label: 'Processing', completed: true },
    { key: 'packed', label: 'Packed', completed: false },
    { key: 'shipped', label: 'Shipped', completed: false },
    { key: 'out-for-delivery', label: 'Out for Delivery', completed: false },
    { key: 'delivered', label: 'Delivered', completed: false },
  ];

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/orders/track'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, phone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Order not found');
      setTracking(json.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (tracking) {
    return (
      <section className="section">
        <div className="container-premium">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <a href="/track" className="text-brand-muted hover:text-brand-black">← Track another order</a>
              <span className="text-xs text-brand-muted">/</span>
              <h2 className="text-2xl font-bold text-brand-black">Order #{tracking.orderId}</h2>
            </div>

            <Card>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 rounded-xl bg-brand-offwhite border border-brand-border">
                    <div className="text-brand-muted text-xs uppercase tracking-wider">Order Status</div>
                    <div className="font-bold text-brand-black capitalize">{tracking.orderStatus}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-brand-offwhite border border-brand-border">
                    <div className="text-brand-muted text-xs uppercase tracking-wider">Payment</div>
                    <div className="font-bold text-brand-black capitalize">{tracking.paymentStatus}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-brand-offwhite border border-brand-border">
                    <div className="text-brand-muted text-xs uppercase tracking-wider">Total</div>
                    <div className="font-bold text-brand-black">৳{tracking.total}</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-bold text-brand-black">Order Timeline</h3>
                  <div className="relative space-y-8">
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-brand-border" />
                    {statuses.map((s, i) => {
                      const completed = statuses.slice(0, i + 1).every((x) => tracking.statusOrder?.includes(x.key) || i <= (tracking.statusOrder?.indexOf(tracking.orderStatus) ?? 0));
                      return (
                        <div key={s.key} className="flex gap-4">
                          <div className="relative z-10 flex w-8 h-8 items-center justify-center rounded-full border-4 transition-colors duration-500
                            {completed ? 'bg-brand-black border-brand-black text-brand-white' : 'bg-brand-white border-brand-border text-brand-muted'}
                          ">
                            {completed ? '✓' : i === statuses.indexOf({ key: tracking.orderStatus }) ? '○' : ''}
                          </div>
                          <div className="flex-grow">
                            <div className={`text-sm font-medium ${completed ? 'text-brand-black' : 'text-brand-muted'}`}>{s.label}</div>
                            {i === 0 && <div className="text-xs text-brand-muted">{tracking.createdAt || 'Just now'}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-brand-border pt-6">
                  <h3 className="font-bold text-brand-black mb-4">Customer Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div><div className="text-brand-muted text-xs uppercase">Name</div><div className="font-medium">{tracking.customer?.name}</div></div>
                    <div><div className="text-brand-muted text-xs uppercase">Phone</div><div className="font-medium">{tracking.customer?.phone}</div></div>
                    <div className="col-span-full"><div className="text-brand-muted text-xs uppercase">Address</div><div className="font-medium">{tracking.customer?.address}, {tracking.customer?.area}, {tracking.customer?.district}</div></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container-premium">
        <div className="max-w-lg mx-auto">
          <Card>
            <div className="p-8 text-center">
              <h2 className="text-3xl font-bold text-brand-black mb-2">Track Your Order</h2>
              <p className="text-brand-muted mb-8">Enter your order ID and phone number to check status.</p>
              <form onSubmit={handleTrack} className="space-y-4">
                <div className="space-y-2">
                  <Label>Order ID</Label>
                  <Input {...{ value: orderId, onChange: (e) => setOrderId(e.target.value) }} placeholder="e.g. PT-1001" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input {...{ value: phone, onChange: (e) => setPhone(e.target.value) }} placeholder="+880 1XXX XXXXXX" />
                </div>
                <Button type="submit" size="lg" disabled={loading} className="w-full" loading={loading}>
                  {loading ? 'Tracking...' : 'Track Order'}
                </Button>
              </form>
              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
