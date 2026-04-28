import axios, { AxiosError, type AxiosInstance } from 'axios'
import { API_BASE_URL } from './endpoints'
import { ApiError, AuthError, NetworkError } from '@/lib/errors'

const TOKEN_STORAGE_KEY = 'auth-token'

/** Lê o token salvo no localStorage. Centralizado para fácil ajuste futuro. */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_STORAGE_KEY)
}

/** Persiste o token (ou remove se null). */
export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return
  if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
  else window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}

/**
 * Instância axios pré-configurada para a Fakestore API.
 *
 * - Anexa Authorization Bearer automaticamente quando há token
 * - Mapeia erros HTTP para classes da app (ApiError, AuthError, NetworkError)
 * - Loga erros não-401 no console (útil em dev)
 *
 * Sempre importe `api` em vez de criar nova instância — preserva interceptors.
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — anexa token Bearer
api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

// Response interceptor — converte erro do axios em classe tipada
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Sem resposta = problema de rede / timeout / DNS
    if (!error.response) {
      const isTimeout = error.code === 'ECONNABORTED'
      throw new NetworkError(
        isTimeout
          ? 'A requisição demorou demais. Verifique sua conexão.'
          : 'Servidor indisponível. Verifique sua conexão.',
        error,
      )
    }

    const { status, data } = error.response

    if (status === 401 || status === 403) {
      throw new AuthError(
        typeof data === 'string' ? data : 'Sessão expirada ou credenciais inválidas.',
        status,
        data,
        error,
      )
    }

    // Demais status (4xx, 5xx) — ApiError genérico
    const message =
      (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
        ? data.message
        : null) ?? error.message ?? `Erro HTTP ${status}`

    if (status >= 500) {
      console.error('[api] 5xx error:', { status, data, url: error.config?.url })
    }

    throw new ApiError(message, status, data, 'API_ERROR', error)
  },
)
