import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  district: z.string().min(1, 'District is required'),
  area: z.string().min(1, 'Area is required'),
  address: z.string().min(5, 'Complete delivery address is required'),
  paymentMethod: z.enum(['cod', 'bkash', 'nagad', 'card']),
  notes: z.string().optional(),
  terms: z.boolean().refine((v) => v === true, 'You must agree to the terms'),
});

export const Checkout = () => {
  const { items, clearCart, getSubtotal, getItemCount } = useCartStore();
  const [processing, setProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);

  const deliveryCharge = 80;
  const subtotal = getSubtotal();
  const total = subtotal + deliveryCharge;

  if (getItemCount() === 0) {
    window.location.href = '/cart';
    return null;
  }

  if (orderPlaced) {
    return (
      <section className="section">
        <div className="container-premium">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h2 className="text-4xl font-bold text-brand-black mb-4">Order Placed!</h2>
            <p className="text-brand-muted mb-6">Thank you for your order. Your order ID is <span className="font-bold text-brand-black">{orderPlaced.orderId}</span>.</p>
            <p className="text-sm text-brand-muted mb-8">We'll send updates to your phone. Track your order anytime using your order ID and phone number.</p>
            <Button onClick={() => { clearCart(); window.location.href = '/'; }} className="w-full sm:w-auto">Continue Shopping</Button>
            <Button variant="outline" onClick={() => { window.location.href = `/track?id=${orderPlaced.orderId}&phone=${orderPlaced.phone}`; }} className="w-full sm:w-auto mt-4">Track Order</Button>
          </div>
        </div>
      </section>
    );
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'cod', terms: false },
  });

  const onSubmit = (data) => {
    setProcessing(true);
    // Backend validation & order creation happens here via API
    const orderPayload = {
      customer: {
        name: data.name,
        phone: data.phone,
        district: data.district,
        area: data.area,
        address: data.address,
        email: data.email,
      },
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        name: i.name,
        sku: i.variantId,
        color: i.color,
        size: i.size,
        quantity: i.quantity,
        price: i.price,
      })),
      subtotal,
      discount: 0,
      deliveryCharge,
      total,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'cod' ? 'unpaid' : 'pending',
      orderStatus: 'pending',
      notes: data.notes,
    };

    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || 'Order failed');
        return json;
      })
      .then((json) => {
        setOrderPlaced({ orderId: json.orderId, phone: data.phone });
      })
      .catch((err) => {
        alert(err.message || 'Failed to place order');
        setProcessing(false);
      });
  };

  return (
    <section className="section">
      <div className="container-premium">
        <div className="grid lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3">
            <h2 className="text-3xl font-bold text-brand-black mb-8">Checkout</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input {...register('name')} placeholder="John Doe" className={cnInput(errors.name)} />
                  {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input {...register('phone')} placeholder="+880 1XXX XXXXXX" className={cnInput(errors.phone)} />
                  {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email (optional)</Label>
                  <Input {...register('email')} placeholder="you@example.com" className={cnInput(errors.email)} />
                  {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>District</Label>
                  <Input {...register('district')} placeholder="Dhaka" className={cnInput(errors.district)} />
                  {errors.district && <p className="text-xs text-red-600">{errors.district.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Area / City</Label>
                  <Input {...register('area')} placeholder="Gulshan" className={cnInput(errors.area)} />
                  {errors.area && <p className="text-xs text-red-600">{errors.area.message}</p>}
                </div>
                <div className="space-y-2 col-span-full">
                  <Label>Complete Delivery Address</Label>
                  <Input {...register('address')} placeholder="House 12, Road 4, Block C" className={cnInput(errors.address)} />
                  {errors.address && <p className="text-xs text-red-600">{errors.address.message}</p>}
                </div>
                <div className="space-y-2 col-span-full">
                  <Label>Delivery Instructions / Order Notes (optional)</Label>
                  <Input {...register('notes')} placeholder="Leave at door..." />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { val: 'cod', label: 'Cash on Delivery', badge: 'Pay on delivery' },
                    { val: 'bkash', label: 'bKash', badge: 'Mobile payment' },
                    { val: 'nagad', label: 'Nagad', badge: 'Mobile payment' },
                    { val: 'card', label: 'Debit/Credit Card', badge: 'Online payment' },
                  ].map((m) => (
                    <label key={m.val} className={`cursor-pointer p-3 rounded-xl border transition-all ${data => (false ? '' : '')}`}>
                      <input type="radio" {...register('paymentMethod', { value: m.val })} className="sr-only peer" />
                      <div className={`flex flex-col items-center p-3 rounded-xl border transition-all peer-checked:border-brand-accent peer-checked:bg-brand-offwhite/50 ${data.paymentMethod === m.val ? 'border-brand-accent bg-brand-offwhite/50' : 'border-brand-border hover:border-brand-charcoal'}`}>
                        <span className="text-xs font-semibold text-brand-charcoal">{m.label}</span>
                        <span className="text-xs text-brand-muted">{m.badge}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.paymentMethod && <p className="text-xs text-red-600">{errors.paymentMethod.message}</p>}
              </div>

              <div className="flex items-start gap-3">
                <input type="checkbox" {...register('terms')} className="w-4 h-4 mt-0.5" />
                <div className="text-sm text-brand-muted leading-relaxed">
                  I agree to the <a href="#" className="text-brand-black hover:underline">Terms &amp; Conditions</a> and
                  <a href="#" className="text-brand-black hover:underline">Return &amp; Refund Policy</a>.
                </div>
                {errors.terms && <p className="text-xs text-red-600">{errors.terms.message}</p>}
              </div>

              <Button type="submit" size="lg" disabled={processing} className="w-full" loading={processing}>
                {processing ? 'Placing Order...' : 'Place Order'}
              </Button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-brand-black text-lg">Order Summary</h3>
                  <p className="text-sm text-brand-muted">Items: {getItemCount()}</p>
                </div>
                <div className="space-y-4 border-t border-brand-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-muted">Subtotal</span>
                    <span className="font-medium">৳{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-muted">Delivery Charge</span>
                    <span className="font-medium">৳{deliveryCharge}</span>
                  </div>
                  <div className="flex justify-between text-brand-black font-bold text-lg border-t border-brand-border pt-4">
                    <span>Total Payable</span>
                    <span>৳{total}</span>
                  </div>
                </div>
                <div className="space-y-3 border-t border-brand-border pt-4">
                  {items.map((i) => (
                    <div key={i.variantId} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=40&h=40&fit=crop&q=80" alt="" className="w-8 h-8 rounded-md object-cover" />
                        <div>
                          <div className="text-brand-black font-medium text-sm">{i.name}</div>
                          <div className="text-xs text-brand-muted">{i.size} · {i.color}</div>
                        </div>
                      </div>
                      <span className="font-medium">৳{i.price * i.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

function cnInput(err) {
  return `block w-full rounded-md border px-3 py-2 text-brand-charcoal shadow-sm sm:text-sm ${err ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-brand-border focus:border-brand-accent focus:ring-brand-accent'}`;
}
