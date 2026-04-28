import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/types/user'

interface RequireAuthProps {
  children: ReactNode
  /** Role mínima exigida pela rota. Admin pode acessar rotas de cliente. */
  role?: Role
}

/**
 * Guard de rota com hierarquia de papéis:
 *  - role='admin' → exige role admin (clientes são bloqueados)
 *  - role='client' → admin OU client podem entrar (admin tem acesso amplo)
 *  - sem role → basta estar autenticado
 *
 * Quando bloqueia, redireciona para a home da role atual em vez de devolver
 * 403 — fluxo mais natural num e-commerce SPA.
 */
export function RequireAuth({ children, role }: RequireAuthProps) {
  const { isAuthenticated, role: currentRole } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // Bloqueia apenas quando a rota EXIGE admin e o usuário não é admin.
  if (role === 'admin' && currentRole !== 'admin') {
    return <Navigate to="/products" replace />
  }

  return <>{children}</>
}
