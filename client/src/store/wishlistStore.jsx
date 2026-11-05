import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const WISHLIST_KEY = 'pt_wishlist';

export const useWishlistStore = create(
  persist(
    (set) => ({
      ids: [],

      add: (id) =>
        set((state) => (state.ids.includes(id) ? state : { ids: [...state.ids, id] })),

      remove: (id) => set((state) => ({ ids: state.ids.filter((x) => x !== id) })),

      toggle: (id) =>
        set((state) => (state.ids.includes(id) ? { ids: state.ids.filter((x) => x !== id) } : { ids: [...state.ids, id] })),

      has: (id, ids) => ids.includes(id),

      clear: () => set({ ids: [] }),
    }),
    {
      name: WISHLIST_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
