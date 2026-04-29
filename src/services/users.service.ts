import { api } from './api/client'
import { ENDPOINTS } from './api/endpoints'
import type { FakestoreUser } from './api/types'
import type { Role, User, UserDraft } from '@/types/user'

/**
 * Mesma regra usada no auth.service.ts — README determina mor_2314 = admin,
 * resto = client. A Fakestore não tem campo `role` na resposta de /users.
 */
const ADMIN_USERNAMES = new Set(['mor_2314'])

function resolveRole(username: string): Role {
  return ADMIN_USERNAMES.has(username) ? 'admin' : 'client'
}

/**
 * Adapter: FakestoreUser → User doméstico (com role derivada).
 *
 * A senha vem da API (Fakestore retorna password em /users — péssima
 * prática real, mas é o contrato do mock). Mantemos no shape doméstico
 * porque o admin precisa visualizar/editar; pra exibição na UI sempre
 * filtramos antes.
 */
function fromApi(u: FakestoreUser): User {
  return {
    ...u,
    role: resolveRole(u.username),
  }
}

/** GET /users — lista todos os usuários. */
export async function list(): Promise<User[]> {
  const { data } = await api.get<FakestoreUser[]>(ENDPOINTS.users)
  return data.map(fromApi)
}

/** GET /users/:id — usuário individual. */
export async function getById(id: number): Promise<User> {
  const { data } = await api.get<FakestoreUser>(ENDPOINTS.user(id))
  return fromApi(data)
}

/** POST /users — Fakestore aceita mas não persiste; retorna echo com id fake. */
export async function create(draft: UserDraft): Promise<User> {
  // Removemos `role` do payload — Fakestore não conhece esse campo.
  const { role: _role, ...payload } = draft
  void _role
  const { data } = await api.post<FakestoreUser>(ENDPOINTS.users, payload)
  // role volta a ser derivada do username retornado pela API
  return fromApi(data)
}

/** PUT /users/:id — Fakestore aceita mas não persiste. */
export async function update(
  id: number,
  patch: Partial<UserDraft>,
): Promise<User> {
  const { role: _role, ...payload } = patch
  void _role
  const { data } = await api.put<FakestoreUser>(ENDPOINTS.user(id), payload)
  return fromApi(data)
}

/** DELETE /users/:id — Fakestore aceita mas não persiste. */
export async function remove(id: number): Promise<void> {
  await api.delete(ENDPOINTS.user(id))
}
