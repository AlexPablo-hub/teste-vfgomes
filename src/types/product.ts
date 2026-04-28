export interface ProductRating {
  rate: number
  count: number
}

export interface Product {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating: ProductRating
  /** Estoque disponível — usado no admin (não existe na Fakestore API, é mock local). */
  stock?: number
  /** Identificador interno NOIR_LUXE — derivado do id se ausente. */
  sku?: string
}

export type ProductDraft = Omit<Product, 'id' | 'rating'> & {
  rating?: ProductRating
}

/** Threshold do badge "Estoque baixo" no admin. */
export const LOW_STOCK_THRESHOLD = 5

export function formatSku(p: { id: number; sku?: string }): string {
  return p.sku ?? `NL-${String(p.id).padStart(4, '0')}`
}

export function stockStatus(p: Product): 'in-stock' | 'low' | 'out' {
  const s = p.stock ?? 99
  if (s <= 0) return 'out'
  if (s <= LOW_STOCK_THRESHOLD) return 'low'
  return 'in-stock'
}
