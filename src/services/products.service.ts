import { api } from './api/client'
import { ENDPOINTS } from './api/endpoints'
import type { FakestoreProduct } from './api/types'
import type { Product, ProductDraft } from '@/types/product'

/**
 * Adapter: converte produto da Fakestore API para o tipo doméstico Product.
 *
 * A API não tem `stock` nem `sku` — esses campos são extensões NOIR LUXE
 * usadas no admin. Ficam undefined ao trazer da API; o store local
 * preserva-os quando aplicáveis.
 */
function fromApi(p: FakestoreProduct): Product {
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    description: p.description,
    category: p.category,
    image: p.image,
    rating: p.rating,
  }
}

/** GET /products — lista todos os produtos. */
export async function list(): Promise<Product[]> {
  const { data } = await api.get<FakestoreProduct[]>(ENDPOINTS.products)
  return data.map(fromApi)
}

/** GET /products/:id — produto individual. */
export async function getById(id: number): Promise<Product> {
  const { data } = await api.get<FakestoreProduct>(ENDPOINTS.product(id))
  return fromApi(data)
}

/** POST /products — Fakestore aceita mas não persiste; retorna echo com id fake. */
export async function create(draft: ProductDraft): Promise<Product> {
  const { data } = await api.post<FakestoreProduct>(ENDPOINTS.products, {
    title: draft.title,
    price: draft.price,
    description: draft.description,
    category: draft.category,
    image: draft.image,
  })
  return fromApi(data)
}

/** PUT /products/:id — Fakestore aceita mas não persiste. */
export async function update(
  id: number,
  patch: Partial<ProductDraft>,
): Promise<Product> {
  const { data } = await api.put<FakestoreProduct>(ENDPOINTS.product(id), patch)
  return fromApi(data)
}

/** DELETE /products/:id — Fakestore aceita mas não persiste. */
export async function remove(id: number): Promise<void> {
  await api.delete(ENDPOINTS.product(id))
}
