import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { api, getStoredToken, setStoredToken } from './client'
import { ApiError, AuthError, NetworkError } from '@/lib/errors'

const BASE = 'https://fakestoreapi.com'

describe('api client', () => {
  beforeEach(() => {
    setStoredToken(null)
  })

  it('anexa Authorization Bearer quando token está no localStorage', async () => {
    setStoredToken('xyz-123')

    let receivedAuth: string | null = null
    server.use(
      http.get(`${BASE}/echo-auth`, ({ request }) => {
        receivedAuth = request.headers.get('Authorization')
        return HttpResponse.json({ ok: true })
      }),
    )

    await api.get('/echo-auth')
    expect(receivedAuth).toBe('Bearer xyz-123')
  })

  it('não anexa Authorization quando não há token', async () => {
    let receivedAuth: string | null = null
    server.use(
      http.get(`${BASE}/echo-auth-2`, ({ request }) => {
        receivedAuth = request.headers.get('Authorization')
        return HttpResponse.json({ ok: true })
      }),
    )

    await api.get('/echo-auth-2')
    expect(receivedAuth).toBeNull()
  })

  it('mapeia 401 → AuthError', async () => {
    server.use(
      http.get(`${BASE}/secret`, () =>
        HttpResponse.json({ message: 'unauthorized' }, { status: 401 }),
      ),
    )

    await expect(api.get('/secret')).rejects.toThrow(AuthError)
    await expect(api.get('/secret')).rejects.toMatchObject({
      status: 401,
      code: 'AUTH_ERROR',
    })
  })

  it('mapeia 403 → AuthError', async () => {
    server.use(
      http.get(`${BASE}/forbidden`, () => new HttpResponse(null, { status: 403 })),
    )

    await expect(api.get('/forbidden')).rejects.toBeInstanceOf(AuthError)
  })

  it('mapeia 500 → ApiError (não AuthError)', async () => {
    server.use(
      http.get(`${BASE}/boom`, () =>
        HttpResponse.json({ message: 'server crashed' }, { status: 500 }),
      ),
    )

    const err = await api.get('/boom').catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err).not.toBeInstanceOf(AuthError)
    expect(err.status).toBe(500)
  })

  it('mapeia falha de rede → NetworkError', async () => {
    server.use(http.get(`${BASE}/dead`, () => HttpResponse.error()))

    await expect(api.get('/dead')).rejects.toBeInstanceOf(NetworkError)
  })

  it('getStoredToken retorna null quando vazio', () => {
    expect(getStoredToken()).toBeNull()
  })

  it('setStoredToken persiste e remove', () => {
    setStoredToken('abc')
    expect(getStoredToken()).toBe('abc')
    setStoredToken(null)
    expect(getStoredToken()).toBeNull()
  })
})
