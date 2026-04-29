import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import * as usersService from './users.service'
import { ApiError, NetworkError } from '@/lib/errors'

const BASE = 'https://fakestoreapi.com'

describe('users.service', () => {
  describe('list', () => {
    it('retorna usuários da API mapeados para User doméstico com role resolvida', async () => {
      const users = await usersService.list()

      expect(users).toHaveLength(2)

      // mor_2314 é mapeado para admin (regra do README)
      const admin = users.find((u) => u.username === 'mor_2314')
      expect(admin?.role).toBe('admin')

      // kevinryan é mapeado para client
      const client = users.find((u) => u.username === 'kevinryan')
      expect(client?.role).toBe('client')
    })

    it('lança NetworkError quando a API está fora', async () => {
      server.use(http.get(`${BASE}/users`, () => HttpResponse.error()))
      await expect(usersService.list()).rejects.toBeInstanceOf(NetworkError)
    })

    it('lança ApiError em 500', async () => {
      server.use(
        http.get(`${BASE}/users`, () => HttpResponse.json({ message: 'down' }, { status: 500 })),
      )
      await expect(usersService.list()).rejects.toBeInstanceOf(ApiError)
    })
  })

  describe('getById', () => {
    it('retorna usuário individual', async () => {
      const u = await usersService.getById(2)
      expect(u).toMatchObject({ id: 2, username: 'kevinryan', role: 'client' })
    })

    it('lança ApiError em 404', async () => {
      const err = await usersService.getById(999).catch((e) => e)
      expect(err).toBeInstanceOf(ApiError)
      expect(err.status).toBe(404)
    })
  })

  describe('create', () => {
    it('faz POST e retorna usuário criado com role derivada', async () => {
      let postedBody: Record<string, unknown> | null = null
      server.use(
        http.post(`${BASE}/users`, async ({ request }) => {
          postedBody = (await request.json()) as Record<string, unknown>
          return HttpResponse.json({
            id: 99,
            email: 'novo@test.com',
            username: 'novo_user',
            password: 'secret',
            name: { firstname: 'Novo', lastname: 'User' },
            address: {
              city: 'Rio',
              street: 'X',
              number: 1,
              zipcode: '00000-000',
              geolocation: { lat: '0', long: '0' },
            },
            phone: '1234',
          })
        }),
      )

      const created = await usersService.create({
        email: 'novo@test.com',
        username: 'novo_user',
        password: 'secret',
        name: { firstname: 'Novo', lastname: 'User' },
        address: {
          city: 'Rio',
          street: 'X',
          number: 1,
          zipcode: '00000-000',
          geolocation: { lat: '0', long: '0' },
        },
        phone: '1234',
        role: 'client',
      })

      expect(created.username).toBe('novo_user')
      expect(created.role).toBe('client')
      // role NÃO deve ser enviada no payload — Fakestore não conhece esse campo
      expect(postedBody).not.toHaveProperty('role')
    })
  })

  describe('update', () => {
    it('faz PUT no usuário', async () => {
      const updated = await usersService.update(1, { phone: '99999' })
      expect(updated.id).toBe(1)
    })

    it('não envia campo role no payload do PUT', async () => {
      let putBody: Record<string, unknown> | null = null
      server.use(
        http.put(`${BASE}/users/:id`, async ({ params, request }) => {
          putBody = (await request.json()) as Record<string, unknown>
          return HttpResponse.json({
            id: Number(params.id),
            email: 'a@a',
            username: 'mor_2314',
            password: 'p',
            name: { firstname: 'A', lastname: 'B' },
            address: {
              city: '',
              street: '',
              number: 0,
              zipcode: '',
              geolocation: { lat: '0', long: '0' },
            },
            phone: '',
            ...putBody,
          })
        }),
      )

      await usersService.update(1, { phone: '123', role: 'admin' })

      expect(putBody).toMatchObject({ phone: '123' })
      expect(putBody).not.toHaveProperty('role')
    })
  })

  describe('remove', () => {
    it('faz DELETE e resolve sem retorno', async () => {
      await expect(usersService.remove(1)).resolves.toBeUndefined()
    })

    it('lança ApiError em 404', async () => {
      const err = await usersService.remove(99999).catch((e) => e)
      expect(err).toBeInstanceOf(ApiError)
      expect(err.status).toBe(404)
    })
  })
})
