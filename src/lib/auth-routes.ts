import type { Role } from '@/types/user'

/** Rota inicial padrão de cada role após login. */
export const ROLE_HOME: Record<Role, string> = {
  admin: '/admin/estoque',
  client: '/products',
}

/** Verifica se um path é uma rota administrativa. */
export function isAdminPath(pathname: string): boolean {
  return pathname.startsWith('/admin')
}

/**
 * Resolve para qual rota mandar o usuário após login.
 *
 * Regra de segurança: se houver `from` (deep-link / redirect-back via
 * RequireAuth), só respeita se a rota for compatível com a role —
 * evita que um cliente caia em /admin/* (e vice-versa) só porque tentou
 * acessar a URL antes de autenticar.
 *
 * Fallback: rota inicial da role (ROLE_HOME).
 */
export function resolveTarget(role: Role, from?: string | null): string {
  const home = ROLE_HOME[role]
  if (!from) return home

  const adminRoute = isAdminPath(from)
  const matchesRole =
    (role === 'admin' && adminRoute) || (role === 'client' && !adminRoute)

  return matchesRole ? from : home
}
