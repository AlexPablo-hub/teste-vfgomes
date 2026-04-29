import { describe, it, expect, beforeEach } from 'vitest'
import { useFavoritesStore } from './favoritesStore'
import type { Product } from '@/types/product'

const product: Product = {
  id: 42,
  title: 'Test',
  price: 10,
  description: 'desc',
  category: 'electronics',
  image: '/x.jpg',
  rating: { rate: 4.0, count: 1 },
}

describe('favoritesStore', () => {
  beforeEach(() => {
    useFavoritesStore.getState().clear()
  })

  it('isFavorite retorna false para produto não favoritado', () => {
    expect(useFavoritesStore.getState().isFavorite(42)).toBe(false)
  })

  it('toggle adiciona produto se não está favoritado', () => {
    useFavoritesStore.getState().toggle(product)
    expect(useFavoritesStore.getState().items).toHaveLength(1)
    expect(useFavoritesStore.getState().isFavorite(42)).toBe(true)
  })

  it('toggle remove produto se já está favoritado', () => {
    useFavoritesStore.getState().toggle(product)
    useFavoritesStore.getState().toggle(product)
    expect(useFavoritesStore.getState().items).toHaveLength(0)
    expect(useFavoritesStore.getState().isFavorite(42)).toBe(false)
  })

  it('remove tira o produto da lista', () => {
    useFavoritesStore.getState().toggle(product)
    useFavoritesStore.getState().remove(42)
    expect(useFavoritesStore.getState().items).toHaveLength(0)
  })

  it('clear esvazia a lista', () => {
    useFavoritesStore.getState().toggle(product)
    useFavoritesStore.getState().clear()
    expect(useFavoritesStore.getState().items).toHaveLength(0)
  })
})
