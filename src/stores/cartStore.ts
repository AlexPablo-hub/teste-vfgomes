import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Product } from '@/types/product'
import type { CartItem } from '@/types/cart'

interface CartState {
  items: CartItem[]
  add: (product: Product, quantity?: number) => void
  remove: (productId: number) => void
  setQuantity: (productId: number, quantity: number) => void
  increment: (productId: number) => void
  decrement: (productId: number) => void
  clear: () => void
  totalItems: () => number
  subtotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product, quantity = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.product.id === product.id)
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            }
          }
          return { items: [...s.items, { product, quantity }] }
        }),
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.product.id !== productId) })),
      setQuantity: (productId, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.product.id !== productId)
              : s.items.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
        })),
      increment: (productId) =>
        set((s) => ({
          items: s.items.map((i) => (i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i)),
        })),
      decrement: (productId) =>
        set((s) => {
          const item = s.items.find((i) => i.product.id === productId)
          if (!item) return s
          if (item.quantity <= 1) return { items: s.items.filter((i) => i.product.id !== productId) }
          return {
            items: s.items.map((i) => (i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i)),
          }
        }),
      clear: () => set({ items: [] }),
      totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      subtotal: () => get().items.reduce((acc, i) => acc + i.product.price * i.quantity, 0),
    }),
    {
      name: 'fakestore-cart',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)
