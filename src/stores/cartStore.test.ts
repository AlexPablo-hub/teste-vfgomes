import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from './cartStore'
import type { Product } from '@/types/product'

const productA: Product = {
  id: 1,
  title: 'Produto A',
  price: 100,
  description: 'desc',
  category: 'electronics',
  image: '/x.jpg',
  rating: { rate: 4.5, count: 10 },
}

const productB: Product = {
  id: 2,
  title: 'Produto B',
  price: 50,
  description: 'desc',
  category: 'jewelery',
  image: '/y.jpg',
  rating: { rate: 4.0, count: 5 },
}

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clear()
  })

  it('adiciona um produto novo cria uma linha com qty 1', () => {
    useCartStore.getState().add(productA)
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0]).toMatchObject({
      product: { id: 1 },
      quantity: 1,
    })
  })

  it('adicionar o mesmo produto duas vezes incrementa qty na linha existente', () => {
    useCartStore.getState().add(productA)
    useCartStore.getState().add(productA)
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0].quantity).toBe(2)
  })

  it('adicionar dois produtos distintos cria duas linhas', () => {
    useCartStore.getState().add(productA)
    useCartStore.getState().add(productB)
    expect(useCartStore.getState().items).toHaveLength(2)
  })

  it('increment/decrement ajustam a quantidade', () => {
    useCartStore.getState().add(productA)
    useCartStore.getState().increment(productA.id)
    expect(useCartStore.getState().items[0].quantity).toBe(2)
    useCartStore.getState().decrement(productA.id)
    expect(useCartStore.getState().items[0].quantity).toBe(1)
  })

  it('decrement em quantity 1 remove o item', () => {
    useCartStore.getState().add(productA)
    useCartStore.getState().decrement(productA.id)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('setQuantity 0 remove o item', () => {
    useCartStore.getState().add(productA, 3)
    useCartStore.getState().setQuantity(productA.id, 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('subtotal soma price * quantity de cada linha', () => {
    useCartStore.getState().add(productA, 2) // 200
    useCartStore.getState().add(productB, 1) // 50
    expect(useCartStore.getState().subtotal()).toBe(250)
  })

  it('remove tira a linha inteira independente da quantidade', () => {
    useCartStore.getState().add(productA, 5)
    useCartStore.getState().remove(productA.id)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('clear esvazia o carrinho', () => {
    useCartStore.getState().add(productA)
    useCartStore.getState().add(productB)
    useCartStore.getState().clear()
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})
