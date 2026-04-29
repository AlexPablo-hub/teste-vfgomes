import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import * as productsService from './products.service'
import { ApiError, NetworkError } from '@/lib/errors'

const BASE = 'https://fakestoreapi.com'

describe('products.service', () => {
  describe('list', () => {
    it('retorna produtos da API mapeados pra Product doméstico', async () => {
      const products = await productsService.list()
      expect(products).toHaveLength(2)
      expect(products[0]).toMatchObject({
        id: 1,
        title: 'Test Product',
        price: 29.9,
        category: "men's clothing",
      })
      // stock e sku NÃO existem na API; ficam undefined no domínio
      expect(products[0].stock).toBeUndefined()
      expect(products[0].sku).toBeUndefined()
    })

    it('lança NetworkError quando a API está fora', async () => {
      server.use(http.get(`${BASE}/products`, () => HttpResponse.error()))
      await expect(productsService.list()).rejects.toBeInstanceOf(NetworkError)
    })

    it('lança ApiError em 500', async () => {
      server.use(
        http.get(`${BASE}/products`, () =>
          HttpResponse.json({ message: 'down' }, { status: 500 }),
        ),
      )
      await expect(productsService.list()).rejects.toBeInstanceOf(ApiError)
    })
  })

  describe('getById', () => {
    it('retorna produto individual', async () => {
      const p = await productsService.getById(2)
      expect(p).toMatchObject({ id: 2, title: 'Another Product' })
    })

    it('lança ApiError em 404', async () => {
      const err = await productsService.getById(999).catch((e) => e)
      expect(err).toBeInstanceOf(ApiError)
      expect(err.status).toBe(404)
    })
  })

  describe('create', () => {
    it('faz POST e retorna o produto criado (echo da API)', async () => {
      const created = await productsService.create({
        title: 'Novo',
        price: 99,
        description: 'desc',
        category: 'electronics',
        image: 'https://example.com/x.jpg',
      })
      expect(created).toMatchObject({
        id: expect.any(Number),
        title: 'Novo',
        price: 99,
        category: 'electronics',
      })
    })

    it('envia o payload correto no body do POST', async () => {
      let received: unknown = null
      server.use(
        http.post(`${BASE}/products`, async ({ request }) => {
          received = await request.json()
          return HttpResponse.json({
            id: 999,
            title: 'echo',
            price: 0,
            description: '',
            category: '',
            image: '',
            rating: { rate: 0, count: 0 },
          })
        }),
      )

      await productsService.create({
        title: 'Mochila',
        price: 250,
        description: 'desc',
        category: 'jewelery',
        image: '/img/m.jpg',
      })

      expect(received).toMatchObject({
        title: 'Mochila',
        price: 250,
        category: 'jewelery',
      })
    })
  })

  describe('update', () => {
    it('faz PUT no produto', async () => {
      const updated = await productsService.update(1, { price: 199 })
      expect(updated).toMatchObject({ id: 1, price: 199 })
    })
  })

  describe('remove', () => {
    it('faz DELETE e resolve sem retorno', async () => {
      await expect(productsService.remove(1)).resolves.toBeUndefined()
    })

    it('lança ApiError em 404', async () => {
      const err = await productsService.remove(99999).catch((e) => e)
      expect(err).toBeInstanceOf(ApiError)
      expect(err.status).toBe(404)
    })
  })
})
