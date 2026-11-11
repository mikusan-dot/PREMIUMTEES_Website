import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useStoreSettings } from '@/hooks/useStoreSettings';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=600&fit=crop&q=80';

export const Cart = () => {
  const settings = useStoreSettings(); // keep hooks above any early return
  const { items, removeItem, updateQuantity, getSubtotal, getItemCount, clearCart } = useCartStore();

  if (getItemCount() === 0) {
    return (
      <section className="section">
        <div className="container-premium">
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-brand-black mb-4">Your cart is empty</h2>
            <p className="text-brand-muted mb-8">Looks like you haven't added anything yet.</p>
            <Button asChild>
              <a href="/shop">Start Shopping</a>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const subtotal = getSubtotal();
  const deliveryCharge = settings.deliveryChargeInsideDhaka; // exact charge is set at checkout from the district
  const total = subtotal + deliveryCharge;

  return (
    <section className="section">
      <div className="container-premium">
        <div className="grid lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3">
            <h2 className="text-3xl font-bold text-brand-black mb-8">Shopping Cart</h2>
            <div className="space-y-6">
              {items.map((item) => (
                <Card key={item.variantId} className="flex flex-col sm:flex-row gap-6 p-6">
                  <div className="w-full sm:w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-brand-offwhite">
                    <img src={item.images?.[0] ?? item.image ?? PLACEHOLDER} alt={item.name} className="w-full h-full object-cover object-center" />
                  </div>
                  <div className="flex-grow space-y-3">
                    <div>
                      <h3 className="font-bold text-brand-black">{item.name}</h3>
                      <p className="text-sm text-brand-muted">{item.color} · {item.size}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">৳{item.price}</span>
                      <div className="flex items-center gap-2 border border-brand-border rounded-md">
                        <Button variant="outline" size="sm" onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}>−</Button>
                        <span className="px-2 font-medium">{item.quantity}</span>
                        <Button variant="outline" size="sm" onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}>+</Button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-brand-black text-lg">Order Summary</h3>
                  <p className="text-sm text-brand-muted">Includes all taxes and fees</p>
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
                    <span>Total</span>
                    <span>৳{total}</span>
                  </div>
                </div>
                <Button size="lg" className="w-full" onClick={() => { window.location.href = '/checkout'; }}>
                  Proceed to Checkout
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
