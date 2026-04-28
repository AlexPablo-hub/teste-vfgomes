import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function RootRedirect() {
  const { isAuthenticated, role } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={role === 'admin' ? '/admin/estoque' : '/products'} replace />
}
