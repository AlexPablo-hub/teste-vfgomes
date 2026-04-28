import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { server } from '@/test/mocks/server'
import { AuthProvider } from './AuthContext'
import { useAuth } from '@/hooks/useAuth'
import { setStoredToken } from '@/services/api/client'

const BASE = 'https://fakestoreapi.com'

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('AuthContext', () => {
  beforeEach(() => {
    setStoredToken(null)
  })

  it('estado inicial: não autenticado', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.role).toBeNull()
  })

  it('login bem-sucedido atualiza user, role e isAuthenticated', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    let response: Awaited<ReturnType<typeof result.current.login>> | undefined
    await act(async () => {
      response = await result.current.login('mor_2314', '83r5^_')
    })

    expect(response).toEqual({ ok: true, user: expect.any(Object) })
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.role).toBe('admin')
      expect(result.current.user?.username).toBe('mor_2314')
    })
  })

  it('login com credencial inválida retorna ok:false e mantém deslogado', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    let response: Awaited<ReturnType<typeof result.current.login>> | undefined
    await act(async () => {
      response = await result.current.login('mor_2314', 'senha-errada')
    })

    expect(response).toEqual({ ok: false, error: expect.stringMatching(/inválid/i) })
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('login com NetworkError retorna ok:false com mensagem de servidor', async () => {
    server.use(http.post(`${BASE}/auth/login`, () => HttpResponse.error()))

    const { result } = renderHook(() => useAuth(), { wrapper })

    let response: Awaited<ReturnType<typeof result.current.login>> | undefined
    await act(async () => {
      response = await result.current.login('mor_2314', '83r5^_')
    })

    expect(response).toEqual({ ok: false, error: expect.stringMatching(/indisponível/i) })
  })

  it('logout limpa user e localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login('kevinryan', 'kev02937@')
    })
    expect(result.current.isAuthenticated).toBe(true)

    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(window.localStorage.getItem('auth-user')).toBeNull()
    expect(window.localStorage.getItem('auth-token')).toBeNull()
  })
})
