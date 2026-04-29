import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Product } from '@/types/product'

interface FavoritesState {
  /** Snapshot dos produtos favoritados — guardamos o objeto inteiro pra que o
   *  drawer mostre nome/preço/imagem mesmo se o produto sumir do catálogo. */
  items: Product[]
  isFavorite: (productId: number) => boolean
  toggle: (product: Product) => void
  remove: (productId: number) => void
  clear: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      isFavorite: (productId) => get().items.some((p) => p.id === productId),
      toggle: (product) =>
        set((s) => {
          const exists = s.items.some((p) => p.id === product.id)
          return {
            items: exists ? s.items.filter((p) => p.id !== product.id) : [...s.items, product],
          }
        }),
      remove: (productId) => set((s) => ({ items: s.items.filter((p) => p.id !== productId) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'fakestore-favorites',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)
