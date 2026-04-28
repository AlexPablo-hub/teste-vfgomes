import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useUsersStore } from '@/stores/usersStore'
import type { AuthUser, Role } from '@/types/user'

interface AuthContextValue {
  user: AuthUser | null
  role: Role | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }>
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
  const findUserByCredentials = useUsersStore((s) => s.findByCredentials)

  useEffect(() => {
    if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else window.localStorage.removeItem(STORAGE_KEY)
  }, [user])

  const login = useCallback<AuthContextValue['login']>(
    async (username, password) => {
      // Pequeno delay para simular requisição e dar feedback visual
      await new Promise((r) => setTimeout(r, 400))
      const found = findUserByCredentials(username.trim(), password)
      if (!found) {
        return { ok: false, error: 'Usuário ou senha inválidos.' }
      }
      const { password: _pw, ...safe } = found
      void _pw
      setUser(safe)
      return { ok: true, user: safe }
    },
    [findUserByCredentials],
  )

  const logout = useCallback(() => setUser(null), [])

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
