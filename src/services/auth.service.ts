import { api, setStoredToken } from './api/client'
import { ENDPOINTS } from './api/endpoints'
import type { FakestoreLoginResponse, FakestoreUser } from './api/types'
import { AuthError } from '@/lib/errors'
import type { AuthUser, Role } from '@/types/user'

/**
 * Mapeia username → role conforme exigência do README:
 *   "dentro da rota GET de usuários eu quero se seja simulado 2 tipos,
 *    um como administrador e o outro como cliente"
 *
 * A Fakestore API não tem campo `role`. As contas obrigatórias do README:
 *  - mor_2314 → admin
 *  - kevinryan → cliente
 *  Demais usuários da API → cliente por default.
 */
const ADMIN_USERNAMES = new Set(['mor_2314'])

function resolveRole(username: string): Role {
  return ADMIN_USERNAMES.has(username) ? 'admin' : 'client'
}

export interface AuthSession {
  token: string
  user: AuthUser
}

/**
 * Faz login contra a Fakestore API.
 *
 * Fluxo:
 * 1. POST /auth/login → recebe { token }
 * 2. Persiste o token no localStorage (interceptor do axios passa a anexar Bearer)
 * 3. GET /users → busca o usuário pelo username (a API não tem /users/me)
 * 4. Resolve role via mapa
 * 5. Retorna { token, user } com password removido
 *
 * Lança AuthError se credenciais inválidas (401) ou se o user não existir
 * em /users após login bem-sucedido (caso anômalo da API).
 */
export async function login(username: string, password: string): Promise<AuthSession> {
  const trimmed = username.trim()
  // POST /auth/login (axios interceptor mapeia 401 → AuthError automaticamente)
  const { data } = await api.post<FakestoreLoginResponse>(ENDPOINTS.authLogin, {
    username: trimmed,
    password,
  })

  // Persiste o token antes de chamar /users — interceptor já vai anexar Bearer
  setStoredToken(data.token)

  // Busca dados do user. Fakestore não tem /users/me, então listamos e filtramos
  const { data: users } = await api.get<FakestoreUser[]>(ENDPOINTS.users)
  const apiUser = users.find((u) => u.username === trimmed)

  if (!apiUser) {
    setStoredToken(null)
    throw new AuthError('Conta autenticada mas sem dados em /users.', 401)
  }

  const { password: _pw, ...safe } = apiUser
  void _pw
  const user: AuthUser = { ...safe, role: resolveRole(trimmed) }

  return { token: data.token, user }
}

/** Limpa o token persistido. Chamado pelo logout. */
export function logout(): void {
  setStoredToken(null)
}
