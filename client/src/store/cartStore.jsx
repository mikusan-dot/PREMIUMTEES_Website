import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const CART_KEY = 'pt_cart';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      deliveryCharge: 0,

      addItem: (item) => {
        const productId = item.productId ?? item.id;
        const { items } = get();
        const existing = items.find(
          (i) => i.productId === productId && i.variantId === item.variantId,
        );
        if (existing) {
          set({ items: items.map((i) => (i.productId === existing.productId && i.variantId === existing.variantId ? { ...i, quantity: i.quantity + (item.quantity ?? 1) } : i)) });
        } else {
          set({ items: [...items, { ...item, productId, quantity: item.quantity ?? 1 }] });
        }
      },

      removeItem: (productId, variantId) =>
        set({ items: get().items.filter((i) => !(i.productId === productId && i.variantId === variantId)) }),

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId, variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i,
          ),
        });
      },

      setCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),
      setDeliveryCharge: (charge) => set({ deliveryCharge: charge }),

      clearCart: () => set({ items: [], coupon: null, deliveryCharge: 0 }),

      getItemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      getSubtotal: () => get().items.reduce((acc, i) => acc + (i.price * i.quantity), 0),
    }),
    {
      name: CART_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
