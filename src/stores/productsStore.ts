import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Product, ProductDraft } from '@/types/product'
import { mockProducts } from '@/data/mocks'

interface ProductsState {
  products: Product[]
  add: (draft: ProductDraft) => Product
  update: (id: number, patch: Partial<ProductDraft>) => void
  remove: (id: number) => void
  reset: () => void
}

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: mockProducts,
      add: (draft) => {
        const id = Math.max(0, ...get().products.map((p) => p.id)) + 1
        const created: Product = {
          id,
          rating: draft.rating ?? { rate: 0, count: 0 },
          ...draft,
        }
        set((s) => ({ products: [...s.products, created] }))
        return created
      },
      update: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      remove: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
      reset: () => set({ products: mockProducts }),
    }),
    {
      name: 'fakestore-products',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)
