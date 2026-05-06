import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1) => {
        const items = get().items;
        const existing = items.find(i => i.product_id === product.id);
        if (existing) {
          set({
            items: items.map(i =>
              i.product_id === product.id ? { ...i, qty: i.qty + qty } : i
            )
          });
        } else {
          set({
            items: [
              ...items,
              {
                product_id: product.id,
                name: product.name,
                price: Number(product.price),
                image: product.image,
                slug: product.slug,
                qty,
              },
            ],
          });
        }
      },

      removeItem: (product_id) =>
        set({ items: get().items.filter(i => i.product_id !== product_id) }),

      updateQty: (product_id, qty) => {
        if (qty < 1) {
          set({ items: get().items.filter(i => i.product_id !== product_id) });
          return;
        }
        set({
          items: get().items.map(i =>
            i.product_id === product_id ? { ...i, qty } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((sum, i) => sum + Number(i.price) * i.qty, 0),

      getCount: () =>
        get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: 'medico-cart' }
  )
);
