import { describe, it, expect } from 'vitest'
import {
  productCategories,
  categoryLabels,
  getCategoryLabel,
  mockProducts,
  mockUsers,
} from './mocks'

describe('mocks data', () => {
  it('exporta exatamente os 4 slugs da Fakestore API', () => {
    expect(productCategories).toEqual([
      'electronics',
      'jewelery',
      "men's clothing",
      "women's clothing",
    ])
  })

  it('todos os slugs têm label PT-BR mapeada', () => {
    for (const slug of productCategories) {
      expect(categoryLabels[slug]).toBeTruthy()
      expect(typeof categoryLabels[slug]).toBe('string')
    }
  })

  it('getCategoryLabel devolve label conhecida', () => {
    expect(getCategoryLabel('electronics')).toBe('Eletrônicos')
    expect(getCategoryLabel('jewelery')).toBe('Joias')
    expect(getCategoryLabel("men's clothing")).toBe('Roupas masculinas')
    expect(getCategoryLabel("women's clothing")).toBe('Roupas femininas')
  })

  it('getCategoryLabel devolve o slug se não conhecido (fallback)', () => {
    expect(getCategoryLabel('outro')).toBe('outro')
  })

  it('todos os mockProducts usam categorias válidas', () => {
    const valid = new Set(productCategories)
    for (const p of mockProducts) {
      expect(valid.has(p.category as (typeof productCategories)[number])).toBe(true)
    }
  })

  it('mockUsers contém as 2 contas exigidas pelo README', () => {
    const usernames = mockUsers.map((u) => u.username)
    expect(usernames).toContain('mor_2314')
    expect(usernames).toContain('kevinryan')

    const admin = mockUsers.find((u) => u.username === 'mor_2314')
    expect(admin?.password).toBe('83r5^_')
    expect(admin?.role).toBe('admin')

    const client = mockUsers.find((u) => u.username === 'kevinryan')
    expect(client?.password).toBe('kev02937@')
    expect(client?.role).toBe('client')
  })
})
