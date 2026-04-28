import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authService from '@/services/auth.service'
import { AuthError, NetworkError } from '@/lib/errors'
import { toast } from '@/lib/toast'
import type { AuthUser, Role } from '@/types/user'

interface AuthContextValue {
  user: AuthUser | null
  role: Role | null
  isAuthenticated: boolean
  login: (
    username: string,
    password: string,
  ) => Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'auth-user'

function readStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)

  useEffect(() => {
    if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else window.localStorage.removeItem(STORAGE_KEY)
  }, [user])

  const login = useCallback<AuthContextValue['login']>(async (username, password) => {
    try {
      const session = await authService.login(username, password)
      setUser(session.user)
      return { ok: true, user: session.user }
    } catch (err) {
      // Erros tipados → mensagens diferenciadas para a UI
      if (err instanceof AuthError) {
        return { ok: false, error: 'Usuário ou senha inválidos.' }
      }
      if (err instanceof NetworkError) {
        toast.error('Servidor indisponível', {
          description: 'Verifique sua conexão e tente novamente.',
        })
        return { ok: false, error: 'Servidor indisponível. Tente novamente.' }
      }
      // Erro inesperado — log + mensagem genérica
      console.error('[auth] login failed:', err)
      return { ok: false, error: 'Falha ao fazer login. Tente novamente.' }
    }
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
