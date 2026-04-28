import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/types/user'

interface RequireAuthProps {
  children: ReactNode
  role?: Role
}

export function RequireAuth({ children, role }: RequireAuthProps) {
  const { isAuthenticated, role: currentRole } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (role && currentRole !== role) {
    const fallback = currentRole === 'admin' ? '/admin/estoque' : '/products'
    return <Navigate to={fallback} replace />
  }

  return <>{children}</>
}
