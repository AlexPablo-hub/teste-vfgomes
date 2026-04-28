import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { login, logout } from './auth.service'
import { setStoredToken, getStoredToken } from './api/client'
import { AuthError, NetworkError } from '@/lib/errors'

const BASE = 'https://fakestoreapi.com'

describe('auth.service', () => {
  beforeEach(() => {
    setStoredToken(null)
  })

  it('login com credenciais válidas retorna token + user com role admin', async () => {
    const session = await login('mor_2314', '83r5^_')

    expect(session.token).toMatch(/^mock-token/)
    expect(session.user.username).toBe('mor_2314')
    expect(session.user.role).toBe('admin')
    // password NÃO deve vazar pro objeto retornado
    expect((session.user as Record<string, unknown>).password).toBeUndefined()
  })

  it('login resolve role cliente para usernames não-admin', async () => {
    const session = await login('kevinryan', 'kev02937@')
    expect(session.user.role).toBe('client')
  })

  it('login persiste o token no localStorage para próximas requests', async () => {
    expect(getStoredToken()).toBeNull()
    await login('mor_2314', '83r5^_')
    expect(getStoredToken()).toMatch(/^mock-token/)
  })

  it('login com credenciais inválidas lança AuthError e NÃO persiste token', async () => {
    const promise = login('mor_2314', 'senha-errada')
    await expect(promise).rejects.toBeInstanceOf(AuthError)
    expect(getStoredToken()).toBeNull()
  })

  it('login lança AuthError quando autentica mas user não está em /users', async () => {
    // Cenário anômalo: API aceita o login mas /users não retorna o user.
    // Ex: usuário recém-criado, ou inconsistência de cache da API.
    server.use(
      http.post(`${BASE}/auth/login`, () => HttpResponse.json({ token: 'orphan-token' })),
      http.get(`${BASE}/users`, () => HttpResponse.json([])),
    )

    const promise = login('ghost', 'whatever')
    await expect(promise).rejects.toBeInstanceOf(AuthError)
    // E deve limpar o token persistido para não deixar sessão "fantasma"
    expect(getStoredToken()).toBeNull()
  })

  it('login mapeia falha de rede para NetworkError', async () => {
    server.use(http.post(`${BASE}/auth/login`, () => HttpResponse.error()))
    await expect(login('mor_2314', '83r5^_')).rejects.toBeInstanceOf(NetworkError)
  })

  it('logout limpa o token persistido', async () => {
    setStoredToken('foo')
    expect(getStoredToken()).toBe('foo')
    logout()
    expect(getStoredToken()).toBeNull()
  })
})
